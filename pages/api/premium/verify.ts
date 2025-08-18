import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Optional master override via env, e.g. PREMIUM_MASTER_PIN=123456
const MASTER_PIN = process.env.PREMIUM_MASTER_PIN || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { pin } = (req.body ?? {}) as { pin?: string };
  if (!pin || !/^\d{4,8}$/.test(pin)) return res.status(400).json({ ok: false, error: "Invalid PIN" });

  // Must be logged in
  const supaSSR = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supaSSR.auth.getUser();
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated" });

  // 1) Master PIN (ops backdoor, optional)
  if (MASTER_PIN && pin === MASTER_PIN) {
    return res.status(200).json({ ok: true });
  }

  // 2) Check user's hashed PIN in public.premium_pins
  // Using service role here so RLS setup doesn't block verification
  const { data, error } = await supabaseAdmin
    .from("premium_pins")
    .select("pin_hash")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // If row not found or other error
    return res.status(403).json({ ok: false, error: "PIN not set for this account" });
  }

  const match = data?.pin_hash ? await bcrypt.compare(pin, data.pin_hash) : false;
  return match ? res.status(200).json({ ok: true }) : res.status(403).json({ ok: false, error: "Incorrect PIN" });
}
