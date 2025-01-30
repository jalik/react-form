/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback, useMemo, useState } from 'react'
import { Errors, Values } from './useFormReducer'
import { hasDefinedValues } from './utils'
import { FieldKey } from './useForm'

export type UseFormErrorsOptions<E> = {
  /**
   * Sets initial errors.
   */
  initialErrors?: Errors<E>;
}

export type UseFormErrorsHook<V extends Values, E> = {
  /**
   * Clears errors for given paths or all errors.
   * @param paths
   */
  clearErrors (paths?: FieldKey<V>[]): void;
  /**
   * The errors state.
   */
  errorsState: Errors<E>;
  /**
   * Returns the error of a path.
   * @param path
   */
  getError (path: FieldKey<V>): Errors<E>[FieldKey<V>];
  /**
   * Returns all errors.
   */
  getErrors (): Errors<E>;
  /**
   * Tells if there are any error.
   */
  hasError: boolean;
  /**
   * Sets the error of a path.
   * @param path
   * @param error
   */
  setError (path: FieldKey<V>, error: E | undefined): void;
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
function filterErrors<E> (errors?: Errors<E>): Errors<E> {
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

function useFormErrors<V extends Values, E> (options: UseFormErrorsOptions<E>): UseFormErrorsHook<V, E> {
  const [errorsState, setErrorsState] = useState(filterErrors(options.initialErrors))

  const hasError = useMemo(() => hasDefinedValues(errorsState), [errorsState])

  const clearErrors = useCallback<UseFormErrorsHook<V, E>['clearErrors']>((paths) => {
    setErrorsState((s) => {
      if (paths) {
        const nextState = { ...s }

        for (let i = 0; i < paths.length; i++) {
          delete nextState[paths[i]]
        }
        return nextState
      }
      return {}
    })
  }, [])

  const getErrors = useCallback<UseFormErrorsHook<V, E>['getErrors']>(() => (
    errorsState
  ), [errorsState])

  const getError = useCallback<UseFormErrorsHook<V, E>['getError']>((path) => (
    errorsState[path]
  ), [errorsState])

  const setErrors = useCallback<UseFormErrorsHook<V, E>['setErrors']>((
    errors,
    opts?
  ) => {
    setErrorsState((s) => {
      const baseErrors: Errors<E> = opts?.partial ? { ...s } : {}
      return filterErrors({ ...baseErrors, ...errors })
    })
  }, [])

  const setError = useCallback<UseFormErrorsHook<V, E>['setError']>((path, error) => {
    setErrors({ [path]: error }, {
      partial: true
    })
  }, [setErrors])

  return {
    clearErrors,
    errorsState,
    getError,
    getErrors,
    hasError,
    setError,
    setErrors
  }
}

export default useFormErrors
