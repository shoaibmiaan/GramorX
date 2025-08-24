import * as React from 'react';


export function PrAudioPlayer({ src, lockSeeking = true }: { src: string; lockSeeking?: boolean }) {
const ref = React.useRef<HTMLAudioElement>(null);
const [played, setPlayed] = React.useState(0);


React.useEffect(() => {
const el = ref.current; if (!el) return;
const onTime = () => setPlayed(el.currentTime);
el.addEventListener('timeupdate', onTime);
return () => el.removeEventListener('timeupdate', onTime);
}, []);


const onSeekAttempt = (e: React.SyntheticEvent<HTMLAudioElement>) => {
if (!lockSeeking) return;
const el = e.currentTarget;
// Prevent seeking forward beyond played position
if (el.currentTime > played + 0.5) el.currentTime = played;
};


return (
<div className="pr-flex pr-gap-2 pr-items-center">
<audio ref={ref} src={src} controls onSeeked={onSeekAttempt} className="pr-w-full" />
</div>
);
}