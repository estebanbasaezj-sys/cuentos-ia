import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db, { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateStoryPDF } from '@/lib/pdf';
import { getOrCreateWallet, deductCredits } from '@/lib/wallet';
import { canExportCleanPdf } from '@/lib/feature-gate';
import { CREDIT_COSTS } from '@/lib/monetization';
import { trackEvent } from '@/lib/telemetry';
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

    const wallet = await getOrCreateWallet(userId);
    const isFree = wallet.plan_type === 'free';
    let watermark = isFree;

    // Premium user: deduct credits for clean PDF
    if (!isFree) {
      const gate = await canExportCleanPdf(userId);
      if (!gate.allowed) {
        watermark = true;
      } else {
        await deductCredits(userId, CREDIT_COSTS.exportPdfClean, 'pdf_export', params.storyId, 'PDF sin marca de agua');
        await trackEvent('export_pdf', userId, { storyId: params.storyId, clean: true });
      }
    } else {
      await trackEvent('export_pdf', userId, { storyId: params.storyId, clean: false });
    }

    const pages = await db.all<Page>('SELECT * FROM pages WHERE story_id = ? ORDER BY page_number', params.storyId);
    const pdfBuffer = await generateStoryPDF(story, pages, { watermark });

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
