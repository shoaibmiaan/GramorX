import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { AudioBar } from '@/components/design-system/AudioBar';

type Section = {
  id: string;
  order_no: number;
  audio_url: string;
  start_ms: number;
  end_ms: number;
  transcript?: string | null;
};

type Props = {
  sections: Section[];
  /** small pause between sections when auto-advancing */
  gapMs?: number;
  /** notify parent when active section changes (optional) */
  onSectionChange?: (orderNo: number) => void;
};

export default function AudioSectionsPlayer({
  sections,
  gapMs = 800,
  onSectionChange,
}: Props) {
  const ordered = useMemo(
    () => [...sections].sort((a, b) => a.order_no - b.order_no),
    [sections]
  );

  const [i, setI] = useState(0);
  const [showTranscript, setShowTranscript] = useState<Record<string, boolean>>({});
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);   // seconds within the section
  const [duration, setDuration] = useState(0); // section duration in seconds

  const audioRef = useRef<HTMLAudioElement>(null);
  const s = ordered[i];
  const hasNext = i < ordered.length - 1;

  if (!ordered.length) {
    return (
      <Alert variant="warning" title="No audio">
        No sections available.
      </Alert>
    );
  }

  // helper: (re)load a section, seek to start, try to play
  const loadAndPlaySection = useCallback(
    async (idx: number, autoplay = true) => {
      const el = audioRef.current;
      const sec = ordered[idx];
      if (!el || !sec) return;

      // If switching sections, swap media source first
      if (el.src !== sec.audio_url) {
        el.src = sec.audio_url;
      }

      const startS = (sec.start_ms ?? 0) / 1000;
      const endS = (sec.end_ms ?? 0) / 1000;
      const durS = Math.max(0, endS - startS);

      try {
        // seek to section start
        el.currentTime = startS;
      } catch {
        await new Promise((r) => setTimeout(r, 50));
        el.currentTime = startS;
      }

      setDuration(durS);
      setCurrent(0);
      setPlaying(false);

      setI(idx);
      onSectionChange?.(sec.order_no);

      // Try to play if allowed
      if (autoplay) {
        try {
          await el.play();
          setPlaying(true);
        } catch {
          setPlaying(false); // user gesture required
        }
      }
    },
    [ordered, onSectionChange]
  );

  // Initial prime: load first section (don’t force autoplay)
  useEffect(() => {
    if (!ordered.length) return;
    loadAndPlaySection(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered.length]);

  // Wire audio events for bounds + UI sync
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !s) return;

    const startS = (s.start_ms ?? 0) / 1000;
    const endS = (s.end_ms ?? 0) / 1000;

    const onLoaded = () => {
      const durS = Math.max(0, endS - startS);
      setDuration(durS);
      // If the media changed underneath, clamp to start
      const local = Math.max(0, el.currentTime - startS);
      setCurrent(Math.min(local, durS));
    };

    const onTime = () => {
      const local = Math.max(0, el.currentTime - startS);
      const durS = Math.max(0, endS - startS);
      const clampedLocal = Math.min(local, durS);
      setCurrent(clampedLocal);

      // Hard stop at end bound
      if (el.currentTime >= endS - 0.02) {
        el.pause();
        setPlaying(false);

        // Optional auto-advance to next section after a small gap
        if (autoAdvance && hasNext) {
          const nextIdx = i + 1;
          setTimeout(() => {
            loadAndPlaySection(nextIdx);
          }, gapMs);
        }
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (autoAdvance && hasNext) {
        const nextIdx = i + 1;
        setTimeout(() => loadAndPlaySection(nextIdx), gapMs);
      }
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, [i, s?.start_ms, s?.end_ms, autoAdvance, hasNext, gapMs, loadAndPlaySection]);

  // Play/pause from the DS AudioBar
  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => {});
  };

  // Seek within the current section from the DS AudioBar
  const handleSeek = (seconds: number) => {
    const el = audioRef.current;
    if (!el || !s) return;
    const startS = (s.start_ms ?? 0) / 1000;
    const endS = (s.end_ms ?? 0) / 1000;
    const durS = Math.max(0, endS - startS);
    const safe = Math.max(0, Math.min(seconds, durS));
    el.currentTime = startS + safe;
    setCurrent(safe);
  };

  const restartSection = () => loadAndPlaySection(i);

  return (
    <Card className="card-surface p-6 rounded-ds-2xl">
      <div className="flex items-center gap-3">
        <Badge variant="info" size="sm">
          Section {s.order_no}
        </Badge>

        <Button variant="secondary" onClick={() => setAutoAdvance((v) => !v)}>
          {autoAdvance ? 'Auto‑advance: On' : 'Auto‑advance: Off'}
        </Button>

        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            disabled={i === 0}
            onClick={() => loadAndPlaySection(Math.max(0, i - 1))}
            aria-label="Previous section"
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={!hasNext}
            onClick={() => loadAndPlaySection(Math.min(ordered.length - 1, i + 1))}
            aria-label="Next section"
          >
            Next
          </Button>
          <Button variant="accent" onClick={restartSection} aria-label="Restart section">
            Restart
          </Button>
        </div>
      </div>

      {/* Hidden native audio for actual playback; DS AudioBar drives UI */}
      <audio ref={audioRef} className="sr-only" aria-hidden />

      <div className="mt-3 text-small text-grayish">
        Bounds: <code>{Math.floor((s.start_ms ?? 0) / 1000)}s → {Math.floor((s.end_ms ?? 0) / 1000)}s</code>
      </div>

      <div className="mt-4">
        <AudioBar
          current={current}
          duration={duration}
          playing={playing}
          onSeek={handleSeek}
          onTogglePlay={togglePlay}
        />
      </div>

      <div className="mt-4">
        <Button
          variant="primary"
          onClick={() => setShowTranscript((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
          aria-expanded={!!showTranscript[s.id]}
        >
          {showTranscript[s.id] ? 'Hide transcript' : 'Show transcript'}
        </Button>

        {showTranscript[s.id] && (
          <Card className="p-4 mt-3 rounded-ds-2xl">
            {s.transcript ? (
              <p className="whitespace-pre-wrap text-body opacity-90">{s.transcript}</p>
            ) : (
              <p className="text-small text-grayish">No transcript for this section.</p>
            )}
          </Card>
        )}
      </div>
    </Card>
  );
}
