import React, { useEffect, useRef, useState } from "react";
import { Card } from "../atoms/Card";
import { Button } from "../atoms/Button";

type Props = { onSuccess: () => void; digits?: number };

export function PinLock({ onSuccess, digits = 6 }: Props) {
  const [vals, setVals] = useState<string[]>(Array.from({ length: digits }, () => ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => { inputsRef.current[0]?.focus(); }, []);

  const pin = vals.join("");
  const canSubmit = /^\d{4,8}$/.test(pin);

  const onChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setVals(old => {
      const next = [...old]; next[i] = d; return next;
    });
    if (d && i < digits - 1) inputsRef.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < digits - 1) inputsRef.current[i + 1]?.focus();
    if (e.key === "Enter" && canSubmit) submit();
  };

  const paste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    if (!txt) return;
    e.preventDefault();
    const next = Array.from({ length: digits }, (_, i) => txt[i] ?? "");
    setVals(next);
    inputsRef.current[Math.min(txt.length, digits) - 1 || 0]?.focus();
  };

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true); setError(null);
    try {
      const vres = await fetch("/api/premium/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const vjson = await vres.json();
      if (!vres.ok || !vjson.ok) {
        setError(vjson?.error || "Verification failed");
        setBusy(false);
        return;
      }
      // set cookie
      await fetch("/api/premium/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Network error");
      setBusy(false);
    }
  };

  return (
    <Card className="pr-max-w-md pr-mx-auto pr-text-center pr-p-8 pr-bg-surface premium-glass">
      <h2 className="pr-text-2xl pr-font-semibold pr-mb-2">Enter Premium PIN</h2>
      <p className="pr-text-sm pr-text-muted pr-mb-6">Access is restricted. Please enter your assigned PIN.</p>

      <div className="pr-flex pr-justify-center pr-gap-2 pr-mb-4" onPaste={paste}>
        {vals.map((v, i) => (
          <input
            key={i}
            ref={el => (inputsRef.current[i] = el)}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={v}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="pr-w-12 pr-h-14 pr-text-center pr-text-xl pr-rounded-2xl pr-border pr-border-border pr-bg-surface focus:pr-outline-none focus:pr-ring-2 focus:pr-ring-ring/80"
          />
        ))}
      </div>

      {error ? <div className="pr-text-danger pr-text-sm pr-mb-3">{error}</div> : null}

      <div className="pr-flex pr-justify-center pr-gap-2">
        <Button onClick={submit} loading={busy} disabled={!canSubmit}>Unlock</Button>
        <Button variant="secondary" onClick={() => setVals(Array.from({ length: digits }, () => ""))}>Clear</Button>
      </div>

      <p className="pr-text-xs pr-text-muted pr-mt-4">Need help? Contact support to set or reset your PIN.</p>
    </Card>
  );
}
