'use client';
import React, { useEffect, useRef, useState } from "react";

export type AudioRecordButtonProps = {
  onStop?: (blob: Blob) => void;
  className?: string;
  disabled?: boolean;
};

export const AudioRecordButton: React.FC<AudioRecordButtonProps> = ({
  onStop,
  className = "",
  disabled,
}) => {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        !!navigator.mediaDevices &&
        !!window.MediaRecorder,
    );
  }, []);

  const start = async () => {
    if (!supported || disabled) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      onStop?.(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    rec.start();
    mediaRef.current = rec;
    setRecording(true);
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
        ${recording ? "bg-sunsetOrange/20 text-sunsetOrange" : "bg-card dark:bg-dark/40 text-foreground dark:text-foreground"}
        hover:bg-border/20 dark:hover:bg-border/20 ${className}`}
      aria-pressed={recording}
      aria-label={recording ? "Stop recording" : "Start recording"}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-sm ${recording ? "bg-sunsetOrange" : "bg-success"}`}
      />
      {recording ? "Stop" : "Record"}
    </button>
  );
};
