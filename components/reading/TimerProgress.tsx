import React, { useEffect, useState } from 'react';

export default function TimerProgress({ total = 40, elapsedSec = 0 }: { total?: number; elapsedSec?: number }) {
  const [sec, setSec] = useState(elapsedSec);
  useEffect(() => { const id = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(id); }, []);
  const mins = Math.floor(sec / 60), rem = sec % 60;
  const pct = Math.min(100, Math.round((sec / (60 * 60)) * 100)); // assume 60min test for now

  return (
    <div className="sticky top-0 z-10 mb-6">
      <div className="w-full h-2 bg-white/10 rounded-ds overflow-hidden">
        <div className="h-full bg-electricBlue" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-small opacity-80">Time: {mins}:{String(rem).padStart(2, '0')} • Answered: 0/{total}</div>
    </div>
  );
}
