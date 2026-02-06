import db from './db';
import { format } from 'date-fns';
import { FREE_STORIES_PER_DAY } from './constants';
import type { UsageInfo } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkUsage(userId: string): Promise<UsageInfo> {
  // TODO: Desactivado temporalmente para testing - reactivar en producción
  return { storiesUsedToday: 0, limit: 999, remaining: 999, isSubscribed: true, resetAt: '' };

  /* CÓDIGO ORIGINAL - descomentar para producción:
  const today = format(new Date(), 'yyyy-MM-dd');
  const user = await db.get<{
    stories_today: number;
    last_story_date: string | null;
    is_subscribed: number;
  }>('SELECT stories_today, last_story_date, is_subscribed FROM users WHERE id = ?', userId);

  if (!user) {
    return { storiesUsedToday: 0, limit: FREE_STORIES_PER_DAY, remaining: 0, isSubscribed: false, resetAt: '' };
  }

  if (user.is_subscribed) {
    return { storiesUsedToday: 0, limit: Infinity, remaining: Infinity, isSubscribed: true, resetAt: '' };
  }

  let storiesUsed = user.stories_today;
  if (user.last_story_date !== today) {
    storiesUsed = 0;
    await db.run('UPDATE users SET stories_today = 0, last_story_date = ? WHERE id = ?', today, userId);
  }

  return {
    storiesUsedToday: storiesUsed,
    limit: FREE_STORIES_PER_DAY,
    remaining: Math.max(0, FREE_STORIES_PER_DAY - storiesUsed),
    isSubscribed: false,
    resetAt: `${today}T23:59:59`,
  };
  */
}

// Mantener estas importaciones para cuando se reactive el código
void FREE_STORIES_PER_DAY;
void db;
void format;

export async function incrementUsage(userId: string): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd');
  await db.run('UPDATE users SET stories_today = stories_today + 1, last_story_date = ? WHERE id = ?', today, userId);
}
