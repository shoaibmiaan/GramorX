import { useState } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { redirectByRole } from '@/lib/routeAccess';
import { getAuthErrorMessage } from '@/lib/authErrors';

// Helper to initiate an MFA challenge for a given user
export async function createMfaChallengeForUser(user: any) {
  const factors = (user as any)?.factors ?? [];
  if (!factors.length) return { factorId: null, challengeId: null };
  const f = factors[0];
  const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: f.id });
  if (error) {
    return { factorId: null, challengeId: null, error: getAuthErrorMessage(error) };
  }
  return { factorId: f.id as string, challengeId: challenge?.id ?? null };
}

// Helper to verify an MFA challenge
export async function verifyMfaOtp(factorId: string, challengeId: string, code: string) {
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
  if (error) {
    return { error: getAuthErrorMessage(error) };
  }
  try { await fetch('/api/auth/login-event', { method: 'POST' }); } catch {}
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirectByRole(user);
  return { error: null };
}

export default function useEmailLoginMFA() {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createChallenge(user: any) {
    const res = await createMfaChallengeForUser(user);
    if (res.error) {
      setError(res.error);
      return true;
    }
    if (res.factorId && res.challengeId) {
      setFactorId(res.factorId);
      setChallengeId(res.challengeId);
      setOtpSent(true);
      return true;
    }
    return false;
  }

  async function verifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!factorId || !challengeId) return;
    setVerifying(true);
    const res = await verifyMfaOtp(factorId, challengeId, otp);
    setVerifying(false);
    if (res.error) setError(res.error);
  }

  return { otp, setOtp, otpSent, createChallenge, verifyOtp, verifying, error, setError };
}
