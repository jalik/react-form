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
import { Values } from './useFormReducer'
import { build, clone, flatten } from './utils'
import { UseFormValuesHook } from './useFormValues'
import { UseFormErrorsHook } from './useFormErrors'
import { UseFormStatusHook } from './useFormStatus'

export type UseFormSubmissionOptions<V extends Values, E, R> = {
  /**
   * Tells if form values should be cleared after submit.
   */
  clearAfterSubmit?: boolean;
  /**
   * The form errors.
   */
  formErrors: UseFormErrorsHook<V, E>;
  /**
   * The form status.
   */
  formStatus: UseFormStatusHook;
  /**
   * The form values.
   */
  formValues: UseFormValuesHook<V>;
  /**
   * Replaces empty string by null on change and on submit.
   */
  nullify?: boolean;
  /**
   * Called when form has been successfully submitted.
   * @param result
   * @param values
   */
  onSuccess? (result: R, values: Partial<V>): void;
  /**
   * Use submitted values as initial values after form submission.
   */
  setInitialValuesOnSuccess?: boolean;
  /**
   * Handle values to submit.
   * @param values
   */
  submit? (values: Partial<V>): Promise<R>;
  /**
   * Enables trimming on submit.
   */
  trimOnSubmit?: boolean;
}

export type UseFormSubmissionHook<V extends Values, E, R> = {
  setSubmitCount: Dispatch<SetStateAction<number>>;
  setSubmitError: Dispatch<SetStateAction<E | undefined>>;
  setSubmitResult: Dispatch<SetStateAction<R | undefined>>;
  setSubmitted: Dispatch<SetStateAction<boolean>>;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  submit: () => Promise<R | undefined>;
  /**
   * The number of times the form was submitted (count is reset on success).
   */
  submitCount: number;
  /**
   * The submit error.
   */
  submitError: E | undefined;
  /**
   * The ref of the submit function.
   */
  submitRef: MutableRefObject<UseFormSubmissionOptions<V, E, R>['submit']>
  /**
   * The submit result returned by onSubmit promise.
   */
  submitResult: R | undefined;
  /**
   * Tells if the form was submitted successfully.
   */
  submitted: boolean;
  /**
   * Tells if the form is submitting.
   */
  submitting: boolean;
}

function useFormSubmission<V extends Values, E, R> (options: UseFormSubmissionOptions<V, E, R>): UseFormSubmissionHook<V, E, R> {
  const {
    clearAfterSubmit,
    formErrors,
    formStatus,
    formValues,
    nullify,
    onSuccess,
    setInitialValuesOnSuccess,
    submit: submitFunc,
    trimOnSubmit
  } = options

  const submitRef = useRef(submitFunc)

  const [submitCount, setSubmitCount] = useState<number>(0)
  const [submitError, setSubmitError] = useState<E | undefined>(undefined)
  const [submitResult, setSubmitResult] = useState<R | undefined>(undefined)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const { clearErrors } = formErrors

  const {
    clearModified,
    clearTouched
  } = formStatus

  const {
    clearValues,
    setInitialValues,
    getValues
  } = formValues

  const submit = useCallback<UseFormSubmissionHook<V, E, R>['submit']>(() => {
    if (submitRef.current == null) {
      return Promise.reject(new Error('No submit function provided'))
    }
    let values = clone(getValues())

    if (trimOnSubmit || nullify) {
      const mutation = flatten(values)
      Object.entries(mutation).forEach(([name, value]) => {
        if (typeof value === 'string') {
          // Remove extra spaces.
          let val: string | null = trimOnSubmit ? value.trim() : value

          // Remplace empty string by null.
          if (val === '') {
            val = null
          }
          values = build(name, val, values)
        }
      })
    }

    setSubmitError(undefined)
    setSubmitted(false)
    setSubmitting(true)
    setSubmitCount((count) => count + 1)

    return Promise.resolve(submitRef.current(values))
      .then((result): R => {
        setSubmitted(true)
        setSubmitting(false)
        setSubmitCount(0)
        setSubmitResult(result)

        if (setInitialValuesOnSuccess) {
          setInitialValues(values)
        } else if (clearAfterSubmit) {
          clearValues(undefined, { forceUpdate: true })
        }
        clearErrors()
        clearModified(undefined, { forceUpdate: true })
        clearTouched(undefined, { forceUpdate: true })

        if (onSuccess) {
          onSuccess(result, values)
        }
        return result
      })
      .catch((error) => {
        setSubmitError(error)
        setSubmitting(false)
        return undefined
      })
  }, [clearAfterSubmit, clearErrors, clearModified, clearTouched, clearValues, getValues, nullify, onSuccess, setInitialValues, setInitialValuesOnSuccess, trimOnSubmit])

  useEffect(() => {
    submitRef.current = submitFunc
  }, [submitFunc])

  return {
    setSubmitCount,
    setSubmitError,
    setSubmitResult,
    setSubmitted,
    setSubmitting,
    submit,
    submitCount,
    submitError,
    submitResult,
    submitRef,
    submitted,
    submitting
  }
}

export default useFormSubmission
