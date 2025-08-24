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
}
