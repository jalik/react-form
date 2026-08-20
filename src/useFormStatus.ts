/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback } from 'react'
import {
  FieldPath,
  FormMode,
  ModifiedState,
  TouchedState,
  UseFormStateHook,
  Values
} from './useFormState'
import { hasTrueValues } from './utils'

export type UseFormStatusOptions<V extends Values, E, R> = {
  /**
   * Update the form when it is modified or touched (happens only at the form level).
   */
  forceUpdateOnStatusChange?: boolean;
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
   * Clears the modified state of given paths or all paths.
   * @param paths
   * @param options
   */
  clearModifiedFields (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Clears the touched state of given paths or all paths.
   * @param paths
   * @param options
   */
  clearTouchedFields (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Returns modified fields.
   */
  getModifiedFields (): ModifiedState;
  /**
   * Returns modified fields.
   */
  getTouchedFields (): TouchedState;
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
   * Resets the modified state of given paths or all paths.
   * @param paths
   * @param options
   */
  resetModifiedFields (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Resets the touched state of given paths or all paths.
   * @param paths
   * @param options
   */
  resetTouchedFields (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }
  ): void;
  /**
   * Sets the modified state of a path.
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
   * Sets the modified state for given paths or all paths.
   * @param values
   * @param options
   */
  setModifiedFields (
    values: ModifiedState,
    options?: {
      forceUpdate?: boolean,
      partial?: boolean,
    }
  ): void;
  /**
   * Sets the touched state of a path.
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
   * Sets the touched state for given paths or all paths.
   * @param values
   * @param options
   */
  setTouchedFields (
    values: TouchedState,
    options?: {
      forceUpdate?: boolean,
      partial?: boolean,
    }
  ): void;
}

function useFormStatus<V extends Values, E, R> (options: UseFormStatusOptions<V, E, R>): UseFormStatusHook<V> {
  const {
    forceUpdateOnStatusChange,
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

  const clearModifiedFields = useCallback<UseFormStatusHook<V>['clearModifiedFields']>((paths, opts) => {
    const { forceUpdate = forceUpdateOnStatusChange } = opts ?? {}

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
  }, [forceUpdateOnStatusChange, mode, modifiedRef, setState])

  const getModifiedFields = useCallback<UseFormStatusHook<V>['getModifiedFields']>(() => {
    return modifiedRef.current
  }, [modifiedRef])

  const isModified = useCallback<UseFormStatusHook<V>['isModified']>((path) => {
    if (path) {
      return modifiedRef.current[path] ?? false
    }
    return hasTrueValues(modifiedRef.current)
  }, [modifiedRef])

  const resetModifiedFields = useCallback<UseFormStatusHook<V>['resetModifiedFields']>((paths, opts) => {
    const { forceUpdate = forceUpdateOnStatusChange } = opts ?? {}

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
  }, [forceUpdateOnStatusChange, initialModified, mode, modifiedRef, setState])

  const setModifiedFields = useCallback<UseFormStatusHook<V>['setModifiedFields']>((values, opts) => {
    const {
      partial = false,
      forceUpdate = forceUpdateOnStatusChange
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
  }, [forceUpdateOnStatusChange, mode, modifiedRef, setState])

  const setModifiedField = useCallback<UseFormStatusHook<V>['setModifiedField']>((path, value) => {
    setModifiedFields({ [path]: value }, { partial: true })
  }, [setModifiedFields])

  // TOUCHED

  const clearTouchedFields = useCallback<UseFormStatusHook<V>['clearTouchedFields']>((paths, opts) => {
    const { forceUpdate = forceUpdateOnStatusChange } = opts ?? {}

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
  }, [forceUpdateOnStatusChange, mode, setState, touchedRef])

  const getTouchedFields = useCallback<UseFormStatusHook<V>['getTouchedFields']>(() => {
    return touchedRef.current
  }, [touchedRef])

  const isTouched = useCallback<UseFormStatusHook<V>['isTouched']>((path) => {
    if (path) {
      return touchedRef.current[path] ?? false
    }
    return hasTrueValues(touchedRef.current)
  }, [touchedRef])

  const resetTouchedFields = useCallback<UseFormStatusHook<V>['resetTouchedFields']>((paths, opts) => {
    const { forceUpdate = forceUpdateOnStatusChange } = opts ?? {}

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
  }, [forceUpdateOnStatusChange, initialTouched, mode, setState, touchedRef])

  const setTouchedFields = useCallback<UseFormStatusHook<V>['setTouchedFields']>((values, opts) => {
    const {
      forceUpdate = forceUpdateOnStatusChange,
      partial = false
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
  }, [forceUpdateOnStatusChange, mode, setState, touchedRef])

  const setTouchedField = useCallback<UseFormStatusHook<V>['setTouchedField']>((path, value) => {
    setTouchedFields({ [path]: value }, { partial: true })
  }, [setTouchedFields])

  return {
    clearModifiedFields,
    clearTouchedFields,
    getModifiedFields,
    getTouchedFields,
    isModified,
    isTouched,
    resetModifiedFields,
    resetTouchedFields,
    setModifiedField,
    setModifiedFields,
    setTouchedField,
    setTouchedFields
  }
}

export default useFormStatus
