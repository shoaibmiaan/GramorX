// lib/events/recordLoginEvent.ts
import supabaseAdmin from '@/lib/supabaseAdmin';

export type RecordLoginEventInput = Readonly<{
  userId: string;
  email?: string | null;
  provider?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Record<string, unknown>;
}>;

/**
 * Inserts a row into `login_events`.
 * Returns true on success, false otherwise (never undefined).
 */
export async function recordLoginEvent(input: RecordLoginEventInput): Promise<boolean> {
  try {
    const payload = {
      user_id: input.userId,
      email: input.email ?? null,
      provider: input.provider ?? null,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      meta: input.meta ?? {},
      created_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from('login_events').insert(payload);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[recordLoginEvent] insert error:', error);
      return false;
    }
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[recordLoginEvent] unexpected:', e);
    return false;
  }
}
