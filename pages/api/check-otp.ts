// /api/check-otp.js (server)
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import Twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = env.TWILIO_VERIFY_SERVICE_SID;
const supa = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY); // server only

const BodySchema = z.object({
  phone: z.string(),
  code: z.string(),
});

export type CheckOtpResponse =
  | { ok: true; message: string }
  | { ok: false; error: string };

export default async function checkOtp(
  req: NextApiRequest,
  res: NextApiResponse<CheckOtpResponse>
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

  const { phone, code } = result.data;
  try {
    const check = await client.verify
      .services(SERVICE_SID)
      .verificationChecks.create({ to: phone, code });
    if (check.status !== "approved") {
      return res.status(400).json({ ok: false, error: "Invalid code" });
    }

    // ----- SUCCESS: now link / create user in Supabase -----
    // Option A (recommended quick): upsert a user/profile row and create your own session (below).
    // Option B: create/confirm a Supabase auth user so Supabase Auth can be used — see next section.

    // Example: upsert into a 'profiles' table (you choose column names)
    const { error: supErr } = await supa
      .from("profiles")
      .upsert({ phone, phone_verified: true, updated_at: new Date() });

    if (supErr) {
      if ((supErr as any).code === "user_not_found") {
        return res
          .status(404)
          .json({ ok: false, error: "No account found for that email/phone." });
      }
      console.error("Supabase upsert error", supErr);
      return res.status(500).json({ ok: false, error: supErr.message });
    }

    return res.json({ ok: true, message: "Phone verified" });
  } catch (err) {
    console.error("Verify check error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ ok: false, error: message });
  }
}
