// pages/admin/premium/pin.tsx
import React, { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminPremiumPin() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const call = async (path: string, body: any) => {
    setBusy(true); setMsg(null);
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const tok = data?.session?.access_token;
      if (!tok) { setMsg('Not logged in.'); return; }

      const r = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (j?.ok) setMsg('Success ✅');
      else setMsg(j?.error || j?.reason || 'Failed');
    } catch (e: any) {
      setMsg(e?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="pr-min-h-[100dvh] pr-flex pr-items-center pr-justify-center pr-bg-gradient-to-b pr-from-black pr-to-neutral-900 pr-text-white pr-p-4">
      <div className="pr-w-full pr-max-w-md pr-space-y-4 pr-rounded-xl pr-border pr-border-white/10 pr-bg-white/5 pr-backdrop-blur pr-p-6">
        <h1 className="pr-text-xl pr-font-semibold">Admin · Premium PIN</h1>

        <label className="pr-block pr-text-sm pr-text-white/80">User Email</label>
        <input
          className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-border pr-border-white/20 pr-py-2 pr-px-3"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="pr-block pr-text-sm pr-text-white/80">New PIN (4–6 digits)</label>
        <input
          className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-border pr-border-white/20 pr-py-2 pr-px-3"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="•••••"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />

        <div className="pr-flex pr-gap-3">
          <button
            disabled={busy}
            onClick={() => call('/api/admin/premium/set-pin', { email, newPin: pin })}
            className="pr-flex-1 pr-rounded-lg pr-bg-emerald-500 hover:pr-bg-emerald-600 pr-py-2 pr-font-medium disabled:pr-opacity-60"
          >
            Set / Update
          </button>
          <button
            disabled={busy}
            onClick={() => call('/api/admin/premium/clear-pin', { email })}
            className="pr-flex-1 pr-rounded-lg pr-bg-rose-500 hover:pr-bg-rose-600 pr-py-2 pr-font-medium disabled:pr-opacity-60"
          >
            Clear
          </button>
        </div>

        {msg && <div className="pr-text-sm">{msg}</div>}

        <p className="pr-text-xs pr-text-white/60">
          Access enforced server-side. Only emails in <code>ADMIN_EMAILS</code> can use these APIs.
        </p>
      </div>
    </main>
  );
}
