/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { useCallback, useEffect, useRef } from 'react';

type DebouncedFunction<T> = (...args: any[]) => Promise<T | void>

/**
 * Avoids wasting function calls by waiting for the last call.
 */
function useDebouncePromise<T>(func: DebouncedFunction<T>, delay = 50): DebouncedFunction<T> {
  const funcRef = useRef(func);
  const timerRef = useRef<NodeJS.Timeout>();

  const debouncedFunc = useCallback((...args: unknown[]) => (
    new Promise<T | void>((resolve) => {
      timerRef.current = setTimeout(() => {
        resolve(funcRef.current(...args));
      }, delay);
    })
  ), [delay]);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  useEffect(() => (
    () => {
      // Clear timeout.
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    }
  ), [delay]);

  return debouncedFunc;
}

export default useDebouncePromise;
