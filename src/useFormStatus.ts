/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useCallback, useRef, useState } from 'react'
import { ModifiedFields, TouchedFields } from './useFormReducer'
import { FormMode } from './useForm'
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

export type UseFormStatusHook = {
  /**
   * Clears modified state of given paths or all paths.
   * @param paths
   * @param options
   */
  clearModified (
    paths?: string[],
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
    paths?: string[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Tells if the field was modified else the form if no path is passed.
   * @param path
   */
  isModified (path?: string): boolean;
  /**
   * Tells if the field was touched else the form if no path is passed.
   * @param path
   */
  isTouched (path?: string): boolean;
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
    paths?: string[],
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
    paths?: string[],
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
    path: string,
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
    path: string,
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

function useFormStatus (options: UseFormStatusOptions): UseFormStatusHook {
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

  const clearModified = useCallback<UseFormStatusHook['clearModified']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      paths.forEach((path) => {
        delete modifiedRef.current[path]
      })
    } else {
      modifiedRef.current = {}
    }

    if (mode === 'controlled' || forceUpdate) {
      setModifiedState(modifiedRef.current)
    }
  }, [mode])

  const isModified = useCallback<UseFormStatusHook['isModified']>((path) => {
    if (path) {
      return modifiedRef.current[path] ?? false
    }
    return hasTrueValues(modifiedRef.current)
  }, [])

  const resetModified = useCallback<UseFormStatusHook['resetModified']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      paths.forEach((path) => {
        modifiedRef.current[path] = (initialModified ?? {})[path] ?? false
      })
    } else {
      modifiedRef.current = { ...initialModified }
    }

    if (mode === 'controlled' || forceUpdate) {
      setModifiedState(modifiedRef.current)
    }
  }, [initialModified, mode])

  const setModified = useCallback<UseFormStatusHook['setModified']>((values, opts) => {
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

  const setModifiedField = useCallback<UseFormStatusHook['setModifiedField']>((path, value) => {
    setModified({ [path]: value }, { partial: true })
  }, [setModified])

  // TOUCHED

  const clearTouched = useCallback<UseFormStatusHook['clearTouched']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      paths.forEach((path) => {
        delete touchedRef.current[path]
      })
    } else {
      touchedRef.current = {}
    }

    if (mode === 'controlled' || forceUpdate) {
      setTouchedState(touchedRef.current)
    }
  }, [mode])

  const isTouched = useCallback<UseFormStatusHook['isTouched']>((path) => {
    if (path) {
      return touchedRef.current[path] ?? false
    }
    return hasTrueValues(touchedRef.current)
  }, [])

  const resetTouched = useCallback<UseFormStatusHook['resetTouched']>((paths, opts) => {
    const { forceUpdate = false } = opts ?? {}

    if (paths) {
      paths.forEach((path) => {
        touchedRef.current[path] = (initialTouched ?? {})[path] ?? false
      })
    } else {
      touchedRef.current = { ...initialTouched }
    }

    if (mode === 'controlled' || forceUpdate) {
      setTouchedState(touchedRef.current)
    }
  }, [initialTouched, mode])

  const setTouched = useCallback<UseFormStatusHook['setTouched']>((values, opts) => {
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

  const setTouchedField = useCallback<UseFormStatusHook['setTouchedField']>((path, value) => {
    setTouched({ [path]: value }, { partial: true })
  }, [setTouched])

  return {
    clearModified,
    clearTouched,
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
