// components/ai/MessageList.tsx
import React from 'react';

// Local, decoupled message types (no dependency on SidebarAI)
export type ChatRole = 'user' | 'assistant' | 'system';

export interface Msg {
  id: string | number;
  role: ChatRole;
  content: string;
}

interface MessageListProps {
  items: Msg[];
  loading: boolean;
  streamingId: string | null;
  renderMarkdown: (raw: string) => React.ReactNode;
  scrollRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
  newChat: () => void;
  toggleVoice: () => void;
  voiceSupported: boolean;
  voiceDenied: boolean;
  listening: boolean;
}

export function MessageList({
  items,
  loading,
  streamingId,
  renderMarkdown,
  scrollRef,
  isMobile,
  newChat,
  toggleVoice,
  voiceSupported,
  voiceDenied,
  listening,
}: MessageListProps): JSX.Element {
  return (
    <div
      ref={scrollRef}
      className={`${
        isMobile ? 'h-[calc(100svh-8.5rem)]' : 'h-[calc(100vh-8.5rem)]'
      } overflow-y-auto px-3 md:px-4 py-3 space-y-3`}
    >
      {items.length === 0 && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border mb-3">
            <span className="text-h4">✨</span>
          </div>
          <div className="text-small">
            Hi, I’m your coach — hired for you by your Partner GramorX. Speak or type to begin.
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={newChat}
              className="form-control text-small rounded-full px-3 bg-card border border-border hover:bg-accent"
            >
              New chat
            </button>
            <button
              onClick={toggleVoice}
              disabled={!voiceSupported || voiceDenied}
              className="form-control text-small rounded-full px-3 border border-border bg-card hover:bg-accent disabled:opacity-50"
              title={
                voiceSupported
                  ? voiceDenied
                    ? 'Mic access denied'
                    : listening
                    ? 'Stop voice'
                    : 'Speak'
                  : 'Voice not supported'
              }
            >
              🎙 {listening ? 'Stop' : 'Speak'}
            </button>
          </div>
          <div className="mt-2 text-small text-muted-foreground/80">Tip: Alt+A toggles anywhere.</div>
        </div>
      )}

      {items.map((m) => (
        <div
          key={m.id}
          className={`rounded-2xl px-3 py-2 text-small leading-relaxed border ${
            m.role === 'user'
              ? 'bg-accent text-accent-foreground border-accent'
              : 'bg-card text-card-foreground border-border'
          }`}
          aria-live={m.id === streamingId ? 'polite' : undefined}
        >
          <div className="text-small uppercase tracking-wider text-muted-foreground mb-1">
            {m.role === 'user' ? 'You' : 'GramorX AI'}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderMarkdown(m.content)}
          </div>
        </div>
      ))}

      {loading && (
        <div className="text-small text-muted-foreground animate-pulse">Thinking…</div>
      )}
    </div>
  );
}

export default MessageList;
