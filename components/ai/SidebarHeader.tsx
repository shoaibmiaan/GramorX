import React from 'react';
import type { Provider, ConnState } from './SidebarAI';

interface SidebarHeaderProps {
  provider: Provider;
  setProvider: (p: Provider) => void;
  persist: boolean;
  setPersist: (v: boolean) => void;
  clearHistory: () => void;
  newChat: () => void;
  onClose: () => void;
  status: ConnState;
  statusNote: string;
}

export function SidebarHeader({
  provider,
  setProvider,
  persist,
  setPersist,
  clearHistory,
  newChat,
  onClose,
  status,
  statusNote,
}: SidebarHeaderProps) {
  const statusDot =
    status === 'streaming' || status === 'connecting'
      ? 'bg-primary'
      : status === 'stalled'
        ? 'bg-accent'
        : status === 'offline' || status === 'error'
          ? 'bg-destructive'
          : 'bg-muted-foreground';

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-3 md:px-4 h-14">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold truncate">GramorX AI</span>
          <span
            className={`inline-block h-2 w-2 rounded-full ${statusDot}`}
            aria-label={`status: ${status}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="h-8 rounded-md bg-card border border-border px-2 text-caption"
            aria-label="AI provider"
          >
            <option value="auto">auto</option>
            <option value="gemini">gemini</option>
            <option value="groq">groq</option>
            <option value="openai">openai</option>
          </select>

          <label className="flex items-center gap-1 text-caption">
            <input
              type="checkbox"
              className="h-3 w-3"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
            Remember
          </label>

          <button
            onClick={clearHistory}
            className="h-8 px-3 rounded-md bg-card border border-border hover:bg-accent text-caption"
            aria-label="Clear history"
          >
            Clear
          </button>
          <button
            onClick={newChat}
            className="h-8 px-3 rounded-md bg-card border border-border hover:bg-accent text-caption"
            aria-label="New chat"
          >
            New
          </button>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md bg-card border border-border grid place-items-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
      {statusNote && (
        <div className="px-3 md:px-4 py-1 text-tiny text-muted-foreground bg-muted border-t border-border">
          {statusNote}
        </div>
      )}
    </div>
  );
}

export default SidebarHeader;
