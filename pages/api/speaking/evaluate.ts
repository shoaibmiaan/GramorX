import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserServer } from '@/lib/authServer';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user } = await getUserServer(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { attemptId, transcript, part } = req.body;
    if (!attemptId || !transcript) return res.status(400).json({ error: 'Missing fields' });

    // --- Choose AI Provider (Gemini > Groq fallback) ---
    let feedback: string | null = null;
    try {
      // Gemini
      const gemResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are an IELTS examiner. Evaluate this Speaking Part ${part} answer: "${transcript}".
Return band estimate and 2–3 lines of constructive feedback.` }] }]
        })
      }).then(r => r.json());
      feedback = gemResp?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (e) {
      console.error('Gemini failed, trying Groq', e);
    }

    if (!feedback) {
      // Groq Fallback
      const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'You are an IELTS examiner.' },
            { role: 'user', content: `Evaluate this Speaking Part ${part} answer: "${transcript}". Give band estimate and 2–3 lines feedback.` }
          ]
        })
      }).then(r => r.json());
      feedback = groqResp?.choices?.[0]?.message?.content ?? 'No feedback generated';
    }

    // --- Save in Supabase ---
    await supabaseServer.from('speaking_attempts')
      .update({ [`feedback_part${part}`]: feedback })
      .eq('id', attemptId)
      .eq('user_id', user.id);

    res.json({ feedback });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Evaluation failed' });
  }
}
