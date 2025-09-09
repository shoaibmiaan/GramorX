// pages/api/teacher/apply.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer'; // assumes you have this helper

type ApplyPayload = {
  fullName: string;
  timezone: string;
  yearsExperience: number;
  modules: ('listening'|'reading'|'writing'|'speaking')[];
  bio: string;
  phone?: string;
  links?: { linkedin?: string; website?: string; introVideo?: string };
};

type ApplyResponse =
  | { ok: true; id: string }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApplyResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // TODO: replace with zod if available
  const body = req.body as Partial<ApplyPayload>;
  if (!body?.fullName || !body?.timezone || typeof body.yearsExperience !== 'number' || !body.modules?.length || !body.bio || body.bio.length < 120) {
    return res.status(400).json({ ok: false, error: 'Invalid input' });
  }

  const supabase = supabaseServer({ req, res });
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('teacher_applications')
    .insert({
      user_id: user.id,
      role_claim: 'teacher',
      full_name: body.fullName,
      timezone: body.timezone,
      years_experience: body.yearsExperience,
      modules: body.modules,
      bio: body.bio,
      phone: body.phone ?? null,
      links: body.links ?? {},
      status: 'submitted',
    })
    .select('id')
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, id: data.id });
}
