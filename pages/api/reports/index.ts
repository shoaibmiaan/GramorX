import type { NextApiRequest, NextApiResponse } from 'next';
import { generateReport } from '@/lib/analytics';

let weeklyTimer: NodeJS.Timeout | null = null;
let monthlyTimer: NodeJS.Timeout | null = null;

async function sendEmail(to: string, report: any) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'reports@gramorx.com',
      to,
      subject: 'Your progress report',
      html: `<pre>${JSON.stringify(report, null, 2)}</pre>`,
    }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { userId, email, interval } = req.body as {
    userId?: string;
    email?: string;
    interval?: 'weekly' | 'monthly';
  };
  if (!userId || !email || !interval) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  const run = async () => {
    const report = await generateReport(userId);
    await sendEmail(email, report);
  };
  if (interval === 'weekly' && !weeklyTimer) {
    weeklyTimer = setInterval(run, 7 * 24 * 60 * 60 * 1000);
  }
  if (interval === 'monthly' && !monthlyTimer) {
    monthlyTimer = setInterval(run, 30 * 24 * 60 * 60 * 1000);
  }
  await run();
  res.status(200).json({ scheduled: interval });
}
