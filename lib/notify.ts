// lib/notify.ts
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type TemplateName =
  | 'welcome'
  | 'login_new_device'
  | 'password_changed'
  | 'email_verified'
  | 'phone_verified'
  | 'payment_success'
  | 'payment_failed'
  | 'trial_expiring'
  | 'streak_milestone'
  | 'study_reminder';

type TemplatePayload = Record<string, any>;

type EnqueueOpts = {
  userId: string;
  template: TemplateName;
  payload?: TemplatePayload;
  url?: string | null;
  // if provided, we enforce idempotency across a time window
  idempotencyKey?: string;
  // optional: try SMS/WA/Email if user opted-in & not in quiet hours
  outOfApp?: boolean;
};

const TEMPLATES: Record<TemplateName, (p?: TemplatePayload) => string> = {
  welcome: () => 'Welcome to GramorX!',
  login_new_device: (p) =>
    `New login from ${p?.city ?? 'a new location'} on ${p?.device ?? 'an unknown device'}. If this wasn’t you, secure your account.`,
  password_changed: () => 'Your password was changed successfully.',
  email_verified: () => 'Your email address has been verified.',
  phone_verified: () => 'Your phone number has been verified.',
  payment_success: (p) => `Payment received: ${p?.amount ?? ''} ${p?.currency ?? ''}`.trim(),
  payment_failed: () => 'Your payment could not be processed. Please update your billing method.',
  trial_expiring: (p) => `Your trial ends in ${p?.days ?? 3} day(s). Pick a plan to keep your progress.`,
  streak_milestone: (p) => `🔥 Streak milestone: ${p?.days ?? 7} days! Keep going!`,
  study_reminder: (p) => `Study reminder: ${p?.module ?? 'IELTS practice'}. You’ve got this!`,
};

function nowUtcISO() {
  return new Date().toISOString();
}

// Basic quiet hours (global) — 22:00 to 08:00 local server time.
// If you later store user tz/quiet hours, move this logic to read per-user settings.
function inQuietHours(date = new Date()) {
  const h = date.getHours();
  return h >= 22 || h < 8;
}

// Dedupe window: if an identical message exists in last 10 minutes, skip insert
const DEDUPE_WINDOW_MIN = 10;

function computeIdempotencyKey(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function enqueueNotification({
  userId,
  template,
  payload,
  url = null,
  idempotencyKey,
  outOfApp = false,
}: EnqueueOpts) {
  const messageFactory = TEMPLATES[template];
  if (!messageFactory) throw new Error(`Unknown template: ${template}`);

  const message = messageFactory(payload);
  const admin = supabaseAdmin;

  // OPTIONAL IDEMPOTENCY:
  // if idempotencyKey not provided, synthesize from (userId, template, message)
  const idem = idempotencyKey ?? computeIdempotencyKey(`${userId}|${template}|${message}`);

  // Check recent duplicates (same message) in last 10 minutes
  const { data: recent, error: recentErr } = await admin
    .from('notifications')
    .select('id, created_at, message')
    .eq('user_id', userId)
    .eq('message', message)
    .gte('created_at', new Date(Date.now() - DEDUPE_WINDOW_MIN * 60 * 1000).toISOString());

  if (!recentErr && recent && recent.length > 0) {
    return { ok: true, deduped: true, idempotencyKey: idem };
  }

  // Insert in-app notification
  const { data: created, error: insertErr } = await admin
    .from('notifications')
    .insert({ user_id: userId, message, url, read: false })
    .select('id, message, url, read, created_at')
    .single();

  if (insertErr) throw new Error(insertErr.message);

  // Respect opt-ins + quiet hours for out-of-app nudges
  if (outOfApp && !inQuietHours()) {
    const { data: prefs } = await admin
      .from('notifications_opt_in')
      .select('sms_opt_in, wa_opt_in, email_opt_in')
      .eq('user_id', userId)
      .maybeSingle();

    // NOTE: Stub — wire real providers (Twilio/SMTP) in your nudge endpoint later.
    const wantsAny = prefs?.sms_opt_in || prefs?.wa_opt_in || prefs?.email_opt_in;
    if (wantsAny) {
      try {
        // Call your existing mock nudge endpoint; later replace with provider calls
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/notifications/nudge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: userId, message }),
        });
      } catch {
        // Non-fatal: don’t block in-app inserts
      }
    }
  }

  return { ok: true, deduped: false, idempotencyKey: idem, notification: created };
}
