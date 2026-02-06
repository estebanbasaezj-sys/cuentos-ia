import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generatePageImage, downloadAndSaveImage } from '@/lib/openai';
import type { Story, Page } from '@/types';

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const story = await db.get<Story>('SELECT * FROM stories WHERE id = ?', params.storyId);
    if (!story || story.user_id !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const { pageId } = await req.json();
    const page = await db.get<Page>('SELECT * FROM pages WHERE id = ? AND story_id = ?', pageId, params.storyId);
    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    const imageUrl = await generatePageImage({
      sceneDescription: page.text.substring(0, 200),
      childName: story.child_name,
      ageGroup: story.child_age_group,
      pageNumber: page.page_number,
    });

    const localPath = await downloadAndSaveImage(imageUrl, params.storyId, page.page_number);

    await db.run("UPDATE pages SET image_url = ?, updated_at = datetime('now') WHERE id = ?", localPath, pageId);

    return NextResponse.json({ imageUrl: localPath });
  } catch (error) {
    console.error('Regenerate image error:', error);
    return NextResponse.json({ error: 'Error al regenerar imagen' }, { status: 500 });
  }
}
