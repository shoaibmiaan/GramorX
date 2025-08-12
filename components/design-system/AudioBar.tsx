import React, { useEffect, useMemo, useRef, useState } from 'react';

export type AudioBarProps = {
  src: string;
  preload?: 'none'|'metadata'|'auto';
  className?: string;
  onEnded?: () => void;
};

export const AudioBar: React.FC<AudioBarProps> = ({ src, preload='metadata', className='', onEnded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onLoaded = () => setDuration(el.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', () => { setPlaying(false); onEnded?.(); });
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [onEnded]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause(); else el.play();
  };

  const pct = duration ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;

  return (
    <div className={`card-surface rounded-ds p-3 flex items-center gap-3 ${className}`}>
      <audio ref={audioRef} src={src} preload={preload} />
      <button
        onClick={toggle}
        className="h-9 w-9 rounded-ds border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10"
        aria-label={playing ? 'Pause audio' : 'Play audio'}
      >
        <i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
      </button>
      <div className="flex-1">
        <div className="h-2 w-full rounded-ds bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div className="h-full rounded-ds bg-primary dark:bg-electricBlue transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="tabular-nums text-small w-16 text-right">
        {Math.floor(current/60).toString().padStart(2,'0')}:{Math.floor(current%60).toString().padStart(2,'0')}
      </div>
    </div>
  );
};
