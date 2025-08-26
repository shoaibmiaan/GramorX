// pages/api/admin/students/actions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/requireRole';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'http://localhost:3000';

type Action =
  | 'impersonate'
  | 'disable'
  | 'enable'
  | 'reset_password'
  | 'change_role';

type Body = {
  action: Action;
  userId: string;
  role?: 'student' | 'teacher' | 'admin' | (string & {});
};

type ApiOk = { ok: true; message: string; link?: string };
type ApiErr = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiOk | ApiErr>
) {
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, userId, role } = (req.body || {}) as Body;
    if (!action || !userId) {
      return res.status(400).json({ error: 'Missing action or userId' });
    }

    // Load user once for downstream actions
    const { data: userResp, error: userErr } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userResp?.user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResp.user;
    const email = (user.email ?? user.user_metadata?.email) as string | null;
    if (!email && action !== 'change_role') {
      // Email is required for link-based actions
      return res.status(400).json({ error: 'User has no email on record' });
    }

    // ---- Actions ----------------------------------------------------------
    if (action === 'impersonate') {
      // Redirect updated per request: land on /admin/imp-as and show banner
      const redirectTo = `${SITE_URL}/admin/imp-as?imp=1&u=${encodeURIComponent(
        userId
      )}`;
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email as string,
        options: { redirectTo },
      });
      if (error) throw error;
      return res.status(200).json({
        ok: true,
        message: 'Impersonation link created.',
        link: data?.properties?.action_link,
      });
    }

    if (action === 'reset_password') {
      const redirectTo = `${SITE_URL}/auth/callback`;
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email as string,
        options: { redirectTo },
      });
      if (error) throw error;
      return res.status(200).json({
        ok: true,
        message: 'Password reset link generated.',
        link: data?.properties?.action_link,
      });
    }

    if (action === 'disable') {
      // 1) Mark profile as disabled (primary gate used by app)
      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'disabled' })
        .eq('id', userId);
      if (profErr) throw profErr;

      // 2) Mirror flag in app_metadata (clients read-only)
      const newAppMeta = { ...(user.app_metadata ?? {}), disabled: true };
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { app_metadata: newAppMeta }
      );
      if (updErr) throw updErr;

      return res
        .status(200)
        .json({ ok: true, message: 'User disabled successfully.' });
    }

    if (action === 'enable') {
      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);
      if (profErr) throw profErr;

      const appMeta = { ...(user.app_metadata ?? {}) };
      // remove disabled flag if present
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { disabled, ...rest } = appMeta as Record<string, unknown>;
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { app_metadata: rest }
      );
      if (updErr) throw updErr;

      return res
        .status(200)
        .json({ ok: true, message: 'User enabled successfully.' });
    }

    if (action === 'change_role') {
      if (!role) return res.status(400).json({ error: 'Missing role' });

      // Update application profile
      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (profErr) throw profErr;

      // Reflect in app_metadata.role (server-only)
      const newAppMeta = { ...(user.app_metadata ?? {}), role };
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { app_metadata: newAppMeta }
      );
      if (updErr) throw updErr;

      return res
        .status(200)
        .json({ ok: true, message: `Role changed to ${role}.` });
    }

    return res.status(400).json({ error: 'Unsupported action' });
  } catch (e) {
    const message =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
