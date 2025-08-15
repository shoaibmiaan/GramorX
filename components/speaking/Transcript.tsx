import React, { useMemo } from 'react';
import { Button } from '@/components/design-system/Button';
import { useSpeech } from '@/components/speaking/useSpeech';

/**
 * Splits transcript into short, speakable lines and adds "play" controls.
 * Keeps styles token‑only and light/dark aware via parent surface.
 */
export const Transcript: React.FC<{ text: string; accent?: string }> = ({ text, accent }) => {
  const { speak, stop } = useSpeech();

  const lines = useMemo(() => {
    return text
      .split(/\r?\n/g)
      .flatMap(line => line.split(/(?<=[.!?])\s+/g))
      .map(s => s.trim())
      .filter(Boolean);
  }, [text]);

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2 p-3.5 rounded-ds border border-gray-200 dark:border-white/10"
        >
          <div className="flex-1 text-body">{line}</div>
          <Button
            variant="secondary"
            className="rounded-ds-xl px-3 py-1.5"
            onClick={() => speak(line, accent)}
            aria-label="Speak line"
            title="Speak line"
          >
            <i className="fas fa-volume-up" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
};
