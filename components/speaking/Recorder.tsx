/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/design-system/Button';

export type RecorderProps = {
  onBlob: (blob: Blob) => void;
  onError?: (msg: string) => void;
  className?: string;
  /** Hard cap in bytes; default ~15MB */
  maxBytes?: number;
  /** Auto-stop after N seconds; default 180s */
  maxSeconds?: number;
};

function pickMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',      // iOS Safari fallback
    'audio/mpeg',     // last-ditch fallback (some browsers synthesize)
  ];
  for (const c of candidates) {
    // @ts-ignore
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
      return c;
    }
  }
  return ''; // let browser choose
}

function extFromMime(mime: string) {
  if (!mime) return 'webm';
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('mpeg')) return 'mp3';
  if (mime.includes('webm')) return 'webm';
  return 'webm';
}

export const Recorder: React.FC<RecorderProps> = ({
  onBlob,
  onError,
  className = '',
  maxBytes = 15 * 1024 * 1024,
  maxSeconds = 180,
}) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mime, setMime] = useState<string>('');
  const chunksRef = useRef<BlobPart[]>([]);
  const sizeRef = useRef<number>(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const tickRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => cleanup();
  }, []);

  function cleanup() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    try {
      recRef.current?.stream?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    recRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setElapsed(0);
  }

  async function start() {
    try {
      const m = pickMimeType();
      setMime(m);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // @ts-ignore
      const rec = new MediaRecorder(stream, m ? { mimeType: m } : undefined);
      recRef.current = rec;
      chunksRef.current = [];
      sizeRef.current = 0;

      rec.ondataavailable = (ev: BlobEvent) => {
        if (!ev.data) return;
        chunksRef.current.push(ev.data);
        sizeRef.current += ev.data.size;
        if (sizeRef.current > maxBytes) {
          onError?.('Recording stopped: file too large.');
          stop(true);
        }
      };
      rec.onerror = (e: any) => {
        onError?.(`Recorder error: ${e?.error?.message || e?.message || 'unknown'}`);
        stop(true);
      };
      rec.start(1000); // gather chunks every second
      setRecording(true);

      tickRef.current = window.setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= maxSeconds) {
            onError?.('Auto-stopped at max duration.');
            stop();
          }
          return s + 1;
        });
      }, 1000);
    } catch (e: any) {
      const code = e?.name || e?.code;
      if (code === 'NotAllowedError' || code === 'PermissionDeniedError') {
        onError?.('Microphone permission was denied. Please allow mic access and try again.');
      } else if (code === 'NotFoundError' || code === 'DevicesNotFoundError') {
        onError?.('No microphone found. Please connect a mic and try again.');
      } else {
        onError?.(e?.message || 'Failed to start recording.');
      }
      cleanup();
    }
  }

  function stop(silent = false) {
    try {
      recRef.current?.stop();
    } catch {}
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setRecording(false);

    // assemble & emit
    const type = mime || (recRef.current as any)?.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];
    sizeRef.current = 0;
    if (!silent && blob.size > 0) {
      onBlob(blob);
    }
    // stop tracks
    try {
      recRef.current?.stream?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    recRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setElapsed(0);
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!recording ? (
        <Button variant="primary" onClick={start} className="rounded-ds-xl">
          <i className="fas fa-microphone mr-2" aria-hidden="true" /> Record
        </Button>
      ) : (
        <>
          <Button variant="danger" onClick={() => stop()} className="rounded-ds-xl">
            <i className="fas fa-stop mr-2" aria-hidden="true" /> Stop
          </Button>
          <span className="text-small text-grayish">
            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
            {String(elapsed % 60).padStart(2, '0')} • {mime || 'auto'}
          </span>
        </>
      )}
    </div>
  );
};
