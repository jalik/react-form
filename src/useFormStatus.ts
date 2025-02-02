/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback } from 'react'
import {
  FieldPath,
  FormMode,
  ModifiedFields,
  TouchedFields,
  UseFormStateHook,
  Values
} from './useFormState'
import { hasTrueValues } from './utils'

export type UseFormStatusOptions<V extends Values, E, R> = {
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>;
  /**
   * The form mode.
   */
  mode: FormMode;
}

export type UseFormStatusHook<V extends Values> = {
  /**
   * Clears modified state of given paths or all paths.
   * @param paths
   * @param options
   */
  clearModified (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Clears touched state of given paths or all paths.
   * @param paths
   * @param options
   */
  clearTouched (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Returns modified fields.
   */
  getModified (): ModifiedFields;
  /**
   * Returns modified fields.
   */
  getTouched (): TouchedFields;
  /**
   * Tells if the field was modified else the form if no path is passed.
   * @param path
   */
  isModified (path?: FieldPath<V>): boolean;
  /**
   * Tells if the field was touched else the form if no path is passed.
   * @param path
   */
  isTouched (path?: FieldPath<V>): boolean;
  /**
   * Resets modified state of given paths or all paths.
   * @param paths
   * @param options
   */
  resetModified (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Resets touched state of given paths or all paths.
   * @param paths
   * @param options
   */
  resetTouched (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Sets modified state of a path.
   * @param path
   * @param value
   * @param options
   */
  setModifiedField (
    path: FieldPath<V>,
    value: boolean,
    options?: {
      forceUpdate?: boolean,
    }
  ): void;
  /**
   * Sets modified state for given paths or all paths.
   * @param values
   * @param options
   */
  setModified (
    values: ModifiedFields,
    options?: {
      forceUpdate?: boolean,
      partial?: boolean,
    }
  ): void;
  /**
   * Sets touched state of a path.
   * @param path
   * @param value
   * @param options
   */
  setTouchedField (
    path: FieldPath<V>,
    value: boolean,
    options?: {
      forceUpdate?: boolean,
    }
  ): void;
  /**
   * Sets touched state for given paths or all paths.
   * @param values
   * @param options
   */
  setTouched (
    values: TouchedFields,
    options?: {
      forceUpdate?: boolean,
      partial?: boolean,
    }
  ): void;
}

function useFormStatus<V extends Values, E, R> (options: UseFormStatusOptions<V, E, R>): UseFormStatusHook<V> {
  const {
    formState,
    mode
  } = options

  const {
    state,
    modifiedRef,
    touchedRef,
    setState
  } = formState

  const {
    initialModified,
    initialTouched
  } = state

  // MODIFIED

  const clearModified = useCallback<UseFormStatusHook<V>['clearModified']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        delete modifiedRef.current[path]
      }
    } else {
      modifiedRef.current = {}
    }

    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        modifiedFields: modifiedRef.current
      }))
    }
  }, [mode, modifiedRef, setState])

  const getModified = useCallback<UseFormStatusHook<V>['getModified']>(() => {
    return modifiedRef.current
  }, [modifiedRef])

  const isModified = useCallback<UseFormStatusHook<V>['isModified']>((path) => {
    if (path) {
      return modifiedRef.current[path] ?? false
    }
    return hasTrueValues(modifiedRef.current)
  }, [modifiedRef])

  const resetModified = useCallback<UseFormStatusHook<V>['resetModified']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        modifiedRef.current[path] = (initialModified ?? {})[path] ?? false
      }
    } else {
      modifiedRef.current = { ...initialModified }
    }

    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        modifiedFields: modifiedRef.current
      }))
    }
  }, [initialModified, mode, modifiedRef, setState])

  const setModified = useCallback<UseFormStatusHook<V>['setModified']>((values, opts) => {
    const {
      partial = false,
      forceUpdate = false
    } = opts ?? {}

    // const previousModified = clone(modifiedRef.current)

    const nextModified = partial
      ? { ...modifiedRef.current, ...values }
      : { ...values }

    modifiedRef.current = nextModified

    // fixme compare next and previous to update
    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        modifiedFields: nextModified
      }))
    }
  }, [mode, modifiedRef, setState])

  const setModifiedField = useCallback<UseFormStatusHook<V>['setModifiedField']>((path, value) => {
    setModified({ [path]: value }, { partial: true })
  }, [setModified])

  // TOUCHED

  const clearTouched = useCallback<UseFormStatusHook<V>['clearTouched']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        delete touchedRef.current[path]
      }
    } else {
      touchedRef.current = {}
    }

    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        touchedFields: touchedRef.current
      }))
    }
  }, [mode, setState, touchedRef])

  const getTouched = useCallback<UseFormStatusHook<V>['getTouched']>(() => {
    return touchedRef.current
  }, [touchedRef])

  const isTouched = useCallback<UseFormStatusHook<V>['isTouched']>((path) => {
    if (path) {
      return touchedRef.current[path] ?? false
    }
    return hasTrueValues(touchedRef.current)
  }, [touchedRef])

  const resetTouched = useCallback<UseFormStatusHook<V>['resetTouched']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        touchedRef.current[path] = (initialTouched ?? {})[path] ?? false
      }
    } else {
      touchedRef.current = { ...initialTouched }
    }

    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        touchedFields: touchedRef.current
      }))
    }
  }, [initialTouched, mode, setState, touchedRef])

  const setTouched = useCallback<UseFormStatusHook<V>['setTouched']>((values, opts) => {
    const {
      partial = false,
      forceUpdate = false
    } = opts ?? {}

    // const previousTouched = clone(touchedRef.current)

    const nextTouched = partial
      ? { ...touchedRef.current, ...values }
      : { ...values }

    touchedRef.current = nextTouched

    // fixme compare next and previous to update
    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        touchedFields: nextTouched
      }))
    }
  }, [mode, setState, touchedRef])

  const setTouchedField = useCallback<UseFormStatusHook<V>['setTouchedField']>((path, value) => {
    setTouched({ [path]: value }, { partial: true })
  }, [setTouched])

  return {
    clearModified,
    clearTouched,
    getModified,
    getTouched,
    isModified,
    isTouched,
    resetModified,
    resetTouched,
    setModified,
    setModifiedField,
    setTouched,
    setTouchedField
  }
}

export default useFormStatus
