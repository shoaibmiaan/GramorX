import React from "react"; import { cn } from "../utils/cn";
export function Timer({ seconds, total, className }: { seconds: number; total: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  return (
    <div className={cn("pr-grid pr-gap-2", className)}>
      <div className="pr-text-center pr-text-sm pr-text-muted">{seconds}s / {total}s</div>
      <div className="pr-h-3 pr-bg-text/10 pr-rounded-full pr-overflow-hidden"><div className="pr-h-full pr-bg-primary" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}