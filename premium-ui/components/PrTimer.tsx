import * as React from 'react';


export function PrTimer({ seconds, onElapsed }: { seconds: number; onElapsed?: () => void }) {
const [left, setLeft] = React.useState(seconds);
React.useEffect(() => {
setLeft(seconds);
const id = setInterval(() => setLeft(l => (l > 0 ? l - 1 : 0)), 1000);
return () => clearInterval(id);
}, [seconds]);
React.useEffect(() => { if (left === 0) onElapsed?.(); }, [left, onElapsed]);
const mm = String(Math.floor(left / 60)).padStart(2, '0');
const ss = String(left % 60).padStart(2, '0');
return (
<div className="pr-font-mono pr-text-lg pr-rounded-lg pr-px-2 pr-py-1 pr-bg-[var(--pr-card)] pr-border pr-border-[var(--pr-border)] pr-inline-flex pr-items-center pr-gap-2">
⏱️ <span>{mm}:{ss}</span>
</div>
);
}