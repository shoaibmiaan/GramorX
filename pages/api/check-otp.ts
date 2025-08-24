// /api/check-otp.js (server)
import Twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY); // server only

export default async function checkOtp(req, res) {
  const { phone, code } = req.body;
  try {
    const check = await client.verify.services(SERVICE_SID)
      .verificationChecks.create({ to: phone, code });
    if (check.status !== "approved") {
      return res.status(400).json({ ok: false, message: "Invalid code" });
    }

    // ----- SUCCESS: now link / create user in Supabase -----
    // Option A (recommended quick): upsert a user/profile row and create your own session (below).
    // Option B: create/confirm a Supabase auth user so Supabase Auth can be used — see next section.

    // Example: upsert into a 'profiles' table (you choose column names)
    await supa.from("profiles").upsert({ phone, phone_verified: true, updated_at: new Date() });

    return res.json({ ok: true, message: "Phone verified" });
  } catch (err) {
    console.error("Verify check error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
