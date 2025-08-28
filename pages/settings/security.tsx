import React, { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface SessionInfo {
  id: string;
  user_agent: string | null;
  created_at: string;
  ip: string | null;
}

interface LoginEvent {
  id: number;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export default function SecuritySettings() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [logins, setLogins] = useState<LoginEvent[]>([]);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/sessions')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setSessions(data));
    fetch('/api/auth/login-events')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setLogins(data));
    supabase.auth.mfa.listFactors().then(({ data }) => {
      if (data?.factors?.length) {
        setMfaEnabled(true);
      }
    });
  }, []);

  async function enableMfa() {
    const { data, error } = await supabase.auth.mfa.enroll({
      // Email OTP factor (cast for types)
      factorType: 'email' as any,
    });
    if (error) return;
    setFactorId(data.id);
    await supabase.auth.mfa.challenge({ factorId: data.id });
    setOtpSent(true);
  }

  async function verifyMfa() {
    if (!factorId) return;
    const { error } = await supabase.auth.mfa.verify({ factorId, code: otp });
    if (!error) {
      setMfaEnabled(true);
      setOtp('');
      setOtpSent(false);
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/auth/sessions/${id}`, { method: 'DELETE' });
    setSessions((s) => s.filter((x) => x.id !== id));
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 rounded-ds-2xl space-y-8">
            <h1 className="font-slab text-display">Security</h1>

            <div>
              <h2 className="font-slab text-h3 mb-2">Multi-Factor Auth</h2>
              {mfaEnabled ? (
                <p className="text-body">Email OTP is enabled.</p>
              ) : otpSent ? (
                <div className="space-y-2 max-w-xs">
                  <Input label="Enter code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <Button onClick={verifyMfa}>Verify</Button>
                </div>
              ) : (
                <Button onClick={enableMfa}>Enable Email OTP</Button>
              )}
            </div>

            <div>
              <h2 className="font-slab text-h3 mb-2">Active Sessions</h2>
              {sessions.length === 0 ? (
                <p className="text-body">No other sessions.</p>
              ) : (
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-body">
                      <span>{s.user_agent || 'Unknown'}{s.ip ? ` • ${s.ip}` : ''}</span>
                      <Button size="sm" variant="secondary" onClick={() => revoke(s.id)}>
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="font-slab text-h3 mb-2">Login History</h2>
              {logins.length === 0 ? (
                <p className="text-body">No logins recorded.</p>
              ) : (
                <ul className="space-y-1 text-small">
                  {logins.map((l) => (
                    <li key={l.id}>
                      {new Date(l.created_at).toLocaleString()} – {l.ip_address || ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
