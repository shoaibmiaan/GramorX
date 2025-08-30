'use client';

import React, { useEffect, useRef, useState } from 'react';

export type AudioRecordButtonProps = {
  onStop?: (blob: Blob) => void;
  className?: string;
  disabled?: boolean;
};

export const AudioRecordButton: React.FC<AudioRecordButtonProps> = ({
  onStop,
  className = '',
  disabled,
}) => {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    setSupported(
      isClient &&
        !!navigator.mediaDevices &&
        typeof (window as any).MediaRecorder !== 'undefined'
    );
    return () => {
      // cleanup any open tracks on unmount
      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRef.current?.stop();
    };
  }, []);

  const start = async () => {
    if (!supported || disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const rec = new MediaRecorder(stream);
      chunks.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      rec.onstop = () => {
        const mime =
          rec.mimeType ||
          'audio/webm'; // WebM/Opus in most modern browsers
        const blob = new Blob(chunks.current, { type: mime });
        onStop?.(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      rec.start();
      mediaRef.current = rec;
      setRecording(true);
    } catch (err) {
      console.error('Microphone permission or recorder error', err);
      setSupported(false);
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        className={`px-4 py-2 rounded-ds bg-border dark:bg-border/20 text-small ${className}`}
        aria-disabled="true"
      >
        Recording not supported
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-ds border border-border dark:border-border/20
        ${recording ? 'bg-sunsetOrange/20 text-sunsetOrange' : 'bg-card dark:bg-dark/40 text-lightText dark:text-foreground'}
        hover:bg-border/20 dark:hover:bg-border/20 ${className}`}
      aria-pressed={recording}
      aria-label={recording ? 'Stop recording' : 'Start recording'}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-sm ${
          recording ? 'bg-sunsetOrange' : 'bg-success'
        }`}
      />
      {recording ? 'Stop' : 'Record'}
    </button>
  );
};
