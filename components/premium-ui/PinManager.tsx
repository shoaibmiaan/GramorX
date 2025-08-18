// components/premium-ui/PinManager.tsx
import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Mode = 'loading' | 'create' | 'change';
type Tone = 'info' | 'success' | 'error';

export const PinManager: React.FC = () => {
  const [mode, setMode] = useState<Mode>('loading');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>('info');

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const access = sessionData?.session?.access_token;
      if (!access) {
        setTone('error');
        setMsg('You must be logged in.');
        setMode('loading');
        return;
      }
      const r = await fetch('/api/premium/pin-status', {
        headers: { Authorization: `Bearer ${access}` },
      });
      const j = await r.json();
      setMode(j?.exists ? 'change' : 'create');
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPin !== confirm) {
      setTone('error');
      setMsg('New PIN and confirmation do not match.');
      return;
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      setTone('error');
      setMsg('PIN must be 4–6 digits.');
      return;
    }

    setBusy(true);
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const access = sessionData?.session?.access_token;
      if (!access) {
        setTone('error'); setMsg('Not logged in.'); setBusy(false); return;
      }
      const r = await fetch('/api/premium/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
        body: JSON.stringify({ currentPin: mode === 'change' ? currentPin : undefined, newPin }),
      });
      const j = await r.json();

      if (j?.ok) {
        setTone('success');
        setMsg(j.status === 'CREATED' ? 'PIN set successfully.' : 'PIN updated successfully.');
        setCurrentPin(''); setNewPin(''); setConfirm('');
        setMode('change');
      } else {
        if (j?.reason === 'INVALID_CURRENT') {
          setTone('error'); setMsg('Current PIN is incorrect.');
        } else if (j?.reason === 'INVALID_NEW') {
          setTone('error'); setMsg('New PIN must be 4–6 digits.');
        } else {
          setTone('error'); setMsg(j?.error || 'Something went wrong.');
        }
      }
    } catch (err: any) {
      setTone('error'); setMsg(err?.message || 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'loading') {
    return (
      <div className="pr-w-full pr-max-w-sm pr-mx-auto pr-rounded-xl pr-border pr-border-white/10 pr-bg-white/5 pr-backdrop-blur pr-p-6 pr-text-white/80">
        Checking PIN status…
      </div>
    );
  }

  return (
    <div className="pr-w-full pr-max-w-sm pr-mx-auto pr-space-y-4 pr-rounded-xl pr-border pr-border-white/10 pr-bg-white/5 pr-backdrop-blur pr-p-6">
      <div className="pr-space-y-1">
        <h2 className="pr-text-xl pr-font-semibold pr-text-white">
          {mode === 'create' ? 'Set your Premium PIN' : 'Change your Premium PIN'}
        </h2>
        <p className="pr-text-sm pr-text-white/70">Use 4–6 digits. Keep it private.</p>
      </div>

      <form onSubmit={submit} className="pr-space-y-3">
        {mode === 'change' && (
          <div className="pr-space-y-1">
            <label className="pr-text-sm pr-text-white/80">Current PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••••"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-border pr-border-white/20 pr-py-2 pr-px-3 focus:pr-ring-2 focus:pr-ring-emerald-400/60"
            />
          </div>
        )}

        <div className="pr-space-y-1">
          <label className="pr-text-sm pr-text-white/80">New PIN</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="••••"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-border pr-border-white/20 pr-py-2 pr-px-3 focus:pr-ring-2 focus:pr-ring-emerald-400/60"
          />
        </div>

        <div className="pr-space-y-1">
          <label className="pr-text-sm pr-text-white/80">Confirm New PIN</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-border pr-border-white/20 pr-py-2 pr-px-3 focus:pr-ring-2 focus:pr-ring-emerald-400/60"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="pr-inline-flex pr-items-center pr-justify-center pr-w-full pr-rounded-lg pr-px-4 pr-py-2 pr-font-medium pr-bg-emerald-500 hover:pr-bg-emerald-600 disabled:pr-opacity-60"
        >
          {busy ? 'Saving…' : mode === 'create' ? 'Set PIN' : 'Change PIN'}
        </button>
      </form>

      {msg && (
        <div className={tone === 'success' ? 'pr-text-emerald-300' : tone === 'error' ? 'pr-text-rose-300' : 'pr-text-white/80'}>
          {msg}
        </div>
      )}

      <div className="pr-text-xs pr-text-white/50 pr-pt-2">
        Note: PIN is stored securely (hashed) and checked server-side.
      </div>
    </div>
  );
};

export default PinManager;
