import * as React from 'react';
import { Button } from '@/components/design-system/Button';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'AE', name: 'United Arab Emirates' },
];

export function WaitlistForm() {
  const [state, setState] = React.useState({
    name: '', email: '', phone: '', country: 'US', targetBand: '', testMonth: '',
  });
  const [msg, setMsg] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/waitlist/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...state,
        targetBand: state.targetBand ? Number(state.targetBand) : undefined,
      }),
    });
    setBusy(false);
    setMsg(res.ok ? 'Joined! We will notify you.' : (await res.json()).error ?? 'Failed');
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="rounded-lg border border-border bg-background px-3 py-2" placeholder="Full name"
               value={state.name} onChange={e=>setState(s=>({ ...s, name: e.target.value }))} required />
        <input className="rounded-lg border border-border bg-background px-3 py-2" placeholder="Email"
               type="email" value={state.email} onChange={e=>setState(s=>({ ...s, email: e.target.value }))} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select className="rounded-lg border border-border bg-background px-3 py-2"
                value={state.country} onChange={e=>setState(s=>({ ...s, country: e.target.value }))} required>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <input className="rounded-lg border border-border bg-background px-3 py-2" placeholder="Phone (international)"
               value={state.phone} onChange={e=>setState(s=>({ ...s, phone: e.target.value }))} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="rounded-lg border border-border bg-background px-3 py-2" placeholder="Target band (e.g., 7.5)"
               value={state.targetBand} onChange={e=>setState(s=>({ ...s, targetBand: e.target.value }))} />
        <input className="rounded-lg border border-border bg-background px-3 py-2" placeholder="Test month (YYYY-MM)"
               value={state.testMonth} onChange={e=>setState(s=>({ ...s, testMonth: e.target.value }))} />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" type="submit" disabled={busy}>Join Waitlist</Button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  );
}
