// pages/api/premium/eligibility.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  // Placeholder: in a real implementation you'd check subscription/credit tables.
  // For now all authenticated users are considered eligible with 1 credit.
  return res.status(200).json({ eligible: true, subscriptionActive: true, credits: 1 });
}
