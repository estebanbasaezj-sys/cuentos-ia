import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createStorySchema } from '@/lib/validators';
import { moderateInputs } from '@/lib/moderation';
import { checkUsage, incrementUsage } from '@/lib/rate-limit';
import type { Story } from '@/types';

export async function POST(req: Request) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Check rate limit
    const usage = await checkUsage(userId);
    if (!usage.isSubscribed && usage.remaining <= 0) {
      return NextResponse.json(
        { error: 'Ya usaste tu cuento gratuito de hoy. Vuelve mañana o suscríbete para cuentos ilimitados.', usage },
        { status: 429 }
      );
    }

    // Moderate inputs
    const modResult = moderateInputs({
      childName: parsed.data.childName,
      theme: parsed.data.theme,
      traits: parsed.data.traits as Record<string, string> | undefined,
    });
    if (!modResult.safe) {
      return NextResponse.json({ error: modResult.message }, { status: 400 });
    }

    const storyId = uuid();

    await db.run(
      `INSERT INTO stories (id, user_id, child_name, child_age_group, theme, tone, length, traits, status, generation_progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', 0)`,
      storyId,
      userId,
      parsed.data.childName,
      parsed.data.childAgeGroup,
      parsed.data.theme,
      parsed.data.tone,
      parsed.data.length,
      parsed.data.traits ? JSON.stringify(parsed.data.traits) : null
    );

    // Increment usage
    await incrementUsage(userId);

    return NextResponse.json({ storyId }, { status: 201 });
  } catch (error) {
    console.error('Create story error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const theme = searchParams.get('theme') || '';

    let query = 'SELECT * FROM stories WHERE user_id = ?';
    const params: unknown[] = [userId];

    if (search) {
      query += ' AND (title LIKE ? OR child_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (theme) {
      query += ' AND theme = ?';
      params.push(theme);
    }

    query += ' ORDER BY created_at DESC';

    const stories = await db.all<Story>(query, ...params);
    return NextResponse.json({ stories });
  } catch (error) {
    console.error('List stories error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
