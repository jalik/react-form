/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * Avoids wasting function calls by waiting for the last call.
 * @param {function} func
 * @param {number} delay
 * @return {function}
 */
function useDebouncePromise(func, delay = 50) {
  const [handler, setHandler] = useState(null);
  const funcRef = useRef(func);

  const debouncedFunc = useCallback((...args) => (
    new Promise((resolve) => {
      setHandler(setTimeout(() => {
        resolve(funcRef.current(...args));
      }, delay));
    })
  ), [delay]);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  useEffect(() => (
    // Clean timeout.
    () => {
      if (handler !== null) {
        clearTimeout(handler);
      }
    }
  ), [delay, handler]);

  return debouncedFunc;
}

export default useDebouncePromise;
