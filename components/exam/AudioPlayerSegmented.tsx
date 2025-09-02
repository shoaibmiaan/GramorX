// components/exam/AudioPlayerSegmented.tsx
import * as React from 'react';

export type AudioSegment = {
  label?: string;
  start: number; // seconds
  end?: number;  // seconds (optional for last)
};

export type AudioPlayerSegmentedProps = {
  src: string;
  segments?: AudioSegment[];
  initialRate?: number;     // 0.75..2
  loopSegment?: boolean;
  className?: string;
  onSegmentChange?: (index: number) => void;
};

export function AudioPlayerSegmented({
  src,
  segments = [],
  initialRate = 1.0,
  loopSegment = false,
  className,
  onSegmentChange,
}: AudioPlayerSegmentedProps) {
  const ref = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [rate, setRate] = React.useState(initialRate);
  const [seg, setSeg] = React.useState(segments.length ? 0 : -1);
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = rate;
  }, [rate]);

  React.useEffect(() => {
    onSegmentChange?.(seg);
  }, [seg, onSegmentChange]);

  function playPause() {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  function seekTo(t: number) {
    const el = ref.current;
    if (!el) return;
    el.currentTime = t;
  }

  function gotoSegment(i: number) {
    if (i < 0 || i >= segments.length) return;
    setSeg(i);
    seekTo(segments[i].start);
    if (!playing) void ref.current?.play().then(() => setPlaying(true));
  }

  function nextSeg() {
    if (!segments.length) return;
    gotoSegment(Math.min(seg + 1, segments.length - 1));
  }

  function prevSeg() {
    if (!segments.length) return;
    gotoSegment(Math.max(seg - 1, 0));
  }

  function onTimeUpdate() {
    const el = ref.current;
    if (!el) return;
    const t = el.currentTime;
    setTime(t);

    if (segments.length && seg >= 0) {
      const { start, end } = segments[seg];
      const stopAt = end ?? Number.POSITIVE_INFINITY;

      // Auto-advance or loop
      if (t >= stopAt) {
        if (loopSegment) {
          seekTo(start);
        } else if (seg < segments.length - 1) {
          gotoSegment(seg + 1);
        } else {
          setPlaying(false);
          el.pause();
        }
      }
    } else if (segments.length) {
      // Determine current segment by time (first render / manual seek)
      const idx = segments.findIndex(({ start, end }) => t >= start && t < (end ?? Infinity));
      if (idx !== -1 && idx !== seg) setSeg(idx);
    }
  }

  function onLoadedMetadata() {
    // snap to first segment if defined
    if (segments.length && seg === -1) {
      setSeg(0);
      seekTo(segments[0].start);
    }
  }

  function setRateSafe(r: number) {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = r;
    setRate(r);
  }

  const dur = ref.current?.duration ?? 0;
  const progress = dur > 0 ? Math.min(100, (time / dur) * 100) : 0;

  return (
    <div className={['rounded-2xl border border-border bg-card p-3 shadow-card', className || ''].join(' ')}>
      <audio
        ref={ref}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-foreground/5"
          onClick={prevSeg}
          disabled={!segments.length || seg <= 0}
          title="Previous segment"
        >
          ◀
        </button>
        <button
          type="button"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={playPause}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-foreground/5"
          onClick={nextSeg}
          disabled={!segments.length || seg >= segments.length - 1}
          title="Next segment"
        >
          ▶
        </button>

        <div className="ml-3 inline-flex items-center gap-1">
          <span className="text-xs text-foreground/70">Speed</span>
          <select
            className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
            value={rate}
            onChange={(e) => setRateSafe(Number(e.target.value))}
          >
            {[0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2].map((r) => (
              <option key={r} value={r}>
                {r.toFixed(2)}×
              </option>
            ))}
          </select>
        </div>

        {segments.length > 0 && seg >= 0 && (
          <div className="ml-auto text-xs text-foreground/80">
            Segment {seg + 1}/{segments.length}
            {segments[seg].label ? ` • ${segments[seg].label}` : ''}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      {/* Segment rail */}
      {segments.length > 0 && (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {segments.map((s, i) => {
            const active = i === seg;
            return (
              <button
                key={`${s.start}-${s.end ?? 'end'}`}
                type="button"
                onClick={() => gotoSegment(i)}
                className={[
                  'truncate rounded-lg border px-2 py-1 text-xs',
                  active ? 'border-primary bg-primary/10' : 'border-border hover:bg-foreground/5',
                ].join(' ')}
                title={s.label ? `Jump to ${s.label}` : `Jump to ${i + 1}`}
              >
                {s.label ?? `Part ${i + 1}`}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
