import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { initializeDb } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { checkUsage } from '@/lib/rate-limit';
import { getOrCreateWallet, getLedger } from '@/lib/wallet';

export async function GET() {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const wallet = await getOrCreateWallet(userId);
    const usage = await checkUsage(userId);
    const ledger = await getLedger(userId, 20);

    return NextResponse.json({ wallet, usage, ledger });
  } catch (error) {
    console.error('Wallet error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
