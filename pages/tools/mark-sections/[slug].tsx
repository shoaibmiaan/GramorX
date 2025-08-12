import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { AudioBar } from '@/components/design-system/AudioBar';
import { Input } from '@/components/design-system/Input';

type Mark = { start_ms: number | null; end_ms: number | null };

export default function MarkSections() {
  const router = useRouter();
  const slug = (router.query.slug as string) || 'ieltsfever-listening-practice-test-1';

  // Pre-fill with your URL; you can paste a different one in the input
  const [audioUrl, setAudioUrl] = useState<string>(
    'https://xypbinamxunmwkhlvefd.supabase.co/storage/v1/object/public/listening/IELTS_listening_test_0001/ielts-listening-practice-test-1.mp3'
  );

  // 4 sections
  const [marks, setMarks] = useState<Mark[]>([
    { start_ms: null, end_ms: null },
    { start_ms: null, end_ms: null },
    { start_ms: null, end_ms: null },
    { start_ms: null, end_ms: null },
  ]);
  const [idx, setIdx] = useState(0); // 0..3 current section index

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load audio when URL changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    el.src = audioUrl;
    el.load();
  }, [audioUrl]);

  // Wire audio events
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => setDuration(el.duration || 0);
    const onTime = () => setCurrent(el.currentTime);
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
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => {});
  };

  const onSeek = (seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = seconds;
    setCurrent(seconds);
  };

  const ms = (sec: number) => Math.round(sec * 1000);
  const fmt = (n: number | null) => (n == null ? '—' : `${(n / 1000).toFixed(2)}s`);

  const setStart = () => {
    const next = [...marks];
    next[idx].start_ms = ms(current);
    setMarks(next);
  };

  const setEnd = () => {
    const next = [...marks];
    next[idx].end_ms = ms(current);
    setMarks(next);
  };

  const nextSection = () => setIdx((p) => Math.min(3, p + 1));
  const prevSection = () => setIdx((p) => Math.max(0, p - 1));

  const complete = useMemo(
    () => marks.every(m => m.start_ms != null && m.end_ms != null && m.end_ms! > m.start_ms!),
    [marks]
  );

  // Generate SQL for listening_sections inserts
  const sql = useMemo(() => {
    const rows = marks.map((m, i) => ({
      test_slug: slug,
      order_no: i + 1,
      audio_url: audioUrl,
      start_ms: m.start_ms ?? 0,
      end_ms: m.end_ms ?? Math.max(ms(duration), 1),
      transcript: null,
    }));
    const values = rows
      .map(r => `('${r.test_slug.replace(/'/g,"''")}', ${r.order_no}, '${r.audio_url.replace(/'/g,"''")}', ${r.start_ms}, ${r.end_ms}, ${r.transcript === null ? 'null' : `'${String(r.transcript).replace(/'/g,"''")}'`})`)
      .join(',\n');
    return `-- Insert/replace sections for ${slug}
delete from public.listening_sections where test_slug='${slug.replace(/'/g,"''")}';
insert into public.listening_sections (test_slug, order_no, audio_url, start_ms, end_ms, transcript)
values
${values};`;
  }, [marks, slug, audioUrl, duration]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h2 md:text-display text-gradient-primary">Mark Sections — {slug}</h1>

        <Card className="card-surface p-6 rounded-ds-2xl mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-small opacity-80">Audio URL</label>
              <Input value={audioUrl} onChange={(e:any)=>setAudioUrl(e.target.value)} placeholder="https://..." />
              {/* Hidden native audio; UI via AudioBar */}
              <audio ref={audioRef} className="sr-only" />
              <div className="mt-4">
                <AudioBar
                  current={current}
                  duration={duration || 0}
                  playing={playing}
                  onSeek={onSeek}
                  onTogglePlay={togglePlay}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={prevSection} disabled={idx===0}>Prev Section</Button>
                <Button variant="secondary" onClick={nextSection} disabled={idx===3}>Next Section</Button>
                <span className="ml-2 text-small opacity-70">Section {idx+1} / 4</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="primary" onClick={setStart}>Set Start ({fmt(marks[idx].start_ms)})</Button>
                <Button variant="primary" onClick={setEnd}>Set End ({fmt(marks[idx].end_ms)})</Button>
              </div>
            </div>

            <div className="md:col-span-1">
              {!complete && (
                <Alert variant="warning" title="Mark all sections">
                  Play the audio and click <b>Set Start</b> / <b>Set End</b> for each of the 4 sections.
                </Alert>
              )}
              {complete && (
                <Alert variant="success" title="All sections marked">
                  Copy the SQL below and run it in Supabase.
                </Alert>
              )}
              <div className="mt-4">
                <label className="text-small opacity-80">Generated SQL</label>
                <textarea
                  readOnly
                  className="w-full h-64 p-3 rounded-ds-xl bg-card/60 border border-border/50 text-body"
                  value={sql}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(sql)}
                  >
                    Copy SQL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}
