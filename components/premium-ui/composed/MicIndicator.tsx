import React from "react"; import { cn } from "../utils/cn";
export function MicIndicator({ active, level = 0, className }: { active: boolean; level?: number; className?: string }) {
  return (
    <div className={cn("pr-flex pr-items-center pr-gap-2", className)} aria-live="polite">
      <div className={cn("pr-h-3 pr-w-3 pr-rounded-full", active ? "pr-bg-success pr-animate-pulse" : "pr-bg-text/30")} />
      <span className="pr-text-sm pr-text-muted">{active ? "Recording…" : "Mic idle"}</span>
      <div className="pr-flex pr-gap-1 pr-ml-2">
        {new Array(8).fill(0).map((_, i) => (
          <div key={i} className="pr-w-1 pr-rounded pr-bg-primary/50" style={{ height: `${(i < Math.round(level * 8)) ? 12 + i*4 : 6}px` }} />
        ))}
      </div>
    </div>
  );
}