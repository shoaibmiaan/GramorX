<<<<<<< HEAD
// hooks/useRecorder.ts
import { useCallback, useEffect, useRef, useState } from 'react';

type UseRecorderOpts = {
  preferredMimeType?: string; // e.g. 'audio/webm'
};

type StopResult = { blob?: Blob; file?: File };

export function useRecorder(opts: UseRecorderOpts = {}) {
  const { preferredMimeType = 'audio/webm' } = opts;

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState(preferredMimeType);
  const [error, setError] = useState<string | null>(null);

  const clearTimer = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const start = useCallback(async () => {
    setError(null);
    setDurationSec(0);
    setAudioUrl(null);
    chunksRef.current = [];

    // ask mic
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    // choose mime
    const supported = MediaRecorder.isTypeSupported(preferredMimeType)
      ? preferredMimeType
      : 'audio/webm;codecs=opus';
    setMimeType(supported);

    const rec = new MediaRecorder(stream, { mimeType: supported });
    recorderRef.current = rec;

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstart = () => {
      setIsRecording(true);
      setIsPaused(false);
      clearTimer();
      tickRef.current = window.setInterval(() => {
        setDurationSec((s) => s + 1);
      }, 1000);
    };
    rec.onpause = () => setIsPaused(true);
    rec.onresume = () => setIsPaused(false);
    rec.onerror = (e) => setError((e as unknown as Error).message ?? 'Recorder error');

    rec.start(250); // gather small chunks
  }, [preferredMimeType]);

  const pause = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === 'recording') rec.pause();
  }, []);

  const resume = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === 'paused') rec.resume();
  }, []);

  const stop = useCallback(async (): Promise<StopResult> => {
    return new Promise((resolve, reject) => {
      const rec = recorderRef.current;
      if (!rec) return resolve({});
      const stream = mediaStreamRef.current;

      rec.onstop = () => {
        try {
          clearTimer();
          setIsRecording(false);
          setIsPaused(false);
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const file = new File([blob], `speaking_${Date.now()}.webm`, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          resolve({ blob, file });
        } catch (e) {
          reject(e);
        } finally {
          recorderRef.current = null;
          chunksRef.current = [];
        }
      };

      try {
        if (rec.state !== 'inactive') rec.stop();
      } catch (e) {
        reject(e);
      }
    });
  }, [mimeType]);

  const reset = useCallback(() => {
    try {
      clearTimer();
      setIsRecording(false);
      setIsPaused(false);
      setDurationSec(0);
      setAudioUrl(null);
      chunksRef.current = [];
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      recorderRef.current = null;
    } catch (e) {
      setError(String(e));
    }
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    durationSec,
    audioUrl,
    mimeType,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  };
=======
import { useEffect, useRef, useState } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      audioCtxRef.current?.close();
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const start = async () => {
    if (typeof window === "undefined") return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const b = new Blob(chunks, { type: "audio/webm" });
      setBlob(b);
    };
    mediaRecRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);

    const tick = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const v = (dataArrayRef.current[i] - 128) / 128;
        sum += Math.abs(v);
      }
      setLevel(Math.min(1, (sum / dataArrayRef.current.length) * 4));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stop = () => {
    mediaRecRef.current?.stop();
    audioCtxRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    setIsRecording(false);
    if (typeof window !== "undefined" && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  return { isRecording, level, blob, start, stop };
>>>>>>> 4e94e6322611b22f93ab3e6364502036ed9a3d29
}
