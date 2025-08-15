import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { AccentPicker } from '@/components/speaking/AccentPicker';
import { useSpeech } from '@/components/speaking/useSpeech';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

const Recorder = dynamic(() => import('@/components/speaking/Recorder').then(m => m.Recorder), { ssr: false });

type Msg = { role: 'bot' | 'user'; text: string; audio_url?: string | null };

type AttemptRow = {
  id: string;
  created_at: string;
  source?: string | null;
  transcript?: string | null;
  chat_log?: any | null;
  audio_urls?: Record<string, string[]> | null;
  overall_band?: number | null;
  p1_band?: number | null;
  p2_band?: number | null;
  p3_band?: number | null;
  scenario?: string | null;
};

const ATTEMPT_KEY = 'speakingAttemptId';

function niceError(text: string) {
  try { const j = JSON.parse(text); return j?.error || 'Server error'; } catch {}
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Server error';
}

// --- safe Base64 for any blob ---
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read audio'));
    reader.onload = () => {
      const s = String(reader.result || '');
      const i = s.indexOf(',');
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    reader.readAsDataURL(blob);
  });
}

// Helpers for history table
function inferType(r: AttemptRow): 'Simulator' | 'Partner' | 'Roleplay' | 'Unknown' {
  const au = r.audio_urls || {};
  if (r.chat_log || (au as any).chat?.length) return 'Partner';
  if ((au as any).p1?.length || (au as any).p2?.length || (au as any).p3?.length) return 'Simulator';
  if (r.scenario || (au as any).roleplay?.length) return 'Roleplay';
  return (r.source as any) === 'partner' ? 'Partner'
       : (r.source as any) === 'simulator' ? 'Simulator'
       : (r.source as any) === 'roleplay' ? 'Roleplay'
       : 'Unknown';
}
function clipsSummary(au?: AttemptRow['audio_urls']) {
  const a: any = au || {};
  const n = (k: string) => (Array.isArray(a[k]) ? a[k].length : 0);
  const p1 = n('p1'), p2 = n('p2'), p3 = n('p3'), chat = n('chat');
  const parts = [];
  if (p1) parts.push(`P1:${p1}`);
  if (p2) parts.push(`P2:${p2}`);
  if (p3) parts.push(`P3:${p3}`);
  if (chat) parts.push(`Chat:${chat}`);
  return parts.length ? parts.join(' · ') : '—';
}

// --- helper: upload audio blob (Authorization included) ---
async function uploadSpeakingBlob(
  blob: Blob,
  ctx: 'p1'|'p2'|'p3'|'chat',
  attemptId?: string
) {
  const fd = new FormData();
  fd.append('file', blob, `audio-${Date.now()}.webm`);
  fd.append('context', ctx);
  if (attemptId) fd.append('attemptId', attemptId);

  const { data: { session } } = await supabaseBrowser.auth.getSession();
  const access = session?.access_token;

  const r = await fetch('/api/speaking/upload', {
    method: 'POST',
    body: fd,
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    credentials: 'include',
  });
  if (!r.ok) throw new Error(niceError(await r.text()));
  return (await r.json()) as { attemptId: string; path: string };
}

