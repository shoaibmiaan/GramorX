// pages/api/notifications/enqueue.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { enqueueNotification } from '@/lib/notify';

type Body = {
  template: Parameters<typeof enqueueNotification>[0]['template'];
  payload?: Record<string, any>;
  url?: string | null;
  outOfApp?: boolean;
  idempotencyKey?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sb = createSupabaseServerClient({ req });
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { template, payload, url, outOfApp, idempotencyKey } = req.body as Body;
  if (!template) return res.status(400).json({ error: 'Missing template' });

  try {
    const result = await enqueueNotification({
      userId: user.id,
      template,
      payload,
      url: url ?? null,
      outOfApp: !!outOfApp,
      idempotencyKey,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'Notification enqueue failed' });
  }
}
 