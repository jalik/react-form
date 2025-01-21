/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Values } from './useFormReducer'
import useMountedRef from './useMountedRef'

export type UseFormLoaderOptions<V extends Values> = {
  loader?: () => Promise<V | undefined>;
  onSuccess: (values: V | undefined) => void;
}

export type UseFormLoaderHook = {
  load: () => void;
  loadError: Error | undefined;
  loading: boolean;
}

function useFormLoader<V extends Values> (options: UseFormLoaderOptions<V>): UseFormLoaderHook {
  const {
    loader,
    onSuccess
  } = options

  const loaderRef = useRef(loader)
  const loadedRef = useRef<boolean>(false)
  const mountedRef = useMountedRef()
  const [loadError, setLoadError] = useState<Error | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  const load = useCallback(() => {
    if (!loaderRef.current) {
      return Promise.resolve(undefined)
    }
    setLoadError(undefined)
    setLoading(true)
    return Promise.resolve(loaderRef.current())
      .then((result) => {
        loadedRef.current = true

        if (mountedRef.current && result) {
          setLoadError(undefined)
          setLoading(false)
          onSuccess(result)
        }
      })
      .catch((error) => {
        setLoadError(error)
        setLoading(false)
      })
  }, [mountedRef, onSuccess])

  // Load initial values using a function.
  useEffect(() => {
    if (!loadedRef.current) {
      load()
    }
  }, [load])

  return {
    load,
    loadError,
    loading
  }
}

export default useFormLoader
