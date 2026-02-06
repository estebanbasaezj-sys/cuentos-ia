import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateStoryText, generatePageImage, downloadAndSaveImage } from '@/lib/openai';
import { moderateText } from '@/lib/moderation';
import { buildImagePrompt } from '@/lib/prompts';
import type { Story } from '@/types';

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

    // Fire and forget - async generation runs in background
    generateStoryAsync(storyId, story).catch(async (err) => {
      console.error('Generation failed:', err);
      await db.run(
        'UPDATE stories SET status = ?, error_message = ? WHERE id = ?',
        'failed', err.message || 'Error desconocido durante la generación', storyId
      );
    });

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

  // Step 2: Generate images
  await db.run('UPDATE stories SET status = ? WHERE id = ?', 'generating_images', storyId);

  const totalPages = storyContent.paginas.length;

  for (let i = 0; i < totalPages; i++) {
    const page = storyContent.paginas[i];

    const imagePrompt = buildImagePrompt({
      sceneDescription: page.descripcion_escena,
      childName: story.child_name,
      ageGroup: story.child_age_group,
      pageNumber: page.numero,
    });

    let localPath: string | null = null;

    try {
      const imageUrl = await generatePageImage({
        sceneDescription: page.descripcion_escena,
        childName: story.child_name,
        ageGroup: story.child_age_group,
        pageNumber: page.numero,
      });

      if (imageUrl) {
        localPath = await downloadAndSaveImage(imageUrl, storyId, page.numero);
      }
    } catch (imgErr) {
      console.error(`Image generation failed for page ${page.numero}:`, imgErr);
      // Continue without image - not critical
    }

    await db.run(
      'INSERT INTO pages (id, story_id, page_number, text, image_url, image_prompt) VALUES (?, ?, ?, ?, ?, ?)',
      uuid(), storyId, page.numero, page.texto, localPath, imagePrompt
    );

    const progress = 30 + Math.round(((i + 1) / totalPages) * 70);
    await db.run('UPDATE stories SET generation_progress = ? WHERE id = ?', progress, storyId);
  }

  // Done
  await db.run('UPDATE stories SET status = ?, generation_progress = 100 WHERE id = ?', 'ready', storyId);
}
