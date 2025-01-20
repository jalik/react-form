/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback, useMemo, useState } from 'react'
import { Errors, FormState, Values } from './useFormReducer'
import { hasDefinedValues } from './utils'
import { FieldKey } from './useForm'

export type UseFormErrorsOptions<V extends Values, E, R> = {
  initialErrors?: Errors<E>;
  state: FormState<V, E, R>;
}

export type UseFormErrorsHook<V extends Values, E> = {
  clearErrors (paths?: FieldKey<V>[]): void;
  errors: Errors<E>;
  getError (path: FieldKey<V>): Errors<E>[FieldKey<V>];
  getErrors (): Errors<E>;
  hasError: boolean;
  setError (path: FieldKey<V>, error: E): void;
  setErrors (errors: Errors<E>, opts?: { partial?: boolean }): void;
}

function useFormErrors<V extends Values, E, R> (options: UseFormErrorsOptions<V, E, R>): UseFormErrorsHook<V, E> {
  const [formErrors, setFormErrors] = useState<Errors<E>>(() => {
    const errors: Errors<E> = {}
    const { initialErrors } = options

    if (initialErrors && hasDefinedValues(initialErrors)) {
      Object.keys(initialErrors).forEach((path) => {
        if (initialErrors[path]) {
          errors[path] = initialErrors[path]
        }
      })
    }
    return errors
  })

  const hasError = useMemo(() => hasDefinedValues(formErrors), [formErrors])

  const clearErrors = useCallback<UseFormErrorsHook<V, E>['clearErrors']>((paths) => {
    setFormErrors((s) => {
      if (paths) {
        paths.forEach((path) => {
          delete s[path]
        })
        return s
      }
      return {}
    })
  }, [])

  const getErrors = useCallback<UseFormErrorsHook<V, E>['getErrors']>(() => (
    formErrors
  ), [formErrors])

  const getError = useCallback<UseFormErrorsHook<V, E>['getError']>((path) => (
    formErrors[path]
  ), [formErrors])

  const setErrors = useCallback<UseFormErrorsHook<V, E>['setErrors']>((
    errors,
    opts?
  ) => {
    setFormErrors((s) => {
      const result: Errors<E> = opts?.partial ? { ...s } : {}

      Object.keys(errors).forEach((path) => {
        if (errors[path] != null) {
          result[path] = errors[path]
        } else {
          delete result[path]
        }
      })
      return result
    })
  }, [])

  const setError = useCallback<UseFormErrorsHook<V, E>['setError']>((path, error) => {
    setErrors({ [path]: error }, {
      partial: true
    })
  }, [setErrors])

  return {
    clearErrors,
    errors: formErrors,
    getError,
    getErrors,
    hasError,
    setError,
    setErrors
  }
}

export default useFormErrors
