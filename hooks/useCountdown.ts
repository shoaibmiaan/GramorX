import { useEffect, useRef, useState } from "react";

export function useCountdown(totalSeconds: number, autoStart = false) {
  const [seconds, setSeconds] = useState(totalSeconds);
  const [running, setRunning] = useState(autoStart);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running || typeof window === "undefined") return;
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) setRunning(false);
  }, [seconds, running]);

  const start = () => {
    setSeconds(totalSeconds);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
  };

  const reset = () => {
    setSeconds(totalSeconds);
    setRunning(false);
  };

  return { seconds, running, start, stop, reset };
}
