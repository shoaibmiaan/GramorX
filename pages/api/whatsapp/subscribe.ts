import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import Twilio from "twilio";
import { env } from "@/lib/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { phone } = req.body as { phone?: string };
  if (!phone) return res.status(400).json({ error: "Phone required" });

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Cookie: req.headers.cookie || "" } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { error } = await supabase
    .from("whatsapp_optin")
    .upsert({ user_id: user.id, phone, opted_in: true });
  if (error) return res.status(500).json({ error: error.message });

  try {
    const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to: `whatsapp:${phone}`,
      from: `whatsapp:${env.TWILIO_WHATSAPP_FROM}`,
      body: "Thanks for subscribing to GramorX WhatsApp updates! Reply STOP to unsubscribe.",
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[whatsapp subscribe] twilio", e);
  }

  return res.status(200).json({ success: true });
}
