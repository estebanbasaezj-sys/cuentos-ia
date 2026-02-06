import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkUsage } from '@/lib/rate-limit';
import { initializeDb } from '@/lib/db';

export async function GET() {
  try {
    await initializeDb();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const usage = await checkUsage(userId);

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
