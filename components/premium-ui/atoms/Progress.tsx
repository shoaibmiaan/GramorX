import React from "react"; import { cn } from "../utils/cn";
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("pr-w-full pr-h-2 pr-bg-text/10 pr-rounded-full", className)} role="progressbar" aria-valuenow={value}>
      <div className="pr-h-2 pr-bg-primary pr-rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}