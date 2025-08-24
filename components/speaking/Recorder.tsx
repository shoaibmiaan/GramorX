// components/speaking/Recorder.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { useRecorder } from '@/hooks/useRecorder';

export type RecorderHandle = {
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<{ file?: File }>;
  reset: () => void;
};

<<<<<<< HEAD
type RecorderProps = {
  autoStart?: boolean;
  maxDurationSec?: number; // hard stop
  onComplete?: (file: File, meta: { durationSec: number; mime: string }) => void;
  onError?: (msg: string) => void;
  className?: string;
=======
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
>>>>>>> 4e94e6322611b22f93ab3e6364502036ed9a3d29
};

export const Recorder = forwardRef<RecorderHandle, RecorderProps>(
  (
    {
      autoStart = false,
      maxDurationSec = 120,
      onComplete,
      onError,
      className = '',
    },
    ref
  ) => {
    const {
      isRecording,
      isPaused,
      durationSec,
      mimeType,
      audioUrl,
      start,
      pause,
      resume,
      stop,
      error,
      reset,
    } = useRecorder({ preferredMimeType: 'audio/webm' });

    // expose imperative API
    useImperativeHandle(ref, () => ({
      start: () => start(),
      pause: () => pause(),
      resume: () => resume(),
      stop: () => stop(),
      reset: () => reset(),
    }));

    // auto-start for exam flow
    useEffect(() => {
      let kicked = false;
      if (autoStart && !kicked && !isRecording && durationSec === 0) {
        kicked = true;
        start().catch((e) => onError?.(String(e)));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart]);

    // hard max duration
    useEffect(() => {
      if (isRecording && durationSec >= maxDurationSec) {
        stop()
          .then(({ file }) => {
            if (file && onComplete)
              onComplete(file, { durationSec, mime: mimeType });
          })
          .catch((e) => onError?.(String(e)));
      }
    }, [
      durationSec,
      isRecording,
      maxDurationSec,
      stop,
      onComplete,
      mimeType,
      onError,
    ]);

    // bubble errors
    useEffect(() => {
      if (error) onError?.(error);
    }, [error, onError]);

    const minutes = Math.floor(durationSec / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (durationSec % 60).toString().padStart(2, '0');

    const canStart = !isRecording && !isPaused;
    const canPause = isRecording && !isPaused;
    const canResume = isRecording && isPaused;
    const canStop = isRecording;

    const status = useMemo(() => {
      if (isRecording && isPaused) return 'Paused';
      if (isRecording) return 'Recording';
      return 'Idle';
    }, [isRecording, isPaused]);

    return (
      <div
        className={`w-full rounded-2xl border border-gray-200 dark:border-white/10 p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-300">
            Status: <span className="font-medium">{status}</span>
          </div>
          <div className="font-mono text-lg tabular-nums">
            {minutes}:{seconds}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canStart}
            onClick={() => start().catch((e) => onError?.(String(e)))}
          >
            Start
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-amber-500 text-white disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canPause}
            onClick={() => pause()}
          >
            Pause
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canResume}
            onClick={() => resume()}
          >
            Resume
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-rose-600 text-white disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canStop}
            onClick={() =>
              stop()
                .then(({ file }) => {
                  if (file && onComplete)
                    onComplete(file, { durationSec, mime: mimeType });
                })
                .catch((e) => onError?.(String(e)))
            }
          >
            Stop & Save
          </button>
          <button
            className="ml-auto px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-100"
            onClick={() => reset()}
            disabled={isRecording}
          >
            Reset
          </button>
        </div>

        {audioUrl && (
          <div className="mt-4">
            <audio src={audioUrl} controls className="w-full" />
            <div className="text-xs text-gray-500 mt-1">Format: {mimeType}</div>
          </div>
        )}
      </div>
    );
  }
);

Recorder.displayName = 'Recorder';
export default Recorder;
