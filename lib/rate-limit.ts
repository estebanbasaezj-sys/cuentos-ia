import db from './db';
import { getOrCreateWallet, totalCredits } from './wallet';
import { FREE_LIMITS } from './monetization';
import { countStoriesThisMonth } from './feature-gate';
import type { UsageInfo } from '@/types';

export async function checkUsage(userId: string): Promise<UsageInfo> {
  const wallet = await getOrCreateWallet(userId);

  const weekResult = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', '-7 days')", userId
  );
  const monthResult = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', 'start of month')", userId
  );
  const libraryResult = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND status = 'ready'", userId
  );

  const storiesThisWeek = weekResult?.cnt || 0;
  const storiesThisMonth = monthResult?.cnt || 0;
  const libraryCount = libraryResult?.cnt || 0;

  return {
    planType: wallet.plan_type as 'free' | 'premium',
    storiesThisWeek,
    storiesThisMonth,
    weeklyLimit: FREE_LIMITS.storiesPerWeek,
    monthlyLimit: FREE_LIMITS.storiesPerMonth,
    freeRemaining: wallet.plan_type === 'free'
      ? Math.max(0, FREE_LIMITS.storiesPerWeek - storiesThisWeek)
      : Infinity,
    libraryCount,
    libraryLimit: wallet.plan_type === 'free' ? FREE_LIMITS.maxLibraryStories : Infinity,
    monthlyCreditsRemaining: wallet.monthly_credits_remaining,
    purchasedCreditsBalance: wallet.credits_balance,
    totalCreditsAvailable: totalCredits(wallet),
    renewalDate: wallet.renewal_date,
  };
}

// No-op: ya no usamos el contador de stories_today
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function incrementUsage(_userId: string): Promise<void> {
  // El conteo ahora se hace directamente desde la tabla stories
}

// Para compatibilidad: mantener export de countStoriesThisMonth
export { countStoriesThisMonth };
