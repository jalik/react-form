/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { Errors, FieldPath, ModifiedFields, UseFormStateHook, Values } from './useFormState'
import { UseFormStatusHook } from './useFormStatus'
import { UseFormValuesHook } from './useFormValues'
import { hasDefinedValues } from './utils'
import { UseFormErrorsHook } from './useFormErrors'
import useDebouncePromise from './useDebouncePromise'

export type UseFormValidationOptions<V extends Values, E, R> = {
  /**
   * The form errors hook.
   */
  formErrors: UseFormErrorsHook<V, E>;
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>;
  /**
   * The form status hook.
   */
  formStatus: UseFormStatusHook<V>;
  /**
   * The form values hook.
   */
  formValues: UseFormValuesHook<V>;
  /**
   * Validates given values.
   * @param values
   * @param modified
   */
  validate? (values: Partial<V>, modified: ModifiedFields): Promise<Errors<E> | undefined>;
  /**
   * Validates a single field.
   * @param path
   * @param value
   * @param values
   */
  validateField? (path: FieldPath<V>, value: unknown, values: Partial<V>): Promise<E | undefined>;
  /**
   * The validation delay.
   */
  validateDelay?: number;
}

export type UseFormValidationHook<V extends Values, E, R> = {
  /**
   * Sets validation globally or for given fields.
   */
  setNeedValidation (validation: boolean | FieldPath<V>[]): void;
  /**
   * Sets the validation error.
   */
  setValidateError (error: Error | undefined): void;
  /**
   * Sets the validated state of the form.
   */
  setValidated (validated: boolean): void;
  /**
   * Sets the validation state.
   */
  setValidating (validating: boolean): void;
  /**
   * Validate all fields.
   */
  validate (): Promise<Errors<E> | undefined>;
  /**
   * Validate a single field.
   */
  validateField (path: FieldPath<V>): Promise<E | undefined>;
  /**
   * Validate given fields.
   */
  validateFields (paths: FieldPath<V>[]): Promise<Errors<E> | undefined>;
  /**
   * The ref of the validation function.
   */
  validateRef: MutableRefObject<UseFormValidationOptions<V, E, R>['validate']>;
}

function useFormValidation<V extends Values, E, R> (options: UseFormValidationOptions<V, E, R>): UseFormValidationHook<V, E, R> {
  const {
    formState,
    formValues,
    validate: validateFunc,
    validateDelay,
    validateField: validateFieldFunc
  } = options

  const {
    state
  } = formState

  const {
    errorsRef,
    modifiedRef,
    setState,
    touchedRef
  } = formState

  const validateRef = useRef(validateFunc)
  const validateFieldRef = useRef(validateFieldFunc)

  const {
    getValue,
    getValues
  } = formValues

  const setNeedValidation = useCallback<UseFormValidationHook<V, E, R>['setNeedValidation']>((needValidation) => {
    setState((s) => ({
      ...s,
      needValidation
    }))
  }, [setState])

  const setValidateError = useCallback<UseFormValidationHook<V, E, R>['setValidateError']>((validateError) => {
    setState((s) => ({
      ...s,
      validateError
    }))
  }, [setState])

  const setValidated = useCallback<UseFormValidationHook<V, E, R>['setValidated']>((validated) => {
    setState((s) => ({
      ...s,
      validated
    }))
  }, [setState])

  const setValidating = useCallback<UseFormValidationHook<V, E, R>['setValidating']>((validating) => {
    setState((s) => ({
      ...s,
      validating
    }))
  }, [setState])

  const validateFields = useCallback<UseFormValidationHook<V, E, R>['validateFields']>((paths) => {
    if (validateFieldRef.current == null) {
      return Promise.resolve(undefined)
    }

    setState((s) => ({
      ...s,
      needValidation: false,
      validateError: undefined,
      validated: false,
      validating: true
    }))

    const validate = validateFieldRef.current
    const promises = validate
      ? paths.map((path) => {
        return Promise.resolve(validate(path, getValue(path), getValues()))
          .then((error): [FieldPath<V>, E | undefined] => [path, error])
      })
      : []

    return Promise
      .all(promises)
      .then((results) => {
        const errors: Errors<E> = {}

        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          const [name, error] = result
          errors[name] = error
        }

        setState((s) => {
          const nextErrors: Errors<E> = { ...errorsRef.current, ...errors }
          errorsRef.current = nextErrors
          return {
            ...s,
            needValidation: false,
            errors: nextErrors,
            validated: !hasDefinedValues(nextErrors),
            validating: false
          }
        })
        return errors
      })
      .catch((error) => {
        setState((s) => ({
          ...s,
          needValidation: false,
          validateError: error,
          validated: false,
          validating: false
        }))
        return error
      })
  }, [errorsRef, getValue, getValues, setState])

  const validateField = useCallback<UseFormValidationHook<V, E, R>['validateField']>((path) => (
    validateFields([path])
      .then((errors) => {
        const err: Errors<E> = { ...errors }
        return err[path] ?? undefined
      })
  ), [validateFields])

  const validate = useCallback<UseFormValidationHook<V, E, R>['validate']>(() => {
    if (validateRef.current == null) {
      // Validate touched and modified fields only,
      // since we don't have a global validation function.
      return validateFields(Object.keys({
        ...modifiedRef.current,
        ...touchedRef.current
      }))
    }

    setState((s) => ({
      ...s,
      needValidation: false,
      validateError: undefined,
      validated: false,
      validating: true
    }))

    return Promise.resolve(
      validateRef.current(getValues(), { ...modifiedRef.current })
    )
      .then((nextErrors = {}) => {
        errorsRef.current = nextErrors
        setState((s) => ({
          ...s,
          errors: nextErrors,
          validated: !hasDefinedValues(nextErrors),
          validating: false
        }))
        return nextErrors
      })
      .catch((error) => {
        setState((s) => ({
          ...s,
          validateError: error,
          validated: false,
          validating: false
        }))
        return undefined
      })
  }, [errorsRef, getValues, modifiedRef, setState, touchedRef, validateFields])

  useEffect(() => {
    validateRef.current = validateFunc
  }, [validateFunc])

  useEffect(() => {
    validateFieldRef.current = validateFieldFunc
  }, [validateFieldFunc])

  const debouncedValidateFields =
    useDebouncePromise(validateFields, validateDelay)

  const debouncedValidate =
    useDebouncePromise(validate, validateDelay)

  useEffect(() => {
    if (state.needValidation === true) {
      debouncedValidate()
    } else if (state.needValidation instanceof Array && state.needValidation.length > 0) {
      debouncedValidateFields(state.needValidation)
    }
  }, [validateFields, validate, state.needValidation, debouncedValidate, debouncedValidateFields])

  return {
    setNeedValidation,
    setValidateError,
    setValidated,
    setValidating,
    validate,
    validateField,
    validateFields,
    validateRef
  }
}

export default useFormValidation
