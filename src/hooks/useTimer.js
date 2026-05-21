import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer() {
  const [totalMs, setTotalMs] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const endTimeRef = useRef(0);

  const set = useCallback((h, m, s) => {
    const ms = ((h * 3600) + (m * 60) + s) * 1000;
    setTotalMs(ms);
    setRemaining(ms);
    setFinished(false);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    endTimeRef.current = Date.now() + remaining;
    intervalRef.current = setInterval(() => {
      const left = endTimeRef.current - Date.now();
      if (left <= 0) {
        clearInterval(intervalRef.current);
        setRemaining(0);
        setRunning(false);
        setFinished(true);
      } else {
        setRemaining(left);
      }
    }, 50);
    setRunning(true);
    setFinished(false);
  }, [remaining]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRemaining(totalMs);
    setRunning(false);
    setFinished(false);
  }, [totalMs]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const progress = totalMs > 0 ? (totalMs - remaining) / totalMs : 0;

  return { remaining, running, finished, progress, set, start, pause, reset };
}
