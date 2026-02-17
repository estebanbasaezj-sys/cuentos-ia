import db from './db';
import { v4 as uuid } from 'uuid';
import type { Wallet } from '@/types';
import { PREMIUM_FEATURES, isAdminEmail } from './monetization';

export async function getOrCreateWallet(userId: string): Promise<Wallet> {
  let wallet = await db.get<Wallet>('SELECT * FROM wallets WHERE user_id = ?', userId);
  if (!wallet) {
    const id = uuid();
    await db.run(
      `INSERT INTO wallets (id, user_id, plan_type, credits_balance, monthly_credits_remaining, monthly_credits_total)
       VALUES (?, ?, 'free', 0, 0, 0)`,
      id, userId
    );
    wallet = await db.get<Wallet>('SELECT * FROM wallets WHERE user_id = ?', userId);
  }
  return wallet!;
}

export function totalCredits(wallet: Wallet): number {
  return wallet.monthly_credits_remaining + wallet.credits_balance;
}

export function canAfford(wallet: Wallet, cost: number): boolean {
  if (wallet.plan_type === 'free') return true;
  return totalCredits(wallet) >= cost;
}

export async function deductCredits(
  userId: string,
  amount: number,
  source: string,
  referenceId?: string,
  description?: string
): Promise<boolean> {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.plan_type === 'free') return true;

  // Admin users: no deduction
  const user = await db.get<{ email: string }>('SELECT email FROM users WHERE id = ?', userId);
  if (user && isAdminEmail(user.email)) return true;

  const total = totalCredits(wallet);
  if (total < amount) return false;

  // Descontar de monthly primero, luego purchased
  const monthlyDeduction = Math.min(amount, wallet.monthly_credits_remaining);
  const purchasedDeduction = amount - monthlyDeduction;

  await db.run(
    `UPDATE wallets
     SET monthly_credits_remaining = monthly_credits_remaining - ?,
         credits_balance = credits_balance - ?,
         updated_at = datetime('now')
     WHERE user_id = ?`,
    monthlyDeduction, purchasedDeduction, userId
  );

  const newBalance = total - amount;
  await db.run(
    `INSERT INTO credit_ledger (id, user_id, amount, balance_after, source, reference_id, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    uuid(), userId, -amount, newBalance, source, referenceId || null, description || null
  );

  return true;
}

export async function grantMonthlyCredits(userId: string, credits: number): Promise<void> {
  const wallet = await getOrCreateWallet(userId);
  await db.run(
    `UPDATE wallets
     SET monthly_credits_remaining = ?,
         monthly_credits_total = ?,
         updated_at = datetime('now')
     WHERE user_id = ?`,
    credits, credits, userId
  );

  await db.run(
    `INSERT INTO credit_ledger (id, user_id, amount, balance_after, source, description)
     VALUES (?, ?, ?, ?, 'monthly_grant', ?)`,
    uuid(), userId, credits, totalCredits(wallet) + credits, `Recarga mensual: ${credits} creditos`
  );
}

export async function addPurchasedCredits(
  userId: string,
  credits: number,
  referenceId: string
): Promise<void> {
  await db.run(
    `UPDATE wallets
     SET credits_balance = credits_balance + ?,
         updated_at = datetime('now')
     WHERE user_id = ?`,
    credits, userId
  );

  const wallet = await getOrCreateWallet(userId);
  await db.run(
    `INSERT INTO credit_ledger (id, user_id, amount, balance_after, source, reference_id, description)
     VALUES (?, ?, ?, ?, 'topup', ?, ?)`,
    uuid(), userId, credits, totalCredits(wallet), referenceId, `Top-up: ${credits} creditos`
  );
}

export async function upgradeToPremium(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  renewalDate: string
): Promise<void> {
  await db.run(
    `UPDATE wallets
     SET plan_type = 'premium',
         monthly_credits_remaining = ?,
         monthly_credits_total = ?,
         renewal_date = ?,
         stripe_customer_id = ?,
         stripe_subscription_id = ?,
         subscription_status = 'active',
         updated_at = datetime('now')
     WHERE user_id = ?`,
    PREMIUM_FEATURES.monthlyCredits, PREMIUM_FEATURES.monthlyCredits,
    renewalDate, stripeCustomerId, stripeSubscriptionId, userId
  );
}

export async function downgradeToFree(userId: string): Promise<void> {
  await db.run(
    `UPDATE wallets
     SET plan_type = 'free',
         monthly_credits_remaining = 0,
         monthly_credits_total = 0,
         renewal_date = NULL,
         subscription_status = 'canceled',
         updated_at = datetime('now')
     WHERE user_id = ?`,
    userId
  );
}

export async function getLedger(userId: string, limit = 10): Promise<import('@/types').CreditLedgerEntry[]> {
  return db.all<import('@/types').CreditLedgerEntry>(
    'SELECT * FROM credit_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    userId, limit
  );
}
