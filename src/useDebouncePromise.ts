/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback, useEffect, useRef } from 'react'

type DebouncedFunction<T> = (...args: any[]) => Promise<T>;

/**
 * Avoids wasting function calls by waiting for the last call.
 */
function useDebouncePromise<T> (func: DebouncedFunction<T>, delay = 50): DebouncedFunction<T> {
  const funcRef = useRef(func)
  const timerRef = useRef<NodeJS.Timeout>()

  const debouncedFunc = useCallback((...args: unknown[]) => (
    new Promise<T>((resolve) => {
      // Clear current timeout.
      if (timerRef.current != null) {
        clearTimeout(timerRef.current)
      }
      // Start new timeout.
      timerRef.current = setTimeout(() => {
        resolve(funcRef.current(...args))
      }, delay)
    })
  ), [delay])

  useEffect(() => {
    funcRef.current = func
  }, [func])

  useEffect(() => {
    return () => {
      // Clear timeout.
      if (timerRef.current != null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [delay])

  return debouncedFunc
}

export default useDebouncePromise