export default function AIPartnerPage() {
  const router = useRouter();

  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'bot', text: "Let's practice IELTS Speaking Part 1. What's your full name?" }
  ]);
  const [pending, setPending] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);

  const [attemptId, setAttemptId] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSavePath, setLastSavePath] = useState('');
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaMsg, setMetaMsg] = useState<{ kind: 'ok'|'err'|''; text?: string }>({ kind: '' });

  const lastBlobRef = useRef<Blob | null>(null);

  // Speech
  const { supported, voices, voiceName, setVoiceName, speak, stop, pickRegion } = useSpeech({ defaultAccent: 'US' });

  // Prevent accidental submits from nested <form>s
  useEffect(() => {
    const stopSubmit = (e: Event) => e.preventDefault();
    document.addEventListener('submit', stopSubmit);
    return () => document.removeEventListener('submit', stopSubmit);
  }, []);

  // Ensure/reuse attempt, tag as 'partner'
  const ensureAttempt = useCallback(async (): Promise<string> => {
    let id = attemptId || localStorage.getItem(ATTEMPT_KEY) || '';
    if (id) {
      if (!attemptId) setAttemptId(id);
      return id;
    }
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const r = await fetch('/api/speaking/start-attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });
    const raw = await r.text();
    if (!r.ok) throw new Error(niceError(raw));
    const j = JSON.parse(raw);

    id = j.attemptId;
    setAttemptId(id);
    localStorage.setItem(ATTEMPT_KEY, id);

    // tag attempt so history can infer type quickly
    await supabaseBrowser.from('speaking_attempts').update({ source: 'partner' }).eq('id', id);

    return id;
  }, [attemptId]);

  useEffect(() => { void ensureAttempt().catch(() => {}); }, [ensureAttempt]);

  const sendText = useCallback(async () => {
    const text = pending.trim();
    if (!text) return;
    setMsgs(m => [...m, { role: 'user', text }]);
    setPending('');
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const id = await ensureAttempt();

      const r = await fetch('/api/speaking/partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ attemptId: id, history: msgs, userText: text }),
        credentials: 'include',
      });
      const raw = await r.text();
      if (!r.ok) throw new Error(niceError(raw));
      const data = JSON.parse(raw);
      const reply = data.reply || '...';
      setMsgs(m => [...m, { role: 'bot', text: reply }]);
      if (autoSpeak && supported) speak(reply);
    } catch (e: any) {
      setMetaMsg({ kind: 'err', text: e?.message || 'Send failed' });
    }
  }, [pending, msgs, autoSpeak, supported, speak, ensureAttempt]);

  // Save recorded audio → upload, then STT+reply
  const handleBlob = useCallback(async (blob: Blob) => {
    lastBlobRef.current = blob;
    setSaving(true);
    setSaveError('');
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const id = await ensureAttempt();

      const up = await uploadSpeakingBlob(blob, 'chat', id);
      setAttemptId(up.attemptId);
      setLastSavePath(up.path);

      const b64 = await blobToBase64(blob);
      const r = await fetch('/api/speaking/partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          attemptId: id,
          audioBase64: b64,
          mime: blob.type || 'audio/webm',
          audioUrl: up.path
        }),
        credentials: 'include',
      });
      const raw = await r.text();
      if (!r.ok) throw new Error(niceError(raw));
      const data = JSON.parse(raw);
      const userText = data.transcript || '(voice message)';
      const reply = data.reply || '...';

      setMsgs(m => [...m, { role: 'user', text: userText, audio_url: up.path }]);
      setMsgs(m => [...m, { role: 'bot', text: reply }]);
      if (autoSpeak && supported) speak(reply);
    } catch (e: any) {
      setSaveError(e?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  }, [autoSpeak, supported, speak, ensureAttempt]);

  // Save transcript with supabase client (RLS protected)
  const saveTranscript = useCallback(async () => {
    setMetaSaving(true);
    setMetaMsg({ kind: '' });
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const id = await ensureAttempt();
      const transcript = msgs.map(m => `${m.role === 'bot' ? 'Partner' : 'You'}: ${m.text}`).join('\n');
      const patch = { transcript, chat_log: msgs as any };

      const { error } = await supabaseBrowser
        .from('speaking_attempts')
        .update(patch)
        .eq('id', id);

      if (error) throw new Error(error.message);
      setMetaMsg({ kind: 'ok', text: 'Transcript saved' });
    } catch (e: any) {
      setMetaMsg({ kind: 'err', text: e?.message || 'Save failed' });
    } finally {
      setMetaSaving(false);
    }
  }, [msgs, ensureAttempt]);

  // Auto-speak the very first bot message
  useEffect(() => {
    const onFirstClick = () => {
      if (autoSpeak && supported && msgs[0]?.role === 'bot') speak(msgs[0].text);
      window.removeEventListener('click', onFirstClick);
    };
    window.addEventListener('click', onFirstClick);
    return () => window.removeEventListener('click', onFirstClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpeak, supported]);

  // ===== Unified History (compact list) =====
  const [history, setHistory] = useState<AttemptRow[]>([]);
  const [histErr, setHistErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from('speaking_attempts')
          .select('id, created_at, source, transcript, chat_log, audio_urls, overall_band, p1_band, p2_band, p3_band, scenario')
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) throw new Error(error.message);
        setHistory((data || []) as AttemptRow[]);
      } catch (e: any) {
        setHistErr(e?.message || 'Failed to load history');
      }
    })();
  }, []);

  const rows = useMemo(() => history.map(r => {
    const type = inferType(r);
    const created = new Date(r.created_at).toLocaleString();
    const clips = clipsSummary(r.audio_urls);
    const overall = r.overall_band ?? '—';
    const reviewHref = type === 'Simulator'
      ? `/speaking/review/${r.id}`
      : `/speaking/partner/review/${r.id}`;
    return { id: r.id, created, type, clips, overall, reviewHref };
  }), [history]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h1 md:text-display">AI Speaking Partner</h1>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr] mt-6">
          {/* Chat / messages */}
          <Card className="card-surface p-6 rounded-ds-2xl">
            <div className="grid gap-3 max-h-[60vh] overflow-auto pr-1">
              {msgs.map((m, i) => (
                <div key={i} className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                  <b className="opacity-70">{m.role === 'bot' ? 'Partner' : 'You'}:</b> {m.text}
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input placeholder="Type your answer…" value={pending} onChange={e => setPending(e.target.value)} />
              <Button onClick={sendText} variant="primary" className="rounded-ds-xl" disabled={!pending.trim()} type="button">
                Send
              </Button>
            </div>

            {/* status row + actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-small">
              {saving && <Badge variant="info" size="sm">Processing…</Badge>}
              {!saving && lastSavePath && <Badge variant="success" size="sm">Audio saved</Badge>}
              {!saving && saveError && <Badge variant="danger" size="sm">{saveError}</Badge>}
              {attemptId && <span className="opacity-70">Attempt: <code>{attemptId}</code></span>}
              <div className="ml-auto flex gap-2">
                {attemptId ? (
                  <Button
                    variant="primary"
                    className="rounded-ds"
                    type="button"
                    onClick={() => router.push(`/speaking/partner/review/${attemptId}`)}
                  >
                    Go to Review
                  </Button>
                ) : (
                  <Button variant="secondary" className="rounded-ds" type="button" disabled>
                    Go to Review
                  </Button>
                )}

                <Button onClick={saveTranscript} variant="secondary" className="rounded-ds" type="button" disabled={metaSaving}>
                  {metaSaving ? 'Saving…' : 'Save chat transcript'}
                </Button>
                {metaMsg.kind === 'ok' && <Badge variant="success" size="sm">{metaMsg.text}</Badge>}
                {metaMsg.kind === 'err' && <Badge variant="danger" size="sm">{metaMsg.text}</Badge>}
              </div>
            </div>
          </Card>

          {/* Tools: sticky right column */}
          <div className="md:sticky md:top-24 self-start space-y-6">
            <Card className="card-surface p-6 rounded-ds-2xl">
              <h3 className="text-h3 mb-3">Record & send</h3>
              <Recorder onBlob={handleBlob} maxSeconds={30} />
              <p className="text-small text-grayish mt-2">
                Your recording is saved privately to this attempt.
              </p>
            </Card>

            <Card className="card-surface p-6 rounded-ds-2xl">
              <h3 className="text-h3">Accent & Voice</h3>
              {supported ? (
                <>
                  <AccentPicker
                    voices={voices}
                    voiceName={voiceName}
                    onChange={setVoiceName}
                    className="mt-3"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => pickRegion('UK')} variant="secondary" className="rounded-ds" type="button">UK</Button>
                    <Button onClick={() => pickRegion('US')} variant="secondary" className="rounded-ds" type="button">US</Button>
                    <Button onClick={() => pickRegion('AUS')} variant="secondary" className="rounded-ds" type="button">AUS</Button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => setAutoSpeak(!autoSpeak)} variant={autoSpeak ? 'primary' : 'secondary'} className="rounded-ds" type="button">
                      {autoSpeak ? 'Auto-speak: On' : 'Auto-speak: Off'}
                    </Button>
                    <Button onClick={stop} variant="secondary" className="rounded-ds" type="button">Stop</Button>
                  </div>
                </>
              ) : (
                <p className="text-grayish">Speech synthesis not supported on this device/browser.</p>
              )}
            </Card>
          </div>
        </div>

        {/* ===== Unified History (on-page list) ===== */}
        <Card className="card-surface p-0 mt-6 rounded-ds-2xl overflow-hidden">
          <div className="grid grid-cols-[180px_140px_1fr_120px_160px] gap-0 text-sm font-medium bg-black/5 dark:bg-white/5 px-4 py-3">
            <div>Date</div>
            <div>Type</div>
            <div>Clips</div>
            <div>Overall</div>
            <div>Actions</div>
          </div>

          {rows.map(r => (
            <div key={r.id} className="grid grid-cols-[180px_140px_1fr_120px_160px] items-center gap-0 px-4 py-3 border-t border-black/10 dark:border-white/10">
              <div className="opacity-80">{r.created}</div>
              <div>{r.type}</div>
              <div className="opacity-80">{r.clips}</div>
              <div>{r.overall}</div>
              <div className="flex gap-2">
                <Button as="a" href={r.reviewHref} variant="secondary" className="rounded-ds">Open review</Button>
              </div>
            </div>
          ))}

          {!rows.length && (
            <div className="px-4 py-8 opacity-70">{histErr || 'No attempts yet.'}</div>
          )}
        </Card>
      </Container>
    </section>
  );
}
