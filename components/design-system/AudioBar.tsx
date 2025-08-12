import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Uncontrolled mode (self-contained audio element)
 */
export type AudioBarUncontrolledProps = {
  /** URL of the audio source */
  src: string;
  /** Preload hint for <audio> */
  preload?: 'none' | 'metadata' | 'auto';
  /** Fired when internal <audio> ends */
  onEnded?: () => void;
  className?: string;
};

/**
 * Controlled mode (external audio element; parent manages playback state)
 */
export type AudioBarControlledProps = {
  /** current playback position (in seconds) */
  current: number;
  /** total track duration (in seconds) */
  duration: number;
  /** whether audio is currently playing */
  playing: boolean;
  /** request seek to seconds (parent should move audio element) */
  onSeek: (seconds: number) => void;
  /** toggle play/pause (parent should play/pause audio element) */
  onTogglePlay: () => void;
  className?: string;
};

type AudioBarProps = AudioBarUncontrolledProps | AudioBarControlledProps;

const isControlled = (
  p: AudioBarProps
): p is AudioBarControlledProps =>
  typeof (p as AudioBarControlledProps).current === 'number' &&
  typeof (p as AudioBarControlledProps).duration === 'number';

const formatTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, '0')}`;
};

/**
 * Design‑system AudioBar.
 * - Tokenized classes only (no hex).
 * - Works in light/dark.
 * - Keyboard accessible.
 * - Supports both controlled and uncontrolled modes.
 */
export const AudioBar: React.FC<AudioBarProps> = (props) => {
  // Uncontrolled state (ignored in controlled mode)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ucDuration, setUcDuration] = useState(0);
  const [ucCurrent, setUcCurrent] = useState(0);
  const [ucPlaying, setUcPlaying] = useState(false);

  // Derived values
  const current = isControlled(props) ? props.current : ucCurrent;
  const duration = isControlled(props) ? props.duration : ucDuration;
  const playing = isControlled(props) ? props.playing : ucPlaying;

  const pct = useMemo(
    () => (duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0),
    [current, duration]
  );

  // Wire events in uncontrolled mode only
  useEffect(() => {
    if (isControlled(props)) return; // parent manages audio
    const el = audioRef.current;
    if (!el) return;

    const onTime = () => setUcCurrent(el.currentTime || 0);
    const onLoaded = () => setUcDuration(el.duration || 0);
    const onPlay = () => setUcPlaying(true);
    const onPause = () => setUcPlaying(false);
    const onEnded = () => {
      setUcPlaying(false);
      props.onEnded?.();
    };

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, [props]);

  const handleToggle = () => {
    if (isControlled(props)) {
      props.onTogglePlay();
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (ucPlaying) el.pause();
    else el.play().catch(() => {});
  };

  const handleSeek = (nextPct: number) => {
    const nextSeconds = (nextPct / 100) * (duration || 0);
    if (isControlled(props)) {
      props.onSeek(nextSeconds);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = nextSeconds;
    setUcCurrent(nextSeconds);
  };

  const className = (props as any).className || '';

  return (
    <div className={`card-surface rounded-ds p-3 flex items-center gap-3 ${className}`}>
      {/* Uncontrolled internal audio element */}
      {!isControlled(props) && (
        <audio
          ref={audioRef}
          src={(props as AudioBarUncontrolledProps).src}
          preload={(props as AudioBarUncontrolledProps).preload ?? 'metadata'}
          className="hidden"
        />
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="h-9 w-9 rounded-ds border border-purpleVibe/20 flex items-center justify-center hover:bg-purpleVibe/10"
        aria-label={playing ? 'Pause audio' : 'Play audio'}
      >
        <i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
      </button>

      <div className="flex-1">
        <div
          className="h-2 w-full rounded-ds bg-gray-200 dark:bg-white/10 overflow-hidden"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Seek"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') handleSeek(Math.max(0, pct - 2));
            if (e.key === 'ArrowRight') handleSeek(Math.min(100, pct + 2));
          }}
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const clickPct = ((e.clientX - rect.left) / rect.width) * 100;
            handleSeek(Math.min(100, Math.max(0, clickPct)));
          }}
        >
          <div
            className="h-full rounded-ds bg-primary dark:bg-electricBlue transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="tabular-nums text-small w-16 text-right">
        {formatTime(current)}
      </div>
    </div>
  );
};
