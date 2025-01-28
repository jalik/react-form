/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { Errors, ModifiedFields, Values } from './useFormReducer'
import { UseFormStatusHook } from './useFormStatus'
import { UseFormValuesHook } from './useFormValues'
import { clone, hasDefinedValues } from './utils'
import { UseFormErrorsHook } from './useFormErrors'

export type UseFormValidationOptions<V extends Values, E> = {
  formErrors: UseFormErrorsHook<V, E>;
  formStatus: UseFormStatusHook;
  formValues: UseFormValuesHook<V>;
  validate? (values: Partial<V>, modified: ModifiedFields): Promise<Errors<E> | undefined>;
  validateField? (path: string, value: unknown, values: Partial<V>): Promise<E | undefined>;
  validateDelay?: number;
}

export type UseFormValidationHook<V extends Values, E> = {
  /**
   * Tells if the form will trigger a validation or if it will validate some fields.
   */
  needValidation: boolean | string[];
  /**
   * Sets validation globally or for given fields.
   */
  setNeedValidation: Dispatch<SetStateAction<boolean | string[]>>;
  /**
   * Sets the validated state of the form.
   */
  setValidated: Dispatch<SetStateAction<boolean>>;
  /**
   * Sets the validation error.
   */
  setValidateError: Dispatch<SetStateAction<Error | undefined>>;
  /**
   * Sets the validation state.
   */
  setValidating: Dispatch<SetStateAction<boolean>>;
  /**
   * Validate all fields.
   */
  validate: () => Promise<Errors<E> | undefined>;
  /**
   * The validation error.
   */
  validateError: Error | undefined;
  /**
   * Validate a single field.
   */
  validateField: (path: string) => Promise<E | undefined>;
  /**
   * Validate given fields.
   */
  validateFields: (paths: string[]) => Promise<Errors<E> | undefined>;
  /**
   * The ref of the validation function.
   */
  validateRef: MutableRefObject<UseFormValidationOptions<V, E>['validate']>;
  /**
   * Tells if the form was validated.
   */
  validated: boolean;
  /**
   * Tells if the form is validating.
   */
  validating: boolean;
}

function useFormValidation<V extends Values, E> (options: UseFormValidationOptions<V, E>): UseFormValidationHook<V, E> {
  const {
    formErrors,
    formStatus,
    formValues,
    validate: validateFunc,
    validateField: validateFieldFunc
  } = options

  const validateRef = useRef(validateFunc)
  const validateFieldRef = useRef(validateFieldFunc)

  const [needValidation, setNeedValidation] = useState<boolean | string[]>(false)
  const [validateError, setValidateError] = useState<Error | undefined>(undefined)
  const [validated, setValidated] = useState<boolean>(false)
  const [validating, setValidating] = useState<boolean>(false)

  const {
    clearErrors,
    errorsState,
    setErrors
  } = formErrors

  const {
    modifiedRef,
    touchedRef
  } = formStatus

  const {
    getValue,
    getValues
  } = formValues

  /**
   * Validates one or more fields by passing field names.
   */
  const validateFields = useCallback<UseFormValidationHook<V, E>['validateFields']>((paths) => {
    if (validateFieldRef.current == null) {
      return Promise.resolve(undefined)
    }
    setValidating(true)
    setValidateError(undefined)
    setNeedValidation(false)

    const validate = validateFieldRef.current
    const promises = validate
      ? paths.map((path) => {
        return Promise.resolve(validate(path, getValue(path), getValues()))
          .then((error): [string, E | undefined] => [path, error])
      })
      : []

    return Promise
      .all(promises)
      .then((results) => {
        let validationErrors: Errors<E> = { ...errorsState }

        results.forEach((result) => {
          if (result) {
            const [name, error] = result
            validationErrors = {
              ...validationErrors,
              [name]: error
            }
          }
        })

        if (hasDefinedValues(validationErrors)) {
          setValidated(false)
          setValidating(false)
          setErrors(validationErrors, { partial: false })
        } else {
          setValidated(true)
          setValidating(false)
          clearErrors()
        }
        return validationErrors
      })
      .catch((error) => {
        setValidating(false)
        setValidateError(error)
        return error
      })
  }, [clearErrors, errorsState, getValue, getValues, setErrors])

  const validateField = useCallback<UseFormValidationHook<V, E>['validateField']>((path) => (
    validateFields([path])
      .then((errors) => {
        const err: Errors<E> = { ...errors }
        return err[path] ?? undefined
      })
  ), [validateFields])

  const validate = useCallback<UseFormValidationHook<V, E>['validate']>(() => {
    if (validateRef.current == null) {
      // Validate touched and modified fields only,
      // since we don't have a global validation function.
      return validateFields(Object.keys({
        ...modifiedRef.current,
        ...touchedRef.current
      }))
    }

    setValidating(true)
    setValidateError(undefined)
    setNeedValidation(false)

    return Promise.resolve(
      validateRef.current(clone(getValues()), { ...modifiedRef.current })
    )
      .then((validationErrors) => {
        if (validationErrors && hasDefinedValues(validationErrors)) {
          setValidated(false)
          setValidating(false)
          setErrors(validationErrors, { partial: false })
        } else {
          setValidated(true)
          setValidating(false)
          clearErrors()
        }
        return validationErrors
      })
      .catch((error) => {
        setValidating(false)
        setValidateError(error)
        return undefined
      })
  }, [clearErrors, getValues, modifiedRef, setErrors, touchedRef, validateFields])

  useEffect(() => {
    validateRef.current = validateFunc
  }, [validateFunc])

  useEffect(() => {
    validateFieldRef.current = validateFieldFunc
  }, [validateFieldFunc])

  useEffect(() => {
    if (needValidation === true) {
      validate()
    } else if (needValidation instanceof Array && needValidation.length > 0) {
      validateFields(needValidation)
    }
  }, [validateFields, needValidation, validate])

  return {
    needValidation,
    setNeedValidation,
    setValidated,
    setValidateError,
    setValidating,
    validate,
    validateError,
    validateField,
    validateFields,
    validateRef,
    validated,
    validating
  }
}

export default useFormValidation
