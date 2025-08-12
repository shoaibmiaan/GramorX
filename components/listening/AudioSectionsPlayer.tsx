import React, { useEffect, useMemo, useRef, useState } from 'react';
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

export default function AudioSectionsPlayer({ sections }: { sections: Section[] }) {
  const ordered = useMemo(() => [...sections].sort((a, b) => a.order_no - b.order_no), [sections]);
  const [i, setI] = useState(0);
  const [showTranscript, setShowTranscript] = useState<Record<string, boolean>>({});
  const [autoPlay, setAutoPlay] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const s = ordered[i];

  if (!ordered.length) {
    return (
      <Alert variant="warning" title="No audio">
        No sections available.
      </Alert>
    );
  }

  // (Re)load section
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !s) return;
    setPlaying(false);
    el.src = s.audio_url;
    el.currentTime = s.start_ms / 1000;
    // Attempt autoplay (requires user gesture in most browsers)
    el.play().then(() => setPlaying(true)).catch(() => {});
  }, [i, s?.audio_url, s?.start_ms]);

  // Wire audio events
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !s) return;

    const onLoaded = () => {
      const d = (s.end_ms - s.start_ms) / 1000;
      setDuration(d);
      setCurrent(0);
    };
    const onTime = () => {
      const endAbs = s.end_ms / 1000;
      const local = Math.min(Math.max(el.currentTime - s.start_ms / 1000, 0), duration || endAbs);
      setCurrent(local);
      if (el.currentTime >= endAbs - 0.05) {
        el.pause();
        setPlaying(false);
        if (autoPlay && i < ordered.length - 1) setI(i + 1);
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [i, s?.end_ms, s?.start_ms, duration, autoPlay, ordered.length]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => {});
  };

  const handleSeek = (seconds: number) => {
    const el = audioRef.current;
    if (!el || !s) return;
    const absolute = s.start_ms / 1000 + seconds;
    el.currentTime = absolute;
    setCurrent(seconds);
  };

  return (
    <Card className="card-surface p-6 rounded-ds-2xl">
      <div className="flex items-center gap-3">
        <Badge variant="info" size="sm">
          Section {s.order_no}
        </Badge>
        <Button variant="secondary" onClick={() => setAutoPlay((v) => !v)}>
          {autoPlay ? 'Auto-play: On' : 'Auto-play: Off'}
        </Button>
        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            disabled={i === 0}
            onClick={() => setI((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={i === ordered.length - 1}
            onClick={() => setI((p) => Math.min(ordered.length - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Hidden native audio for actual playback; UI via DS AudioBar (controlled mode) */}
      <audio ref={audioRef} className="sr-only" aria-hidden />

      <div className="mt-4">
        <AudioBar
          // controlled mode — matches player state
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
          onClick={() =>
            setShowTranscript((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
          }
          aria-expanded={!!showTranscript[s.id]}
        >
          {showTranscript[s.id] ? 'Hide transcript' : 'Show transcript'}
        </Button>

        {showTranscript[s.id] && s.transcript && (
          <Card className="p-4 mt-3">
            <p className="whitespace-pre-wrap text-body opacity-90">
              {s.transcript}
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
}
