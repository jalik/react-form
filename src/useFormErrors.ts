/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback } from 'react'
import { Errors, FieldPath, FormMode, UseFormStateHook } from './useFormState'
import { resolve } from './utils'

export type UseFormErrorsOptions<V extends Errors, E, R> = {
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>;
  /**
   * The form mode.
   */
  mode: FormMode;
}

export type UseFormErrorsHook<V extends Errors, E> = {
  /**
   * Clears errors for given paths or all errors.
   * @param paths
   * @param options
   */
  clearErrors (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }): void;
  /**
   * Returns the error of a path.
   * @param path
   */
  getError (path: FieldPath<V>): Errors<E>[FieldPath<V>];
  /**
   * Returns all errors.
   */
  getErrors (): Errors<E>;
  /**
   * Returns the initial error of a field.
   */
  getInitialError (path: FieldPath<V>): E | undefined;
  /**
   * Returns the initial errors.
   */
  getInitialErrors (): Errors<E>;
  /**
   * Restores all initial errors or only for given paths.
   * @param paths
   * @param options
   */
  resetErrors (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean
    }): void;
  /**
   * Sets the error of a path.
   * @param path
   * @param error
   * @param options
   */
  setError (
    path: FieldPath<V>,
    error: E | undefined,
    options?: {
      forceUpdate?: boolean
    }): void;
  /**
   * Sets errors for given paths or all errors.
   * @param errors
   * @param opts
   */
  setErrors (
    errors: Errors<E>,
    opts?: {
      forceUpdate?: boolean;
      partial?: boolean
    }): void;
}

/**
 * Returns errors that are not null, undefined or false.
 * @param errors
 */
export function filterErrors<E> (errors?: Errors<E>): Errors<E> {
  const result: Errors<E> = {}

  if (errors != null && typeof errors === 'object') {
    const paths = Object.keys(errors)

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      if (errors[path] != null && errors[path] !== false) {
        result[path] = errors[path]
      }
    }
  }
  return result
}

function useFormErrors<V extends Errors, E, R> (options: UseFormErrorsOptions<V, E, R>): UseFormErrorsHook<V, E> {
  const {
    mode,
    formState
  } = options

  const {
    errorsRef,
    setState,
    state
  } = formState

  const getError = useCallback<UseFormErrorsHook<V, E>['getError']>((path) => (
    errorsRef.current[path]
  ), [errorsRef])

  const getErrors = useCallback<UseFormErrorsHook<V, E>['getErrors']>(() => (
    errorsRef.current
  ), [errorsRef])

  const getInitialErrors = useCallback<UseFormErrorsHook<V, E>['getInitialErrors']>(() => {
    return state.initialErrors
  }, [state.initialErrors])

  const getInitialError = useCallback<UseFormErrorsHook<V, E>['getInitialError']>((path: FieldPath<V>) => {
    return resolve(path, getInitialErrors())
  }, [getInitialErrors])

  const setErrors = useCallback<UseFormErrorsHook<V, E>['setErrors']>((
    errors,
    opts?
  ) => {
    const {
      forceUpdate,
      partial
    } = opts ?? {}

    const nextErrors: Errors<E> = filterErrors(partial
      ? { ...errorsRef.current, ...errors }
      : { ...errors })

    errorsRef.current = nextErrors

    if (mode === 'controlled' || forceUpdate) {
      setState((s) => ({
        ...s,
        errors: nextErrors
      }))
    }
  }, [errorsRef, mode, setState])

  const setError = useCallback<UseFormErrorsHook<V, E>['setError']>((path, error, opts) => {
    setErrors({ [path]: error }, {
      ...opts,
      partial: true
    })
  }, [setErrors])

  const clearErrors = useCallback<UseFormErrorsHook<V, E>['clearErrors']>((paths, opts) => {
    const nextErrors: Errors<E> = {}

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        nextErrors[paths[i]] = undefined
      }
    }
    setErrors(nextErrors, {
      forceUpdate: true,
      ...opts,
      partial: paths != null
    })
  }, [setErrors])

  const resetErrors = useCallback<UseFormErrorsHook<V, E>['resetErrors']>((paths, opts) => {
    if (paths) {
      const nextErrors = {} as Errors<E>
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        nextErrors[path] = getInitialError(path)
      }
      setErrors(nextErrors, {
        forceUpdate: true,
        ...opts,
        partial: true
      })
    } else {
      setErrors(getInitialErrors() ?? {}, {
        forceUpdate: true,
        ...opts,
        partial: false
      })
    }
  }, [getInitialError, getInitialErrors, setErrors])

  return {
    clearErrors,
    getError,
    getErrors,
    getInitialError,
    getInitialErrors,
    resetErrors,
    setError,
    setErrors
  }
}

export default useFormErrors
