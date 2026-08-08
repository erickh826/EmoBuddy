import { useState, useRef, useCallback, useEffect } from "react";

export function useLongPress(callback: () => void, ms: number = 2000) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const firedRef = useRef(false);

  const start = useCallback(() => {
    if (firedRef.current) return;
    startTimeRef.current = Date.now();
    setProgress(0);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(1, elapsed / ms);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        setProgress(1);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        callback();
      }
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!firedRef.current) {
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    firedRef.current = false;
    setProgress(0);
    stop();
  }, [stop]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    progress,
    start,
    stop,
    reset,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        start();
      },
      onPointerUp: stop,
      onPointerLeave: stop,
      onPointerCancel: stop,
    },
  };
}
