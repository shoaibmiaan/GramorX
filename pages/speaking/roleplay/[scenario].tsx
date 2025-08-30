// pages/speaking/roleplay/[scenario].tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';
import { authHeaders } from '@/lib/supabaseBrowser';
import MessageList from '@/components/ai/MessageList';
import SidebarHeader, { type ConnState } from '@/components/ai/SidebarHeader';
import { getScenario } from '@/data/roleplay/scenarios';

type Msg = { id: string; role: 'user' | 'bot'; text: string; audioUrl?: string | null; createdAt: string };

function useInlineRecorder() {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  const start = useCallback(async () => {
    if (isRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const media = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRef.current = media;
    media.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    media.start(100);
    setSec(0);
    setIsRecording(true);
  }, [isRecording]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRef.current) return null;
    const media = mediaRef.current;
    if (media.state === 'inactive') return null;

    const stopped = new Promise<void>((resolve) => {
      media.onstop = () => resolve();
    });
    media.stop();
    await stopped;
    setIsRecording(false);
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    media.stream.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    chunksRef.current = [];
    return blob;
  }, []);

  return { isRecording, sec, start, stop };
}

export default function RoleplayPage() {
  const router = useRouter();
  const scenarioKey = (router.query.scenario as string) || 'check-in';
  const meta = getScenario(scenarioKey) || getScenario('check-in');

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [chat, setChat] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rec = useInlineRecorder();
  const toggleVoice = () => {};
  const voiceSupported = false;
  const voiceDenied = false;
  const listening = false;
  const newChat = () => setChat([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const ensureAttempt = useCallback(async (): Promise<string> => {
    if (attemptId) return attemptId;
    setBusy(true);
    setErr(null);
    try {
      const headers = await authHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/speaking/start-attempt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ mode: 'roleplay', scenario: scenarioKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to start attempt');
      setAttemptId(json.id);

      // persist scenario on attempt (best-effort)
      await fetch('/api/speaking/attempt/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: json.id, merge: true, roleplay: { scenario: scenarioKey, startedAt: Date.now() } }),
      }).catch(() => {});

      setMsg('Roleplay attempt started.');
      return json.id;
    } catch (e: any) {
      setErr(e?.message || 'Could not start attempt.');
      throw e;
    } finally {
      setBusy(false);
    }
  }, [attemptId, scenarioKey]);

  const seedIfEmpty = useCallback(async () => {
    if (chat.length > 0) return;
    const id = await ensureAttempt();
    const headers = await authHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch('/api/speaking/partner', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attemptId: id,
        text: meta?.intro || 'Let’s begin the roleplay.',
        role: 'system',
        scenario: scenarioKey,
      }),
    });
    const json = await res.json();
    const botText: string = json?.replyText ?? meta?.intro ?? '…';
    const botAudio: string | undefined = json?.replyAudioUrl ?? json?.audioUrl;
    setChat((c) => [
      ...c,
      { id: crypto.randomUUID(), role: 'bot', text: botText, audioUrl: botAudio || null, createdAt: new Date().toISOString() },
    ]);
  }, [chat.length, ensureAttempt, meta?.intro, scenarioKey]);

  useEffect(() => {
    // seed on first mount / scenario change
    setChat([]);
    setAttemptId(null);
    setErr(null);
    setMsg(null);
    // do not await; fire-and-forget
    seedIfEmpty().catch(() => {});
  }, [scenarioKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendTurn = useCallback(
    async (opts?: { withAudioBlob?: Blob | null; text?: string }) => {
      const text = (opts?.text ?? input).trim();
      const blob = opts?.withAudioBlob ?? null;
      if (!text && !blob) return;

      const id = await ensureAttempt();

      const userMsg: Msg = {
        id: crypto.randomUUID(),
        role: 'user',
        text: text || (blob ? '(voice message)' : ''),
        createdAt: new Date().toISOString(),
      };
      setChat((c) => [...c, userMsg]);
      setInput('');
      setBusy(true);
      setErr(null);
      setMsg(null);

      try {
        // Prefer multipart when audio is present
        let res: Response;
        if (blob) {
          const headers = await authHeaders();
          const fd = new FormData();
          fd.append('attemptId', id);
          fd.append('scenario', scenarioKey);
          if (text) fd.append('text', text);
          fd.append('file', blob, `${id}-roleplay.webm`);
          res = await fetch('/api/speaking/partner', { method: 'POST', headers, body: fd });
        } else {
          const headers = await authHeaders({ 'Content-Type': 'application/json' });
          res = await fetch('/api/speaking/partner', {
            method: 'POST',
            headers,
            body: JSON.stringify({ attemptId: id, text, scenario: scenarioKey }),
          });
        }

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Partner failed');

        const botText: string = json?.replyText ?? '…';
        const botAudio: string | undefined = json?.replyAudioUrl ?? json?.audioUrl;

        const botMsg: Msg = {
          id: crypto.randomUUID(),
          role: 'bot',
          text: botText,
          audioUrl: botAudio || null,
          createdAt: new Date().toISOString(),
        };
        setChat((c) => [...c, botMsg]);
      } catch (e: any) {
        setErr(e?.message || 'Could not get partner reply.');
      } finally {
        setBusy(false);
      }
    },
    [ensureAttempt, input, scenarioKey]
  );

  const handleRecordToggle = async () => {
    if (!rec.isRecording) {
      try {
        await ensureAttempt();
        await rec.start();
      } catch (e: any) {
        setErr(e?.message || 'Mic permission denied.');
      }
    } else {
      const blob = await rec.stop();
      if (blob) await sendTurn({ withAudioBlob: blob, text: input.trim() || '' });
    }
  };

  const conn: ConnState = err ? 'error' : busy ? 'online' : 'idle';
  const items = chat.map((m) => ({
    id: m.id,
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.text,
  }));
  const renderText = (raw: string) => (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{raw}</p>
  );

  return (
    <div className="py-24">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 font-semibold">Roleplay — {meta?.title}</h1>
            <p className="text-gray-600 dark:text-grayish">{meta?.intro}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge intent={attemptId ? 'success' : 'neutral'}>
              Attempt: {attemptId ? attemptId.slice(0, 8) : '—'}
            </Badge>
            {rec.isRecording && <Badge intent="warning">Recording… {rec.sec}s</Badge>}
          </div>
        </div>

        {msg && <div className="mb-3 text-sm text-emerald-600">{msg}</div>}
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation */}
          <Card className="p-0 lg:col-span-2 overflow-hidden flex flex-col">
            <SidebarHeader title="Conversation" status={conn} onClose={newChat} />
            <MessageList
              items={items}
              loading={busy}
              streamingId={null}
              renderMarkdown={renderText}
              scrollRef={scrollRef}
              isMobile={isMobile}
              newChat={newChat}
              toggleVoice={toggleVoice}
              voiceSupported={voiceSupported}
              voiceDenied={voiceDenied}
              listening={listening}
            />

            {/* Composer */}
            <div className="p-4 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={rec.isRecording ? 'Recording… say your message' : 'Type your message'}
                  value={input}
                  onChange={(e: any) => setInput(e.target.value)}
                  onKeyDown={async (e: any) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      await sendTurn();
                    }
                  }}
                  disabled={busy || rec.isRecording}
                  className="flex-1"
                />
                <Button onClick={() => sendTurn()} disabled={busy || rec.isRecording || (!input.trim() && !rec.isRecording)}>
                  Send
                </Button>
                <Button intent={rec.isRecording ? 'danger' : 'primary'} onClick={handleRecordToggle} disabled={busy}>
                  {rec.isRecording ? 'Stop' : 'Hold to Record'}
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-grayish">
                Scenario: <span className="font-medium">{meta?.title}</span>. You can send text, voice, or both.
              </div>
            </div>
          </Card>

          {/* Scenario goals */}
          <Card className="p-6">
            <h3 className="text-h3 font-semibold mb-2">Sample Prompts</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {(meta?.sample || []).map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/speaking/partner"><Button variant="ghost">Open Partner</Button></Link>
              <Link href="/speaking/simulator"><Button variant="ghost">Open Simulator</Button></Link>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
