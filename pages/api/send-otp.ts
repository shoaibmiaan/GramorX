// /api/send-otp.js (server)
import Twilio from "twilio";
import { env } from "@/lib/env";
const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = env.TWILIO_VERIFY_SERVICE_SID; // starts with VA...

export default async function sendOtp(req, res) {
  const { phone } = req.body; // expect E.164: +9233....
  try {
    const verification = await client.verify.services(SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });
    return res.json({ ok: true, sid: verification.sid });
  } catch (err) {
    console.error("Verify start error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
