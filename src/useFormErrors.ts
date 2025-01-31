/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback } from 'react'
import { Errors, FieldPath, UseFormStateHook, Values } from './useFormState'
import { clone } from './utils'

export type UseFormErrorsOptions<V extends Values, E, R> = {
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>;
}

export type UseFormErrorsHook<V extends Values, E> = {
  /**
   * Clears errors for given paths or all errors.
   * @param paths
   */
  clearErrors (paths?: FieldPath<V>[]): void;
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
   * Sets the error of a path.
   * @param path
   * @param error
   */
  setError (path: FieldPath<V>, error: E | undefined): void;
  /**
   * Sets errors for given paths or all errors.
   * @param errors
   * @param opts
   */
  setErrors (errors: Errors<E>, opts?: { partial?: boolean }): void;
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

function useFormErrors<V extends Values, E, R> (options: UseFormErrorsOptions<V, E, R>): UseFormErrorsHook<V, E> {
  const {
    errorsRef,
    setState
  } = options.formState

  const clearErrors = useCallback<UseFormErrorsHook<V, E>['clearErrors']>((paths) => {
    setState((s) => {
      const nextState = { ...s }

      if (paths) {
        nextState.errors = clone(s.errors)

        for (let i = 0; i < paths.length; i++) {
          delete nextState.errors[paths[i]]
        }
      } else {
        nextState.errors = {}
      }
      errorsRef.current = nextState.errors
      return nextState
    })
  }, [errorsRef, setState])

  const getError = useCallback<UseFormErrorsHook<V, E>['getError']>((path) => (
    errorsRef.current[path]
  ), [errorsRef])

  const getErrors = useCallback<UseFormErrorsHook<V, E>['getErrors']>(() => (
    errorsRef.current
  ), [errorsRef])

  const setErrors = useCallback<UseFormErrorsHook<V, E>['setErrors']>((
    errors,
    opts?
  ) => {
    const { partial } = opts ?? {}
    setState((s) => {
      const baseErrors: Errors<E> = partial ? { ...s.errors } : {}
      const nextState = { ...s }
      nextState.errors = filterErrors({ ...baseErrors, ...errors })
      errorsRef.current = nextState.errors
      return nextState
    })
  }, [errorsRef, setState])

  const setError = useCallback<UseFormErrorsHook<V, E>['setError']>((path, error) => {
    setErrors({ [path]: error }, {
      partial: true
    })
  }, [setErrors])

  return {
    clearErrors,
    getError,
    getErrors,
    setError,
    setErrors
  }
}

export default useFormErrors
