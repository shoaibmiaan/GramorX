import type { NextApiRequest } from 'next';
import type { User } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type AppRole = 'admin' | 'teacher' | 'student';

function getCookieToken(req: NextApiRequest): string | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL as string;
  const projectRef = url.replace(/^https?:\/\//, '').split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const raw = req.cookies[cookieName];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}

export async function requireRole(
  req: NextApiRequest,
  allowed: AppRole[]
): Promise<{ user: User; role: AppRole }> {
  const authHeader = req.headers.authorization || '';
  let token: string | null = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = getCookieToken(req);
  }
  if (!token) throw new Error('unauthorized');

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) throw new Error('unauthorized');
  const user = data.user;

  interface RoleMetadata {
    role?: AppRole;
  }

  let role =
    (user.app_metadata as RoleMetadata).role ??
    (user.user_metadata as RoleMetadata).role ??
    null;

  if (!role) {
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = (prof?.role as AppRole | undefined) ?? null;
  }

  if (!role || !allowed.includes(role)) throw new Error('forbidden');

  return { user, role };
}
