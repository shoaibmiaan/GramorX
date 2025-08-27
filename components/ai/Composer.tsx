import React from 'react';

interface ComposerProps {
  toggleVoice: () => void;
  voiceSupported: boolean;
  voiceDenied: boolean;
  listening: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  input: string;
  setInput: (v: string) => void;
  send: (prompt?: string) => void;
  loading: boolean;
  streamingId: string | null;
}

export function Composer({
  toggleVoice,
  voiceSupported,
  voiceDenied,
  listening,
  textareaRef,
  input,
  setInput,
  send,
  loading,
  streamingId,
}: ComposerProps) {
  return (
    <div className="sticky bottom-0 border-t border-border p-2 md:p-3 bg-background">
      <div className="flex items-end gap-2">
        <button
          onClick={toggleVoice}
          disabled={!voiceSupported || voiceDenied}
          className={`h-10 w-10 rounded-full border border-border ${listening ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'} disabled:opacity-50`}
          title={voiceSupported ? (voiceDenied ? 'Mic access denied' : listening ? 'Stop voice' : 'Speak') : 'Voice not supported'}
          aria-label="Voice input"
        >
          🎙
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Type or tap 🎙 to speak… (Enter to send, Shift+Enter = new line)"
          className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-small outline-none focus:ring-2 focus:ring-primary/40"
          style={{ maxHeight: 148 }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim() || !!streamingId}
          className="rounded-2xl h-10 min-w-[88px] px-4 md:px-3 text-small font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Composer;
