/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { RefObject, useEffect, useRef } from 'react'

function useMountedRef (): RefObject<boolean> {
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
