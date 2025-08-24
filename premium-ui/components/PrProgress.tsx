import * as React from 'react';


export function PrProgress({ value }: { value: number }) {
const v = Math.max(0, Math.min(100, value));
return (
<div className="pr-w-full pr-h-2 pr-rounded-full pr-bg-[color-mix(in oklab,var(--pr-card),white 6%)] pr-overflow-hidden">
<div className="pr-h-full pr-bg-[var(--pr-primary)]" style={{ width: `${v}%` }} />
</div>
);
}