// components/premium-ui/AdminPinReset.tsx
import React, { useState } from 'react';

export const AdminPinReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const res = await fetch('/api/admin/set-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPin: pin }),
    });
    const j = await res.json();
    if (j.ok) setMsg(`✅ Success: ${j.status}`);
    else setMsg(`❌ ${j.error}`);
  };

  return (
    <div className="pr-max-w-md pr-mx-auto pr-p-6 pr-bg-white/5 pr-rounded-lg pr-border pr-border-white/20 pr-space-y-4">
      <h2 className="pr-text-xl pr-font-semibold pr-text-white">Admin PIN Reset</h2>
      <form onSubmit={submit} className="pr-space-y-3">
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-py-2 pr-px-3"
        />
        <input
          type="password"
          placeholder="New PIN (4–6 digits)"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="pr-w-full pr-rounded-lg pr-bg-white/10 pr-py-2 pr-px-3"
        />
        <button type="submit" className="pr-w-full pr-bg-emerald-500 pr-py-2 pr-rounded-lg hover:pr-bg-emerald-600">
          Set PIN
        </button>
      </form>
      {msg && <p className="pr-text-sm pr-text-white">{msg}</p>}
    </div>
  );
};
