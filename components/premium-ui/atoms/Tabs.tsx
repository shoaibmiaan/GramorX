import React, { useState } from "react"; import { cn } from "../utils/cn";
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div className="pr-grid pr-gap-3">
      <div className="pr-flex pr-gap-2 pr-bg-surface pr-border pr-border-border pr-rounded-2xl pr-p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} className={cn("pr-px-3 pr-py-2 pr-rounded-xl pr-text-sm", active === t.id ? "pr-bg-primary pr-text-primaryFg" : "hover:pr-bg-surface/60")}>{t.label}</button>
        ))}
      </div>
      <div>{tabs.find(t => t.id === active)?.content}</div>
    </div>
  );
}