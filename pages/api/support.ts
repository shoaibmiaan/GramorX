// pages/api/support.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';

/** ========= Types ========= */
type SupportCategory = 'account' | 'billing' | 'modules' | 'ai' | 'technical' | 'other';

export interface SupportRequest {
  subject: string;
  email: string;
  category: SupportCategory;
  details: string;
  route?: string;
  userId?: string | null; // optional if you want to attach an auth user id later
}

export interface SupportResponse {
  ok: boolean;
  ticketId?: string;
  message?: string;
  errors?: Record<string, string>;
}

/** ========= Helpers ========= */
function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function asSupportRequest(
  x: unknown
): { ok: true; data: SupportRequest } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const b = x as Partial<SupportRequest> | undefined;

  if (!b || typeof b !== 'object') return { ok: false, errors: { body: 'Invalid JSON body.' } };

  if (typeof b.subject !== 'string' || b.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters.';
  }
  if (typeof b.email !== 'string' || !isEmail(b.email)) {
    errors.email = 'Provide a valid email address.';
  }
  const cats: SupportCategory[] = ['account', 'billing', 'modules', 'ai', 'technical', 'other'];
  if (typeof b.category !== 'string' || !cats.includes(b.category as SupportCategory)) {
    errors.category = `Category must be one of: ${cats.join(', ')}.`;
  }
  if (typeof b.details !== 'string' || b.details.trim().length < 10) {
    errors.details = 'Details must be at least 10 characters.';
  }
  if (b.route != null && typeof b.route !== 'string') {
    errors.route = 'Route must be a string if provided.';
  }
  if (b.userId != null && typeof b.userId !== 'string') {
    errors.userId = 'userId must be a string if provided.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      subject: b.subject!.trim(),
      email: b.email!.trim(),
      category: b.category as SupportCategory,
      details: b.details!.trim(),
      route: b.route?.trim(),
      userId: b.userId ?? null,
    },
  };
}

function makeTicketId(): string {
  const ts = new Date();
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, '0');
  const d = String(ts.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GX-${y}${m}${d}-${rand}`;
}

/** ========= API Handler ========= */
export default async function handler(req: NextApiRequest, res: NextApiResponse<SupportResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  if (!(await rateLimit(req, res))) return;

  // Validate body
  const parsed = asSupportRequest(req.body as unknown);
  if (!parsed.ok) {
    return res.status(400).json({ ok: false, errors: parsed.errors, message: 'Validation failed.' });
  }

  const data = parsed.data;
  const ticketId = makeTicketId();

  // Create server-side Supabase client (service role; bypasses RLS)
  const supabaseAdmin = createSupabaseServerClient({ serviceRole: true });

  // Insert into public.support_tickets
  const { error } = await supabaseAdmin.from('support_tickets').insert({
    ticket_id: ticketId,
    subject: data.subject,
    email: data.email,
    category: data.category,
    details: data.details,
    route: data.route ?? null,
    user_id: data.userId ?? null,
    status: 'open',
    priority: 'normal',
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[SupportTicket][InsertError]', error);
    return res.status(500).json({ ok: false, message: 'Failed to save ticket.' });
  }

  // Optional: log for debugging (remove in production)
  // eslint-disable-next-line no-console
  console.log('[SupportTicket][Created]', { ticketId, email: data.email, category: data.category });

  return res.status(200).json({
    ok: true,
    ticketId,
    message: 'Support request received. We’ll get back within 24 hours.',
  });
}

/** Optional: increase body size limit for long descriptions */
export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
