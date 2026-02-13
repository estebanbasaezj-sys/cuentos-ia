import db from './db';
import { v4 as uuid } from 'uuid';

export type EventType =
  | 'story_generate_started'
  | 'story_generate_completed'
  | 'credits_spent'
  | 'paywall_viewed'
  | 'subscribe_clicked'
  | 'subscribed'
  | 'topup_clicked'
  | 'topup_purchased'
  | 'export_pdf';

export async function trackEvent(
  eventType: EventType,
  userId?: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    await db.run(
      'INSERT INTO telemetry_events (id, user_id, event_type, event_data) VALUES (?, ?, ?, ?)',
      uuid(), userId || null, eventType, data ? JSON.stringify(data) : null
    );
  } catch (err) {
    console.error('Telemetry error:', err);
  }
}
