import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { text } = req.body as { text?: string };
  if (!text) return res.status(400).json({ error: 'Missing text' });

  try {
    const response = await fetch('https://plagiarism.example.com/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PLAGIARISM_API_KEY}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err || 'Service error' });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Request failed' });
  }
}
