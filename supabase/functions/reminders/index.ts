import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_SMS_FROM = Deno.env.get("TWILIO_SMS_FROM")!;
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function isQuiet(now: Date, start: string | null, end: string | null) {
  if (!start || !end) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (startMin <= endMin) {
    return cur >= startMin && cur < endMin;
  }
  return cur >= startMin || cur < endMin;
}

async function sendSMS(to: string, body: string) {
  const params = new URLSearchParams({ To: to, From: TWILIO_SMS_FROM, Body: body });
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
}

async function sendWhatsApp(to: string, body: string) {
  const params = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
    Body: body,
  });
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: "no-reply@gramorx.com", to, subject, text }),
  });
}

Deno.serve(async () => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 60 * 60 * 1000);
  const { data: sessions } = await client
    .from("study_sessions")
    .select("user_id,start_at")
    .gte("start_at", now.toISOString())
    .lt("start_at", windowEnd.toISOString());
  const { data: tests } = await client
    .from("tests")
    .select("user_id,start_at")
    .gte("start_at", now.toISOString())
    .lt("start_at", windowEnd.toISOString());

  const byUser = new Map<string, { sessions: any[]; tests: any[] }>();
  for (const s of sessions ?? []) {
    const r = byUser.get(s.user_id) || { sessions: [], tests: [] };
    r.sessions.push(s);
    byUser.set(s.user_id, r);
  }
  for (const t of tests ?? []) {
    const r = byUser.get(t.user_id) || { sessions: [], tests: [] };
    r.tests.push(t);
    byUser.set(t.user_id, r);
  }

  for (const [userId, info] of byUser) {
    const { data: profile } = await client
      .from("user_profiles")
      .select(
        "email, phone, notification_channels, quiet_hours_start, quiet_hours_end"
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile) continue;
    if (isQuiet(now, profile.quiet_hours_start, profile.quiet_hours_end)) continue;

    const parts: string[] = [];
    for (const s of info.sessions) {
      parts.push(`Study session at ${new Date(s.start_at).toLocaleTimeString()}`);
    }
    for (const t of info.tests) {
      parts.push(`Test at ${new Date(t.start_at).toLocaleString()}`);
    }
    const text = parts.join(". ");
    const chans: string[] = profile.notification_channels ?? [];
    if (chans.includes("email") && profile.email) {
      await sendEmail(profile.email, "Upcoming Reminder", text);
    }
    if (chans.includes("sms") && profile.phone) {
      await sendSMS(profile.phone, text);
    }
    if (chans.includes("whatsapp") && profile.phone) {
      await sendWhatsApp(profile.phone, text);
    }
  }

  return new Response("ok");
});

