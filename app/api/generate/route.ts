import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuid } from 'uuid';
import { waitUntil } from '@vercel/functions';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateStoryText, generateAllImagesParallel, downloadAndSaveImage } from '@/lib/openai';
import { moderateText } from '@/lib/moderation';
import { buildImagePrompt } from '@/lib/prompts';
import type { Story } from '@/types';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { storyId } = await req.json();
    const story = await db.get<Story>('SELECT * FROM stories WHERE id = ?', storyId);

    if (!story || story.status !== 'queued') {
      return NextResponse.json({ error: 'Cuento inválido o ya en proceso' }, { status: 400 });
    }

    // Update to generating
    await db.run('UPDATE stories SET status = ?, generation_progress = 5 WHERE id = ?', 'generating_text', storyId);

    // Use waitUntil to keep the function alive on Vercel after response is sent
    const generationPromise = generateStoryAsync(storyId, story).catch(async (err) => {
      console.error('Generation failed:', err);
      await db.run(
        'UPDATE stories SET status = ?, error_message = ? WHERE id = ?',
        'failed', err.message || 'Error desconocido durante la generación', storyId
      );
    });
    waitUntil(generationPromise);

    return NextResponse.json({ jobId: storyId }, { status: 202 });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function generateStoryAsync(storyId: string, story: Story) {
  // Step 1: Generate text
  await db.run('UPDATE stories SET status = ?, generation_progress = 10 WHERE id = ?', 'generating_text', storyId);

  const traits = story.traits ? JSON.parse(story.traits) : undefined;
  const storyContent = await generateStoryText({
    childName: story.child_name,
    ageGroup: story.child_age_group,
    theme: story.theme,
    tone: story.tone,
    length: story.length,
    traits,
  });

  // Moderate output
  const allText = storyContent.paginas.map((p) => p.texto).join(' ');
  const modResult = moderateText(allText);
  if (!modResult.safe) {
    throw new Error('El contenido generado no pasó los filtros de seguridad. Intenta con otro tema.');
  }

  // Save title
  await db.run('UPDATE stories SET title = ?, generation_progress = 30 WHERE id = ?', storyContent.titulo, storyId);

  // Step 2: Generate images in PARALLEL for speed
  await db.run('UPDATE stories SET status = ?, generation_progress = 40 WHERE id = ?', 'generating_images', storyId);

  // Extract art style and color palette from traits if available
  const artStyle = traits?.artStyle;
  const colorPalette = traits?.colorPalette;

  // Prepare all pages for parallel generation
  const imageRequests = storyContent.paginas.map((page) => ({
    sceneDescription: page.descripcion_escena,
    childName: story.child_name,
    ageGroup: story.child_age_group,
    pageNumber: page.numero,
    artStyle,
    colorPalette,
  }));

  // Generate ALL images in parallel (much faster!)
  const imageResults = await generateAllImagesParallel(imageRequests);

  await db.run('UPDATE stories SET generation_progress = 80 WHERE id = ?', storyId);

  // Download and save all images, then insert pages
  for (const page of storyContent.paginas) {
    const imageResult = imageResults.find((r) => r.pageNumber === page.numero);
    let localPath: string | null = null;

    if (imageResult?.url) {
      try {
        localPath = await downloadAndSaveImage(imageResult.url, storyId, page.numero);
      } catch (downloadErr) {
        console.error(`Image download failed for page ${page.numero}:`, downloadErr);
        // Use the original DALL-E URL as fallback
        localPath = imageResult.url;
      }
    }

    const imagePrompt = buildImagePrompt({
      sceneDescription: page.descripcion_escena,
      childName: story.child_name,
      ageGroup: story.child_age_group,
      pageNumber: page.numero,
      artStyle,
      colorPalette,
    });

    await db.run(
      'INSERT INTO pages (id, story_id, page_number, text, image_url, image_prompt) VALUES (?, ?, ?, ?, ?, ?)',
      uuid(), storyId, page.numero, page.texto, localPath, imagePrompt
    );
  }

  // Done
  await db.run('UPDATE stories SET status = ?, generation_progress = 100 WHERE id = ?', 'ready', storyId);
}
