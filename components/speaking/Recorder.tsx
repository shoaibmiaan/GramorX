// components/speaking/Recorder.tsx
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  active: boolean;
  maxMs: number;
  onComplete: (blob: Blob) => void;
  onError?: (err: Error) => void;
  showUI?: boolean;
};

export const Recorder: React.FC<Props> = ({
  active,
  maxMs,
  onComplete,
  onError,
  showUI = true,
}) => {
  const mediaRec = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const stopAtRef = useRef<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const start = async () => {
    if (typeof window === 'undefined') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 48000,
        },
        video: false,
      });
      streamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/webm;codecs=opus';

      const rec = new MediaRecorder(stream, { mimeType: mime });
      mediaRec.current = rec;
      chunksRef.current = [];
      setSeconds(0);

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mime });
          chunksRef.current = [];
          onComplete(blob);
        } catch (e: any) {
          onError?.(e);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          setIsRecording(false);
        }
      };

      rec.start(250);
      setIsRecording(true);

      stopAtRef.current = Date.now() + maxMs;
      if (typeof window !== 'undefined') {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          setSeconds((s) => {
            const next = s + 1;
            if (Date.now() >= (stopAtRef.current ?? 0)) {
              if (mediaRec.current && mediaRec.current.state !== 'inactive') {
                mediaRec.current.stop();
              }
              if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }
            return next;
          });
        }, 1000);
      }
    } catch (e: any) {
      onError?.(e);
    }
  };

  const stop = () => {
    try {
      if (mediaRec.current && mediaRec.current.state !== 'inactive') {
        mediaRec.current.stop();
      }
      if (typeof window !== 'undefined' && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (e: any) {
      onError?.(e);
    }
  };

  useEffect(() => {
    if (active) start();
    else stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return showUI ? (
    <div className="text-small text-gray-600 dark:text-grayish">
      <span className="inline-flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isRecording ? 'bg-sunsetOrange animate-pulse' : 'bg-gray-400'
          }`}
        />
        {isRecording ? `Recording… ${seconds}s` : 'Mic idle'}
      </span>
    </div>
  ) : null;
};
