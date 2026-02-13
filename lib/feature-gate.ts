import db from './db';
import { getOrCreateWallet, canAfford } from './wallet';
import { FREE_LIMITS, estimateStoryCost, isStylePremium, isLengthPremium, CREDIT_COSTS } from './monetization';
import type { GateResult } from '@/types';
import type { ImageQuality } from './monetization';

export async function canGenerateStory(
  userId: string,
  length: string,
  artStyle: string
): Promise<GateResult> {
  const wallet = await getOrCreateWallet(userId);

  if (wallet.plan_type === 'free') {
    // Chequear largo premium
    if (isLengthPremium(length)) {
      return { allowed: false, reason: 'premium_length', paywallType: 'upgrade' };
    }
    // Chequear estilo premium
    if (isStylePremium(artStyle)) {
      return { allowed: false, reason: 'premium_style', paywallType: 'upgrade' };
    }
    // Chequear limite semanal
    const weekCount = await countStoriesThisWeek(userId);
    if (weekCount >= FREE_LIMITS.storiesPerWeek) {
      return { allowed: false, reason: 'weekly_limit', paywallType: 'upgrade' };
    }
    return { allowed: true };
  }

  // Premium: chequear creditos
  const imageQuality: ImageQuality = 'high';
  const cost = estimateStoryCost(length, imageQuality);
  if (!canAfford(wallet, cost)) {
    return { allowed: false, reason: 'insufficient_credits', paywallType: 'topup' };
  }

  return { allowed: true };
}

export async function canExportCleanPdf(userId: string): Promise<GateResult> {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.plan_type === 'free') {
    return { allowed: false, reason: 'premium_feature', paywallType: 'upgrade' };
  }
  if (!canAfford(wallet, CREDIT_COSTS.exportPdfClean)) {
    return { allowed: false, reason: 'insufficient_credits', paywallType: 'topup' };
  }
  return { allowed: true };
}

export async function canSaveToLibrary(userId: string): Promise<GateResult> {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.plan_type === 'free') {
    const count = await db.get<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND status = 'ready'", userId
    );
    if ((count?.cnt || 0) >= FREE_LIMITS.maxLibraryStories) {
      return { allowed: false, reason: 'library_limit', paywallType: 'upgrade' };
    }
  }
  return { allowed: true };
}

export async function canRegenerateImage(userId: string): Promise<GateResult> {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.plan_type === 'free') {
    return { allowed: true }; // Free users can regen (no credit cost)
  }
  const cost = CREDIT_COSTS.generateImageHigh;
  if (!canAfford(wallet, cost)) {
    return { allowed: false, reason: 'insufficient_credits', paywallType: 'topup' };
  }
  return { allowed: true };
}

async function countStoriesThisWeek(userId: string): Promise<number> {
  const result = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', '-7 days')",
    userId
  );
  return result?.cnt || 0;
}

export async function countStoriesThisMonth(userId: string): Promise<number> {
  const result = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', 'start of month')",
    userId
  );
  return result?.cnt || 0;
}
