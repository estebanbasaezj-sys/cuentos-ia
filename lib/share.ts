import { nanoid } from 'nanoid';
import { addDays, isAfter } from 'date-fns';
import type { Share } from '@/types';

export function createShareToken(): string {
  return nanoid(12);
}

export function calculateExpiration(days: number): string {
  return addDays(new Date(), days).toISOString();
}

export function isShareValid(share: Share): boolean {
  return !share.revoked && isAfter(new Date(share.expires_at), new Date());
}
