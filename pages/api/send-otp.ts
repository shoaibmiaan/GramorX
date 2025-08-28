// /api/send-otp.js (server)
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import Twilio from "twilio";
import { env } from "@/lib/env";

const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = env.TWILIO_VERIFY_SERVICE_SID; // starts with VA...

const BodySchema = z.object({
  phone: z.string(), // expect E.164: +9233....
});

export type SendOtpResponse =
  | { ok: true; sid: string }
  | { ok: false; error: string };

export default async function sendOtp(
  req: NextApiRequest,
  res: NextApiResponse<SendOtpResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const result = BodySchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ ok: false, error: "Invalid request body" });
  }

  const { phone } = result.data;
  try {
    const verification = await client.verify
      .services(SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });
    return res.json({ ok: true, sid: verification.sid });
  } catch (err) {
    console.error("Verify start error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ ok: false, error: message });
  }
}
