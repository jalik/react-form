/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { UseFormStateHook, Values } from './useFormState'
import { build, clone } from './utils'
import { UseFormValuesHook } from './useFormValues'
import { UseFormErrorsHook } from './useFormErrors'
import { UseFormStatusHook } from './useFormStatus'

export type AfterSubmitOption = 'clear' | 'initialize' | 'reset' | null

export type UseFormSubmissionOptions<V extends Values, E, R> = {
  /**
   * Tells what to do with form values after submit.
   */
  afterSubmit?: AfterSubmitOption;
  /**
   * The form errors hook.
   */
  formErrors: UseFormErrorsHook<V, E>;
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>
  /**
   * The form status hook.
   */
  formStatus: UseFormStatusHook<V>;
  /**
   * The form values hook.
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
  /**
   * Submits form values.
   */
  submit: () => Promise<R | undefined>;
  /**
   * The ref of the submit function.
   */
  submitRef: MutableRefObject<UseFormSubmissionOptions<V, E, R>['submit']>
}

function useFormSubmission<V extends Values, E, R> (options: UseFormSubmissionOptions<V, E, R>): UseFormSubmissionHook<V, E, R> {
  const {
    afterSubmit,
    formErrors,
    formState,
    formStatus,
    formValues,
    nullify,
    onSuccess,
    submit: submitFunc,
    trimOnSubmit
  } = options

  const {
    setState
  } = formState
  const { clearErrors } = formErrors

  const submitRef = useRef(submitFunc)

  const {
    clearModified,
    clearTouched
  } = formStatus

  const {
    clearValues,
    getValues,
    resetValues,
    setInitialValues
  } = formValues

  const submit = useCallback<UseFormSubmissionHook<V, E, R>['submit']>(() => {
    if (submitRef.current == null) {
      return Promise.reject(new Error('No submit function provided'))
    }
    let values = clone(getValues())

    if (trimOnSubmit || nullify) {
      const paths = Object.keys(values)

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        const value: unknown = values[path]

        if (typeof value === 'string') {
          // Remove extra spaces.
          let nextValue: string | null = trimOnSubmit ? value.trim() : value

          // Remplace empty string by null.
          if (nextValue === '' && nullify) {
            nextValue = null
          }
          if (nextValue !== value) {
            values = build(path, nextValue, values)
          }
        }
      }
    }

    setState((s) => ({
      ...s,
      submitCount: s.submitCount + 1,
      submitError: undefined,
      submitResult: undefined,
      submitted: false,
      submitting: true
    }))

    return Promise.resolve(submitRef.current(values))
      .then((result): R => {
        setState((s) => ({
          ...s,
          submitCount: 0,
          submitError: undefined,
          submitResult: result,
          submitted: true,
          submitting: false
        }))

        clearErrors(undefined, { forceUpdate: false })
        clearModified(undefined, { forceUpdate: false })
        clearTouched(undefined, { forceUpdate: false })

        if (afterSubmit === 'clear') {
          clearValues(undefined, { forceUpdate: true })
        } else if (afterSubmit === 'initialize') {
          setInitialValues(values)
        } else if (afterSubmit === 'reset') {
          resetValues(undefined, { forceUpdate: true })
        }

        if (onSuccess) {
          onSuccess(result, values)
        }
        return result
      })
      .catch((error) => {
        setState((s) => ({
          ...s,
          submitError: error,
          submitted: false,
          submitting: false
        }))
        return undefined
      })
  }, [afterSubmit, clearErrors, clearModified, clearTouched, clearValues, getValues, nullify, onSuccess, resetValues, setInitialValues, setState, trimOnSubmit])

  useEffect(() => {
    submitRef.current = submitFunc
  }, [submitFunc])

  return {
    submit,
    submitRef
  }
}

export default useFormSubmission
