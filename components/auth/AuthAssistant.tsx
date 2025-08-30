import React, { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';

interface Message {
  role: 'user' | 'assistant';
  content: React.ReactNode;
}

export default function AuthAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const isLogin = router.pathname.startsWith('/login');
    setMessages([
      {
        role: 'assistant',
        content: (
          <>
            {isLogin ? (
              <>
                Need help signing in? You can{' '}
                <Link href="/forgot-password" className="underline">
                  reset your password
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="underline">
                  create an account
                </Link>
                .
              </>
            ) : (
              <>
                Need help creating an account? Check our{' '}
                <Link href="/faq" className="underline">
                  FAQ
                </Link>{' '}
                or{' '}
                <Link href="/login" className="underline">
                  sign in
                </Link>{' '}
                if you already have one.
              </>
            )}
          </>
        ),
      },
    ]);
  }, [router.pathname]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      const answer = data?.answer || data?.error || 'Sorry, I could not find an answer.';
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button aria-label="Open help assistant" onClick={() => setOpen(true)}>
          Need help?
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-md border border-border bg-background shadow-lg flex flex-col" role="region" aria-label="Authentication assistant">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <h2 className="text-small font-semibold">Assistant</h2>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="text-small px-2"
        >
          ✕
        </button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2" aria-live="polite">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-md px-2 py-1 text-small ${
              m.role === 'assistant'
                ? 'bg-card text-card-foreground'
                : 'bg-accent text-accent-foreground'
            }`}
          >
            {typeof m.content === 'string' ? (
              <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{m.content}</ReactMarkdown>
            ) : (
              m.content
            )}
          </div>
        ))}
        {loading && <div className="text-caption text-muted-foreground">Thinking…</div>}
      </div>
      <form onSubmit={send} className="flex gap-2 p-2 border-t border-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question"
          aria-label="Ask a question"
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
