import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { updatePagesSchema } from '@/lib/validators';
import type { Story, Page } from '@/types';

export async function GET(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const story = await db.get<Story>('SELECT * FROM stories WHERE id = ?', params.storyId);

    if (!story) {
      return NextResponse.json({ error: 'Cuento no encontrado' }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    if (story.user_id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const pages = await db.all<Page>('SELECT * FROM pages WHERE story_id = ? ORDER BY page_number', params.storyId);

    return NextResponse.json({ story: { ...story, pages } });
  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const story = await db.get<Story>('SELECT * FROM stories WHERE id = ?', params.storyId);

    if (!story) {
      return NextResponse.json({ error: 'Cuento no encontrado' }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    if (story.user_id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updatePagesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    for (const page of parsed.data.pages) {
      await db.run(
        "UPDATE pages SET text = ?, updated_at = datetime('now') WHERE id = ? AND story_id = ?",
        page.text, page.id, params.storyId
      );
    }

    await db.run("UPDATE stories SET updated_at = datetime('now') WHERE id = ?", params.storyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update story error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const story = await db.get<Story>('SELECT * FROM stories WHERE id = ?', params.storyId);

    if (!story) {
      return NextResponse.json({ error: 'Cuento no encontrado' }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    if (story.user_id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await db.run('DELETE FROM pages WHERE story_id = ?', params.storyId);
    await db.run('DELETE FROM shares WHERE story_id = ?', params.storyId);
    await db.run('DELETE FROM stories WHERE id = ?', params.storyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete story error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
