/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useCallback, useRef, useState } from 'react'
import { ModifiedFields, TouchedFields, Values } from './useFormReducer'
import { FieldKey, FormMode } from './useForm'
import { hasTrueValues } from './utils'

export type UseFormStatusOptions = {
  /**
   * Sets initial modified fields.
   */
  initialModified?: ModifiedFields;
  /**
   * Sets initial touched fields.
   */
  initialTouched?: TouchedFields;
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
    paths?: FieldKey<V>[],
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
    paths?: FieldKey<V>[],
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
  isModified (path?: FieldKey<V>): boolean;
  /**
   * Tells if the field was touched else the form if no path is passed.
   * @param path
   */
  isTouched (path?: FieldKey<V>): boolean;
  /**
   * Tells if the form was modified.
   */
  modified: boolean;
  /**
   * Contains modified fields ref (uncontrolled mode).
   */
  modifiedRef: MutableRefObject<ModifiedFields>;
  /**
   Contains modified fields state (controlled mode).
   */
  modifiedState: ModifiedFields;
  /**
   * Resets modified state of given paths or all paths.
   * @param paths
   * @param options
   */
  resetModified (
    paths?: FieldKey<V>[],
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
    paths?: FieldKey<V>[],
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
    path: FieldKey<V>,
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
    path: FieldKey<V>,
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
  /**
   * Tells if the form was touched.
   */
  touched: boolean;
  /**
   * Contains the touched fields ref (uncontrolled mode).
   */
  touchedRef: MutableRefObject<TouchedFields>;
  /**
   * Contains the touched fields state (controlled mode).
   */
  touchedState: TouchedFields;
}

function useFormStatus<V extends Values> (options: UseFormStatusOptions): UseFormStatusHook<V> {
  const {
    initialModified,
    initialTouched,
    mode
  } = options

  const modifiedRef = useRef<ModifiedFields>(initialModified ?? {})
  const [modifiedState, setModifiedState] = useState<ModifiedFields>(initialModified ?? {})

  const touchedRef = useRef<TouchedFields>(initialTouched ?? {})
  const [touchedState, setTouchedState] = useState<TouchedFields>(initialTouched ?? {})

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
      setModifiedState(modifiedRef.current)
    }
  }, [mode])

  const getModified = useCallback<UseFormStatusHook<V>['getModified']>(() => {
    return modifiedRef.current
  }, [])

  const getTouched = useCallback<UseFormStatusHook<V>['getTouched']>(() => {
    return touchedRef.current
  }, [])

  const isModified = useCallback<UseFormStatusHook<V>['isModified']>((path) => {
    if (path) {
      return modifiedRef.current[path] ?? false
    }
    return hasTrueValues(modifiedRef.current)
  }, [])

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
      setModifiedState(modifiedRef.current)
    }
  }, [initialModified, mode])

  const setModified = useCallback<UseFormStatusHook<V>['setModified']>((values, opts) => {
    const {
      partial = false,
      forceUpdate = false
    } = opts ?? {}

    if (partial) {
      modifiedRef.current = { ...modifiedRef.current, ...values }
    } else {
      modifiedRef.current = { ...values }
    }

    if (mode === 'controlled' || forceUpdate) {
      setModifiedState(modifiedRef.current)
    }
  }, [mode])

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
      setTouchedState(touchedRef.current)
    }
  }, [mode])

  const isTouched = useCallback<UseFormStatusHook<V>['isTouched']>((path) => {
    if (path) {
      return touchedRef.current[path] ?? false
    }
    return hasTrueValues(touchedRef.current)
  }, [])

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
      setTouchedState(touchedRef.current)
    }
  }, [initialTouched, mode])

  const setTouched = useCallback<UseFormStatusHook<V>['setTouched']>((values, opts) => {
    const {
      partial = false,
      forceUpdate = false
    } = opts ?? {}

    if (partial) {
      touchedRef.current = { ...touchedRef.current, ...values }
    } else {
      touchedRef.current = { ...values }
    }

    if (mode === 'controlled' || forceUpdate) {
      setTouchedState(touchedRef.current)
    }
  }, [mode])

  const setTouchedField = useCallback<UseFormStatusHook<V>['setTouchedField']>((path, value) => {
    setTouched({ [path]: value }, { partial: true })
  }, [setTouched])

  return {
    clearModified,
    clearTouched,
    getModified,
    getTouched,
    modified: hasTrueValues(modifiedRef.current),
    modifiedRef,
    modifiedState,
    isModified,
    isTouched,
    resetModified,
    resetTouched,
    setModified,
    setModifiedField,
    setTouched,
    setTouchedField,
    touched: hasTrueValues(touchedRef.current),
    touchedRef,
    touchedState
  }
}

export default useFormStatus
