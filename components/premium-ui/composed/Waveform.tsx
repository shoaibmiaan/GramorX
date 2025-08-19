import React, { useEffect, useRef } from "react";
export function Waveform({ samples = [] as number[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;
    const w = canvas.width, h = canvas.height; ctx.clearRect(0,0,w,h); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(99,102,241,1)"; ctx.beginPath();
    const len = samples.length || 1; for (let i=0;i<len;i++) { const x = (i / (len-1)) * w; const y = h/2 + (samples[i] ?? 0) * (h/2 - 4); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
  }, [samples]);
  return <canvas ref={canvasRef} width={600} height={96} className="pr-w-full pr-h-24 pr-rounded-xl pr-bg-surface pr-border pr-border-border premium-glass" />;
}