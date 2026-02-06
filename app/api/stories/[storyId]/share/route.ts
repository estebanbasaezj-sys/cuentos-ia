import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createShareToken, calculateExpiration } from '@/lib/share';
import { shareSchema } from '@/lib/validators';
import type { Story } from '@/types';

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

    const body = await req.json();
    const parsed = shareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const token = createShareToken();
    const expiresAt = calculateExpiration(parsed.data.expiresInDays);

    await db.run(
      'INSERT INTO shares (id, story_id, share_token, expires_at) VALUES (?, ?, ?, ?)',
      uuid(), params.storyId, token, expiresAt
    );

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/compartido/${token}`;

    return NextResponse.json({ shareUrl, token, expiresAt }, { status: 201 });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json({ error: 'Error al compartir' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await db.run('UPDATE shares SET revoked = 1 WHERE story_id = ?', params.storyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke share error:', error);
    return NextResponse.json({ error: 'Error al revocar' }, { status: 500 });
  }
}
