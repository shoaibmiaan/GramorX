import type { NextApiRequest, NextApiResponse } from "next";
import Twilio from "twilio";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const { TWILIO_AUTH_TOKEN } = env;

const supa = createSupabaseServerClient({ serviceRole: true });

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const signature = req.headers["x-twilio-signature"] as string | undefined;
  const url = `${env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/api/whatsapp/webhook`;
  const valid = Twilio.validateRequest(TWILIO_AUTH_TOKEN, signature || "", url, req.body);
  if (!valid) return res.status(403).end("Invalid Twilio signature");

  const body = req.body as Record<string, string>;
  const from = body.From?.replace("whatsapp:", "") ?? "";
  const msg = body.Body?.trim().toLowerCase();

  if (msg === "stop" || msg === "unsubscribe") {
    await supa.from("whatsapp_optin").delete().eq("phone", from);
  }

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send("<Response></Response>");
}
