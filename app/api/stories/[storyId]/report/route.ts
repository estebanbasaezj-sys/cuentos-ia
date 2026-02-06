import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { reportSchema } from '@/lib/validators';

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    await db.run(
      'INSERT INTO reports (id, story_id, user_id, reason) VALUES (?, ?, ?, ?)',
      uuid(), params.storyId, userId, parsed.data.reason
    );

    await db.run('UPDATE stories SET flagged_count = flagged_count + 1 WHERE id = ?', params.storyId);

    return NextResponse.json({ message: 'Reporte enviado. Gracias por tu feedback.' }, { status: 201 });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Error al reportar' }, { status: 500 });
  }
}
