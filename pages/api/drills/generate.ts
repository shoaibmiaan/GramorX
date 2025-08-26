import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/lib/env';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body as { topic?: string };
  if (!topic) return res.status(400).json({ error: 'Missing topic' });
  if (!env.OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI API key not configured' });

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are an English teacher creating short practice drills.' },
        {
          role: 'user',
          content: `Create an IELTS-style drill about "${topic}". Provide numbered tasks or questions.`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    return res.status(200).json({ text });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate drill' });
  }
}
