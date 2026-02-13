import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createStorySchema } from '@/lib/validators';
import { moderateInputs } from '@/lib/moderation';
import { canGenerateStory, canSaveToLibrary } from '@/lib/feature-gate';
import { getOrCreateWallet } from '@/lib/wallet';
import { estimateStoryCost } from '@/lib/monetization';
import { trackEvent } from '@/lib/telemetry';
import type { Story } from '@/types';
import type { ImageQuality } from '@/lib/monetization';

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

    const artStyle = parsed.data.artStyle || body.traits?.artStyle || 'watercolor';

    // Feature gating
    const gateResult = await canGenerateStory(userId, parsed.data.length, artStyle);
    if (!gateResult.allowed) {
      await trackEvent('paywall_viewed', userId, { reason: gateResult.reason });
      return NextResponse.json(
        { error: 'Limite alcanzado', gate: gateResult },
        { status: 403 }
      );
    }

    // Library limit
    const libGate = await canSaveToLibrary(userId);
    if (!libGate.allowed) {
      return NextResponse.json(
        { error: 'Biblioteca llena', gate: libGate },
        { status: 403 }
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

    // Calculate credit cost and image quality
    const wallet = await getOrCreateWallet(userId);
    const imageQuality: ImageQuality = wallet.plan_type === 'premium' ? 'high' : 'standard';
    const creditCost = wallet.plan_type === 'premium'
      ? estimateStoryCost(parsed.data.length, imageQuality)
      : 0;

    const storyId = uuid();

    // Build traits JSON including artStyle and colorPalette
    const traits = {
      ...(parsed.data.traits || {}),
      artStyle: parsed.data.artStyle || body.traits?.artStyle,
      colorPalette: parsed.data.colorPalette || body.traits?.colorPalette,
    };

    await db.run(
      `INSERT INTO stories (id, user_id, child_name, child_age_group, theme, tone, length, traits, status, generation_progress, credit_cost, image_quality)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?)`,
      storyId,
      userId,
      parsed.data.childName,
      parsed.data.childAgeGroup,
      parsed.data.theme,
      parsed.data.tone,
      parsed.data.length,
      JSON.stringify(traits),
      creditCost,
      imageQuality
    );

    await trackEvent('story_generate_started', userId, {
      length: parsed.data.length,
      creditCost,
      artStyle,
      imageQuality,
    });

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
