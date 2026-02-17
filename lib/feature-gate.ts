import db from './db';
import { getOrCreateWallet, canAfford } from './wallet';
import { FREE_LIMITS, PREMIUM_LIMITS, estimateStoryCost, isStylePremium, isLengthPremium, CREDIT_COSTS, isAdminEmail, estimateNarrationCost } from './monetization';
import type { GateResult } from '@/types';
import type { ImageQuality } from './monetization';

async function isAdminUser(userId: string): Promise<boolean> {
  const user = await db.get<{ email: string }>('SELECT email FROM users WHERE id = ?', userId);
  return !!user && isAdminEmail(user.email);
}

export async function canGenerateStory(
  userId: string,
  length: string,
  artStyle: string
): Promise<GateResult> {
  if (await isAdminUser(userId)) {
    return { allowed: true };
  }

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

  // Premium: chequear rate limits (red de seguridad)
  const dayCount = await countStoriesThisDay(userId);
  if (dayCount >= PREMIUM_LIMITS.storiesPerDay) {
    return { allowed: false, reason: 'daily_limit', paywallType: 'info' };
  }
  const monthCount = await countStoriesThisMonth(userId);
  if (monthCount >= PREMIUM_LIMITS.storiesPerMonth) {
    return { allowed: false, reason: 'monthly_limit', paywallType: 'info' };
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
  if (await isAdminUser(userId)) return { allowed: true };
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
  if (await isAdminUser(userId)) return { allowed: true };
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
  if (await isAdminUser(userId)) return { allowed: true };
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

export async function countStoriesThisDay(userId: string): Promise<number> {
  const result = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', 'start of day')",
    userId
  );
  return result?.cnt || 0;
}

async function countStoriesThisWeek(userId: string): Promise<number> {
  const result = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', '-7 days')",
    userId
  );
  return result?.cnt || 0;
}

export async function canNarrateStory(userId: string, pageCount: number): Promise<GateResult> {
  if (await isAdminUser(userId)) return { allowed: true };
  const wallet = await getOrCreateWallet(userId);
  if (wallet.plan_type === 'free') {
    return { allowed: false, reason: 'premium_narration', paywallType: 'upgrade' };
  }
  const cost = estimateNarrationCost(pageCount);
  if (!canAfford(wallet, cost)) {
    return { allowed: false, reason: 'insufficient_credits', paywallType: 'topup' };
  }
  return { allowed: true };
}

export async function countStoriesThisMonth(userId: string): Promise<number> {
  const result = await db.get<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM stories WHERE user_id = ? AND created_at >= datetime('now', 'start of month')",
    userId
  );
  return result?.cnt || 0;
}
