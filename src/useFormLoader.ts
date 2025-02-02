/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback, useEffect, useRef } from 'react'
import { UseFormStateHook, Values } from './useFormState'
import useMountedRef from './useMountedRef'

export type UseFormLoaderOptions<V extends Values, E, R> = {
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>
  /**
   * Loads values.
   */
  onLoad? (): Promise<V | undefined>;
  /**
   * Called when the values are loaded.
   * @param values
   */
  onSuccess? (values: V | undefined): void;
}

export type UseFormLoaderHook = {
  load (): void;
}

function useFormLoader<V extends Values, E, R> (options: UseFormLoaderOptions<V, E, R>): UseFormLoaderHook {
  const {
    formState,
    onLoad,
    onSuccess
  } = options

  const {
    errorsRef,
    initialValuesRef,
    modifiedRef,
    touchedRef,
    valuesRef,
    state,
    setState
  } = formState

  const loaderRef = useRef(onLoad)
  const loadedRef = useRef<boolean>(false)
  const mountedRef = useMountedRef()

  const load = useCallback(() => {
    if (!loaderRef.current) {
      return
    }
    if (state.loading) {
      return
    }
    setState((s) => ({
      ...s,
      loading: true,
      loadError: undefined
    }))
    return Promise.resolve(loaderRef.current())
      .then((result) => {
        loadedRef.current = true

        if (mountedRef.current && result) {
          setState((s) => {
            errorsRef.current = {}
            initialValuesRef.current = result
            modifiedRef.current = {}
            touchedRef.current = {}
            valuesRef.current = result
            return {
              ...s,
              initialErrors: {},
              errors: {},
              hasError: false,
              initialModified: {},
              modifiedFields: {},
              modified: false,
              initialTouched: {},
              touchedFields: {},
              touched: false,
              initialValues: result,
              values: result,
              initialized: true,
              loading: false,
              loadError: undefined
            }
          })
          if (onSuccess) {
            onSuccess(result)
          }
        }
      })
      .catch((error) => {
        setState((s) => ({
          ...s,
          loading: false,
          loadError: error
        }))
      })
  }, [errorsRef, initialValuesRef, modifiedRef, mountedRef, onSuccess, setState, state.loading, touchedRef, valuesRef])

  useEffect(() => {
    loaderRef.current = onLoad
  }, [onLoad])

  useEffect(() => {
    // Load initial values.
    if (!loadedRef.current &&
      loaderRef.current != null &&
      !state.initialized &&
      !state.loading &&
      state.loadError == null) {
      load()
    }
  }, [load, state.initialized, state.loadError, state.loading])

  return {
    load
  }
}

export default useFormLoader
