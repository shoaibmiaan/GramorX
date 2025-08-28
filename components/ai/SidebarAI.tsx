// components/ai/SidebarAI.tsx
// Sidebar AI: desktop docks on the right; mobile docks at the bottom.
// - Autofocus textarea on open
// - Click outside to close
// - Alt+A toggles the (stub) voice state
// - "Who are you?" → fixed answer
// - Strips bullet spam in rendering
// - Uses @ts-expect-error (with TODO) to bypass unified/remark/vfile type skew in CI

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import MessageList from './MessageList';
import type { Msg } from './MessageList'; // type-only import (verbatimModuleSyntax-safe)

// Optional syntax highlight plugin (typed as any to avoid unified type friction)
let rehypeHighlight: any;
import('rehype-highlight')
  .then((mod) => {
    rehypeHighlight = mod.default;
  })
  .catch(() => {
    /* ignore if unavailable */
  });

// Augment Window to declare speech recognition properties
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

type ChatRole = 'user' | 'assistant' | 'system';

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const m = () => setMobile(window.matchMedia('(max-width: 768px)').matches);
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);
  return mobile;
}

function cleanMarkdown(raw: string): string {
  // Remove bullet spam at line starts and collapse excessive blank lines.
  return raw
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]\s+|\d+\.\s+)/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export function SidebarAI(): JSX.Element {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const [items, setItems] = useState<Msg[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [voiceDenied, _setVoiceDenied] = useState<boolean>(false); // underscore setter to silence unused warning

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const voiceSupported = useMemo<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  // Autofocus when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [open]);

  // Push page to make space when docked on desktop; bottom space on mobile
  useEffect(() => {
    const root = document.getElementById('__next');
    if (!root) return;

    const apply = () => {
      if (!open) {
        root.style.paddingRight = '';
        root.style.paddingBottom = '';
        return;
      }
      if (isMobile) {
        root.style.paddingBottom = '320px';
        root.style.paddingRight = '';
      } else {
        root.style.paddingRight = '380px';
        root.style.paddingBottom = '';
      }
    };

    apply();
    return () => {
      root.style.paddingRight = '';
      root.style.paddingBottom = '';
    };
  }, [open, isMobile]);

  // Close on outside click (desktop UX)
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Alt+A toggles voice (stub)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        toggleVoice();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, voiceSupported, voiceDenied]);

  const newChat = useCallback(() => {
    setItems([]);
    setStreamingId(null);
    setInput('');
  }, []);

  const appendMessage = useCallback((role: ChatRole, content: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { id, role, content }]);
    setStreamingId(id);
    setTimeout(() => {
      setStreamingId(null);
      // scroll to bottom after append
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }, 50);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    appendMessage('user', text);
    setInput('');
    setLoading(true);

    try {
      // Fixed persona answer
      if (/^\s*who\s+are\s+you\??\s*$/i.test(text)) {
        appendMessage('assistant', 'I am your coach hired for you by your Partner GramorX.');
        return;
      }

      // TODO(AI-wire): Call your chat API. For now, minimal helpful echo.
      appendMessage(
        'assistant',
        `Got it. I’ll help you with IELTS. Ask me to make a study plan, generate a mock test, or review an answer.`,
      );
    } finally {
      setLoading(false);
    }
  }, [appendMessage, input]);

  const toggleVoice = useCallback(() => {
    if (!voiceSupported) return;
    if (voiceDenied) return;
    setListening((v) => !v);
  }, [voiceSupported, voiceDenied]);

  const renderMarkdown = useCallback((raw: string) => {
    const cleaned = cleanMarkdown(raw);
    return (
      <Fragment>
        {/* TODO(unified-types): Align unified/remark/rehype/vfile versions and remove this expect-error.
           Current CI has duplicate vfile trees causing Plugin<->Pluggable type mismatch. */}
        {/* @ts-expect-error unified/vfile type skew in CI */}
        <ReactMarkdown
          // @ts-expect-error dynamic plugin typed loosely to avoid unified type skew
          rehypePlugins={rehypeHighlight ? [rehypeHighlight] : []}
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            // Keep output minimal and DS-aligned
            strong: (props) => <strong {...props} className="font-semibold" />,
            em: (props) => <em {...props} className="italic" />,
            p: (props) => <p {...props} className="mb-2 last:mb-0" />,
            ul: (props) => <ul {...props} className="list-disc pl-5 my-2" />,
            ol: (props) => <ol {...props} className="list-decimal pl-5 my-2" />,
            code: (props) => (
              <code
                {...props}
                className={`rounded bg-muted px-1 py-0.5 text-[0.85em] ${props.className ?? ''}`}
              />
            ),
            pre: (props) => (
              <pre
                {...props}
                className={`overflow-x-auto rounded-lg border p-3 my-2 ${props.className ?? ''}`}
              />
            ),
            a: (props) => (
              <a
                {...props}
                className="underline underline-offset-2 hover:opacity-90"
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
        >
          {cleaned}
        </ReactMarkdown>
      </Fragment>
    );
  }, []);

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 rounded-full border bg-card/80 backdrop-blur px-4 py-2 text-sm shadow hover:bg-accent"
        aria-expanded={open}
        aria-controls="ai-sidebar"
      >
        {open ? 'Close AI' : 'Open AI'}
      </button>

      {/* Docked panel */}
      <aside
        id="ai-sidebar"
        ref={panelRef}
        className={[
          'fixed z-30 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75',
          'transition-transform duration-200 ease-out',
          isMobile
            ? 'left-0 right-0 bottom-0 h-[320px] rounded-t-2xl border-t'
            : 'top-0 right-0 h-full w-[360px]',
          open
            ? 'translate-x-0'
            : isMobile
            ? 'translate-y-full'
            : 'translate-x-full',
        ].join(' ')}
        role="complementary"
        aria-label="AI Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">GramorX AI</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={newChat}
              className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
              title="Start a new chat"
            >
              New
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          items={items}
          loading={loading}
          streamingId={streamingId}
          renderMarkdown={renderMarkdown}
          scrollRef={scrollRef}
          isMobile={isMobile}
          newChat={newChat}
          toggleVoice={toggleVoice}
          voiceSupported={voiceSupported}
          voiceDenied={voiceDenied}
          listening={listening}
        />

        {/* Composer */}
        <form
          className="border-t px-3 py-2 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Ask anything about IELTS…"
            className="flex-1 resize-none rounded-xl border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Send
            </button>
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!voiceSupported || voiceDenied}
              className="rounded-lg border px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
              title={
                voiceSupported
                  ? voiceDenied
                    ? 'Mic access denied'
                    : listening
                    ? 'Stop voice (Alt+A)'
                    : 'Speak (Alt+A)'
                  : 'Voice not supported'
              }
            >
              🎙 {listening ? 'Stop' : 'Speak'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default SidebarAI;
