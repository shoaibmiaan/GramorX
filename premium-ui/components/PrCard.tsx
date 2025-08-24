import * as React from 'react';
import { twMerge } from 'tailwind-merge';


export function PrCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
return (
<div
className={twMerge('pr-rounded-2xl pr-bg-[var(--pr-card)] pr-border pr-border-[var(--pr-border)] pr-shadow-glow', className)}
{...props}
/>
);
}