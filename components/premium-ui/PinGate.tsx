// components/premium-ui/PinGate.tsx
import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Props = {
  onUnlock: () => void;            // called when PIN verified
  title?: string;                  // optional heading
  helpText?: string;               // optional hint text
};

export const PinGate: React.FC<Props> = ({ onUnlock, title = 'Enter Premium PIN', helpText }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<'error' | 'info' | 'success'>('info');

  useEffect(() => { setMsg(null); }, [pin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!/^\d{4,6}$/.test(pin)) {
      setMsgTone('error');
      setMsg('PIN must be 4–6 digits.');
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const access = sessionData?.session?.access_token;
      if (!access) {
        setMsgTone('error');
        setMsg('You must be logged in to enter the Premium Room.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/premium/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ pin }),
      });

      const json = await res.json();

      if ('error' in json) {
        setMsgTone('error');
        setMsg(json.error || 'Something went wrong.');
      } else if (json.success) {
        setMsgTone('success');
        setMsg('PIN verified. Welcome!');
        setTimeout(onUnlock, 300);
      } else {
        setMsgTone('error');
        setMsg(
          json.reason === 'NO_PIN_SET'
            ? 'No PIN found for your account. Please contact support.'
            : 'Invalid PIN. Try again.'
        );
      }
    } catch (err: any) {
      setMsgTone('error');
      setMsg(err?.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pr-w-full pr-max-w-sm pr-mx-auto pr-space-y-4 pr-rounded-xl pr-border pr-border-white/10 pr-bg-white/5 pr-backdrop-blur pr-p-6">
      <div className="pr-space-y-1">
        <h2 className="pr-text-xl pr-font-semibold">{title}</h2>
        {helpText ? (
          <p className="pr-text-sm pr-text-white/70">{helpText}</p>
        ) : (
          <p className="pr-text-sm pr-text-white/60">PIN is 4–6 digits.</p>
        )}
      </div>

      <form onSubmit={submit} className="pr-space-y-3">
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          placeholder="••••••"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="pr-w-full pr-text-center pr-text-2xl pr-tracking-widest pr-font-mono pr-rounded-lg pr-bg-white/10 pr-border pr-border-white/20 pr-py-3 pr-px-4 focus:pr-ring-2 focus:pr-ring-emerald-400/60"
        />

        <button
          type="submit"
          disabled={loading}
          className="pr-inline-flex pr-items-center pr-justify-center pr-w-full pr-rounded-lg pr-px-4 pr-py-2 pr-font-medium pr-bg-emerald-500 hover:pr-bg-emerald-600 disabled:pr-opacity-60"
        >
          {loading ? 'Verifying…' : 'Unlock'}
        </button>
      </form>

      {msg && (
        <div
          className={
            msgTone === 'success'
              ? 'pr-text-sm pr-text-emerald-300'
              : msgTone === 'error'
              ? 'pr-text-sm pr-text-rose-300'
              : 'pr-text-sm pr-text-white/80'
          }
        >
          {msg}
        </div>
      )}

      <div className="pr-text-xs pr-text-white/50 pr-pt-2">
        Having trouble? Make sure you’re logged in with the correct account.
      </div>
    </div>
  );
};

export default PinGate;
