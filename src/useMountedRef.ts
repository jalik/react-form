/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useEffect, useRef } from 'react'

function useMountedRef (): MutableRefObject<boolean> {
  const mountedRef = useRef<boolean>(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return mountedRef
}

export default useMountedRef
