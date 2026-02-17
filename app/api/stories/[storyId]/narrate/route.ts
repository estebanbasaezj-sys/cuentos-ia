import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateAllAudioParallel } from '@/lib/openai';
import { canNarrateStory } from '@/lib/feature-gate';
import { deductCredits } from '@/lib/wallet';
import { CREDIT_COSTS } from '@/lib/monetization';
import { trackEvent } from '@/lib/telemetry';
import { narrateStorySchema } from '@/lib/validators';
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

    const pages = await db.all<Page>(
      'SELECT * FROM pages WHERE story_id = ? ORDER BY page_number',
      params.storyId
    );

    if (!pages.length) {
      return NextResponse.json({ error: 'El cuento no tiene paginas' }, { status: 400 });
    }

    // Check if already narrated
    if (pages.some(p => p.audio_url)) {
      return NextResponse.json({ error: 'El cuento ya tiene narracion' }, { status: 409 });
    }

    // Parse request
    const body = await req.json();
    const parsed = narrateStorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos invalidos' },
        { status: 400 }
      );
    }

    const { voice, speed } = parsed.data;

    // Feature gate
    const gate = await canNarrateStory(userId, pages.length);
    if (!gate.allowed) {
      return NextResponse.json(
        { error: 'No autorizado para esta funcion', gate },
        { status: 403 }
      );
    }

    // Generate audio for all pages in parallel
    const results = await generateAllAudioParallel(
      pages.map(p => ({
        text: p.text,
        pageNumber: p.page_number,
        storyId: params.storyId,
        voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
        speed,
      }))
    );

    const failures = results.filter(r => !r.url);
    if (failures.length === results.length) {
      return NextResponse.json(
        { error: 'Error al generar la narracion. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Save audio URLs
    for (const result of results) {
      if (result.url) {
        await db.run(
          "UPDATE pages SET audio_url = ?, updated_at = datetime('now') WHERE story_id = ? AND page_number = ?",
          result.url, params.storyId, result.pageNumber
        );
      }
    }

    // Save voice to story
    await db.run(
      "UPDATE stories SET narration_voice = ?, updated_at = datetime('now') WHERE id = ?",
      voice, params.storyId
    );

    // Deduct credits
    const successCount = results.filter(r => r.url).length;
    const cost = successCount * CREDIT_COSTS.narratePerPage;
    await deductCredits(userId, cost, 'narration', params.storyId,
      `Narracion ${successCount} paginas (voz: ${voice})`
    );

    await trackEvent('narration_generated', userId, {
      storyId: params.storyId,
      voice,
      pagesNarrated: successCount,
      creditCost: cost,
    });

    // Return updated pages
    const updatedPages = await db.all<Page>(
      'SELECT * FROM pages WHERE story_id = ? ORDER BY page_number',
      params.storyId
    );

    return NextResponse.json({
      success: true,
      pages: updatedPages,
      pagesNarrated: successCount,
      creditCost: cost,
    });
  } catch (error) {
    console.error('Narration error:', error);
    return NextResponse.json({ error: 'Error al generar narracion' }, { status: 500 });
  }
}
