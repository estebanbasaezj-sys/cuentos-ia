import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generatePageImage, downloadAndSaveImage } from '@/lib/openai';
import { canRegenerateImage } from '@/lib/feature-gate';
import { deductCredits } from '@/lib/wallet';
import { CREDIT_COSTS } from '@/lib/monetization';
import { getOrCreateWallet } from '@/lib/wallet';
import type { Story, Page } from '@/types';

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const story = await db.get<Story>('SELECT * FROM stories WHERE id = ?', params.storyId);
    if (!story || story.user_id !== userId) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    // Check if user can regenerate
    const gate = await canRegenerateImage(userId);
    if (!gate.allowed) {
      return NextResponse.json(
        { error: 'Creditos insuficientes', gate },
        { status: 403 }
      );
    }

    const { pageId } = await req.json();
    const page = await db.get<Page>('SELECT * FROM pages WHERE id = ? AND story_id = ?', pageId, params.storyId);
    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    // Use art style from story traits
    const traits = story.traits ? JSON.parse(story.traits) : {};

    const imageUrl = await generatePageImage({
      sceneDescription: page.image_prompt || page.text.substring(0, 200),
      childName: story.child_name,
      ageGroup: story.child_age_group,
      pageNumber: page.page_number,
      artStyle: traits.artStyle,
      colorPalette: traits.colorPalette,
    });

    const localPath = await downloadAndSaveImage(imageUrl, params.storyId, page.page_number);

    await db.run("UPDATE pages SET image_url = ?, updated_at = datetime('now') WHERE id = ?", localPath, pageId);

    // Deduct credits for premium users
    const wallet = await getOrCreateWallet(userId);
    if (wallet.plan_type === 'premium') {
      await deductCredits(userId, CREDIT_COSTS.generateImageHigh, 'regen_image', params.storyId, `Regenerar imagen pagina ${page.page_number}`);
    }

    return NextResponse.json({ imageUrl: localPath });
  } catch (error) {
    console.error('Regenerate image error:', error);
    return NextResponse.json({ error: 'Error al regenerar imagen' }, { status: 500 });
  }
}
