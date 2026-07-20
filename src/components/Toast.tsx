'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDone = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (message) {
      timerRef.current = setTimeout(handleDone, 2600);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [message, handleDone]);

  return (
    <div className={`toast${message ? ' show' : ''}`}>
      {message}
    </div>
  );
}
