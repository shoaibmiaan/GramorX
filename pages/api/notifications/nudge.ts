// pages/api/notifications/nudge.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Mock — in prod, wire to Twilio/Email
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: boolean; error?: string }>
) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, message } = req.body as { to: string; message: string };

  if (!to || !message)
    return res.status(400).json({ ok: false, error: "Missing fields" });

  try {
    // TODO: send via Twilio/SMTP
    console.log("Sending nudge →", { to, message });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
