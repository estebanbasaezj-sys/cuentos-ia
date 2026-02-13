import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { estimateStoryCost, CREDIT_COSTS } from '@/lib/monetization';
import { getOrCreateWallet } from '@/lib/wallet';
import type { ImageQuality } from '@/lib/monetization';

export async function POST(req: Request) {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { length = 'corto' } = await req.json();

    const wallet = await getOrCreateWallet(userId);
    const imageQuality: ImageQuality = wallet.plan_type === 'premium' ? 'high' : 'standard';
    const totalCost = estimateStoryCost(length, imageQuality);

    return NextResponse.json({
      totalCost,
      breakdown: {
        text: CREDIT_COSTS.generateText,
        images: totalCost - CREDIT_COSTS.generateText,
        imageQuality,
      },
      canAfford: wallet.plan_type === 'free' || (wallet.monthly_credits_remaining + wallet.credits_balance) >= totalCost,
    });
  } catch (error) {
    console.error('Estimate error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
