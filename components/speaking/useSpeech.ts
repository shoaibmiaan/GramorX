'use client';
// components/speaking/useSpeech.ts
import { useEffect, useRef, useState } from 'react';

export function useSpeech() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(
    () => () => {
      if (typeof window !== 'undefined' && timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    },
    []
  );

  async function start() {
    if (typeof window === 'undefined') return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunksRef.current = [];
    rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
    mediaRef.current = rec;
    setSeconds(0);
    setRecording(true);
    rec.start();
    if (typeof window !== 'undefined') {
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    }
  }

  async function stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!mediaRef.current) return resolve(new Blob());
      const rec = mediaRef.current;
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecording(false);
        if (typeof window !== 'undefined' && timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        resolve(blob);
      };
      rec.stop();
    });
  }

  return { recording, seconds, start, stop };
}
