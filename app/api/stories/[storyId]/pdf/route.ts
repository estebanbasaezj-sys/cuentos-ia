import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateStoryPDF } from '@/lib/pdf';
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

    const pages = await db.all<Page>('SELECT * FROM pages WHERE story_id = ? ORDER BY page_number', params.storyId);
    const pdfBuffer = await generateStoryPDF(story, pages);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(story.title || 'cuento').replace(/[^a-zA-Z0-9áéíóúñ ]/g, '')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF error:', error);
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
  }
}
