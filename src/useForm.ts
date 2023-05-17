/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import useDebouncePromise from './useDebouncePromise'
import useFormReducer, {
  ACTION_CLEAR,
  ACTION_CLEAR_ERRORS,
  ACTION_CLEAR_TOUCHED_FIELDS,
  ACTION_INIT_VALUES,
  ACTION_LOAD,
  ACTION_LOAD_ERROR,
  ACTION_LOAD_SUCCESS,
  ACTION_REMOVE,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERRORS,
  ACTION_SET_TOUCHED_FIELDS,
  ACTION_SET_VALUES,
  ACTION_SUBMIT,
  ACTION_SUBMIT_ERROR,
  ACTION_SUBMIT_SUCCESS,
  ACTION_VALIDATE,
  ACTION_VALIDATE_ERROR,
  ACTION_VALIDATE_FAIL,
  ACTION_VALIDATE_SUCCESS,
  Errors,
  FormState,
  initialState,
  ModifiedFields,
  Values
} from './useFormReducer'
import {
  build,
  clone,
  flatten,
  getCheckedValues,
  getFieldId,
  getSelectedValues,
  hasDefinedValues,
  isMultipleFieldElement,
  parseInputValue,
  resolve
} from './utils'

export type FieldAttributes<T> = {
  disabled: boolean
  id: string
  name: string
  onBlur (event: React.FocusEvent<any>): void
  onChange (event: React.ChangeEvent<any>): void
  value: T
}

export type FieldElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

export interface UseFormHook<V extends Values, R> extends FormState<V, R> {
  clear (fields?: string[]): void;
  clearErrors (fields?: string[]): void;
  clearTouchedFields (fields?: string[]): void;
  getFieldProps (name: string): any;
  getInitialValue<T> (name: string): T | undefined;
  getValue<T> (name: string, defaultValue?: T): T | undefined;
  handleBlur (event: React.FocusEvent): void;
  handleChange (event: React.ChangeEvent, options?: {
    parser? (value: unknown, target: HTMLElement): any
  }): void;
  handleReset (event: React.FormEvent<HTMLFormElement>): void;
  handleSetValue (name: string): (value: unknown | undefined) => void;
  handleSubmit (event: React.FormEvent<HTMLFormElement>): void;
  load (): void;
  removeFields (fields: string[]): void;
  reset (fields?: string[]): void;
  submit (): Promise<void | R>;
  setError (name: string, error?: Error): void;
  setErrors (errors: Errors): void;
  setInitialValues (values: Partial<V>): void;
  setTouchedFields (
    fields: string[],
    options?: { validate?: boolean }
  ): void;
  setValue (
    name: string,
    value?: unknown,
    options?: { validate?: boolean }
  ): void;
  setValues (
    values: Values | Partial<V>,
    options?: { partial?: boolean, validate?: boolean }
  ): void;
  validate (): Promise<void | Errors | undefined>;
  validateField (name: string): Promise<void | Error | undefined>;
  validateFields (fields?: string[]): Promise<void | Errors | undefined>;
}

export interface UseFormOptions<V extends Values, R> {
  disabled?: boolean;
  initialValues?: Partial<V>;
  nullify?: boolean;
  initializeField? (name: string, formState: FormState<V, R>): Record<string, unknown> | undefined;
  load? (): Promise<void | V>;
  onSubmit (values: Partial<V>): Promise<void | R>;
  onSubmitted? (result: R): void;
  submitDelay?: number;
  transform? (mutation: Values, values: Partial<V>): Partial<V>;
  trim?: boolean;
  validate? (
    values: Partial<V>,
    modifiedFields: ModifiedFields
  ): Promise<void | Errors | undefined>;
  validateField? (
    name: string,
    value: unknown,
    values: Partial<V>
  ): Promise<void | Error | undefined>;
  validateDelay?: number;
  validateOnChange?: boolean;
  validateOnInit?: boolean;
  validateOnSubmit?: boolean;
  validateOnTouch?: boolean;
}

/**
 * Manage form state and actions.
 */
function useForm<V extends Values, R = any> (options: UseFormOptions<V, R>): UseFormHook<V, R> {
  const {
    disabled = false,
    initialValues,
    initializeField: initializeFieldFunc,
    load: loadFunc,
    nullify = false,
    onSubmit,
    onSubmitted,
    submitDelay = 100,
    transform: transformFunc,
    trim,
    validate: validateFunc,
    validateField: validateFieldFunc,
    validateDelay = 200,
    validateOnChange = false,
    validateOnInit = false,
    validateOnSubmit = true,
    validateOnTouch = false
  } = options

  // Checks options.
  if (typeof onSubmit !== 'function') {
    throw new Error('onSubmit must be a function')
  }

  // Defines function references.
  const initializeFieldRef = useRef(initializeFieldFunc)
  const mountedRef = useRef(false)
  const onSubmitRef = useRef(onSubmit)
  const transformRef = useRef(transformFunc)
  const validateFieldRef = useRef(validateFieldFunc)
  const validateRef = useRef(validateFunc)

  // Defines the form state.
  const [state, dispatch] = useReducer(
    useFormReducer<V, R>,
    {
      ...initialState,
      // Disables fields if default values are undefined.
      disabled: disabled || !initialValues,
      initialized: initialValues != null,
      initialValues: initialValues || {},
      loading: typeof loadFunc === 'function',
      values: initialValues || {},
      validateOnChange,
      validateOnInit,
      validateOnSubmit,
      validateOnTouch
    },
    undefined
  )

  /**
   * Clears all values or selected fields only.
   */
  const clear = useCallback((fields?: string[]): void => {
    dispatch({
      type: ACTION_CLEAR,
      data: { fields }
    })
  }, [])

  /**
   * Clears all errors or selected fields errors.
   */
  const clearErrors = useCallback((fields?: string[]): void => {
    dispatch({
      type: ACTION_CLEAR_ERRORS,
      data: { fields }
    })
  }, [])

  /**
   * Returns the initial value of a field.
   */
  const getInitialValue = useCallback(<T> (name: string): T | undefined => (
    resolve<T>(name, clone(state.initialValues))
  ), [state.initialValues])

  /**
   * Returns the value of a field.
   */
  const getValue = useCallback(<T> (name: string, defaultValue?: T): T | undefined => {
    const value = resolve<T>(name, clone(state.values))
    return typeof value !== 'undefined' ? value : defaultValue
  }, [state.values])

  /**
   * Loads and set initial values.
   */
  const load = useCallback((): void => {
    if (!loadFunc) {
      return
    }
    dispatch({ type: ACTION_LOAD })
    Promise.resolve(loadFunc())
      .then((result) => {
        if (mountedRef && result) {
          dispatch({
            type: ACTION_LOAD_SUCCESS,
            data: { values: result }
          })
        }
      })
      .catch((error) => {
        dispatch({
          type: ACTION_LOAD_ERROR,
          error
        })
      })
  }, [loadFunc])

  /**
   * Removes fields definitely (also removes errors, modified/touched states, etc).
   */
  const removeFields = useCallback((fields: string[]): void => {
    // Ignore action if form disabled
    if (disabled) return

    dispatch({
      type: ACTION_REMOVE,
      data: { fields }
    })
  }, [disabled])

  /**
   * Defines the field error.
   */
  const setError = useCallback((name: string, error: Error): void => {
    dispatch({
      type: ACTION_SET_ERRORS,
      data: { errors: { [name]: error } }
    })
  }, [])

  /**
   * Defines form field errors.
   */
  const setErrors = useCallback((errors: Errors): void => {
    dispatch({
      type: ACTION_SET_ERRORS,
      data: { errors }
    })
  }, [])

  /**
   * Validates one or more fields by passing field names.
   */
  const validateFields = useCallback((fields: string[]): Promise<void | Errors | undefined> => {
    dispatch({
      type: ACTION_VALIDATE,
      data: { fields }
    })

    const validate = validateFieldRef.current
    const promises: Promise<[string, void | Error | undefined]>[] = validate
      ? fields.map((name: string) => {
        return Promise.resolve(validate(name, getValue(name), state.values))
          .then((error) => [name, error])
      })
      : []

    let errors: Errors = {}

    return Promise
      .all(promises)
      .then((results) => {
        results.forEach((result) => {
          if (result) {
            const [name, error] = result
            errors = {
              ...errors,
              [name]: error
            }
          }
        })
        dispatch({
          type: ACTION_VALIDATE_FAIL,
          data: {
            // Keep existing errors.
            errors: {
              ...state.errors,
              ...errors
            }
          }
        })
        return errors
      })
      .catch((error) => {
        dispatch({
          type: ACTION_VALIDATE_ERROR,
          error
        })
      })
  }, [getValue, state.errors, state.values])

  /**
   * Validates a field value.
   */
  const validateField = useCallback((name: string): Promise<void | Error | undefined> => (
    validateFields([name])
      .then((errors: void | Errors | undefined) => {
        const err: Record<string, void | Error | undefined> = { ...errors }
        return err[name]
      })
  ), [validateFields])

  /**
   * Defines several field values (use setInitialValues() to set all form values).
   */
  const setValues = useCallback((
    values: Values | Partial<V>,
    opts?: {
      partial?: boolean,
      validate?: boolean
    }
  ): void => {
    // Ignore action if form disabled
    if (disabled) return

    // Flatten values to make sur mutation only contains field names as keys
    // and field values as values.
    let mutation = flatten({ ...values })

    if (transformRef.current) {
      // Merge changes with current values.
      let nextValues = clone(state.values) || {}
      Object.entries(mutation)
        .forEach(([name, value]) => {
          nextValues = build(name, value, nextValues)
        })
      // Apply transformation to changed values.
      mutation = transformRef.current(mutation, nextValues)
    } else if (nullify || trim) {
      Object.entries(mutation).forEach(([name, value]) => {
        if (typeof value === 'string') {
          let nextValue: string | null = value

          if (trim) {
            // Remove extra spaces.
            nextValue = nextValue.trim()
          }
          if (nextValue === '' && nullify) {
            // Replace empty string with null.
            nextValue = null
          }
          mutation[name] = nextValue
        }
      })
    }

    dispatch({
      type: ACTION_SET_VALUES,
      data: {
        partial: opts?.partial,
        validate: opts?.validate || (opts?.validate !== false && validateOnChange),
        values: mutation
      }
    })
  }, [disabled, nullify, state.values, trim, validateOnChange])

  /**
   * Defines the value of a field.
   */
  const setValue = useCallback((
    name: string,
    value?: unknown,
    opts?: { validate?: boolean }
  ): void => {
    setValues({ [name]: value }, {
      partial: true,
      validate: opts?.validate
    })
  }, [setValues])

  /**
   * Clear touched fields.
   */
  const clearTouchedFields = useCallback((fields?: string[]): void => {
    dispatch({
      type: ACTION_CLEAR_TOUCHED_FIELDS,
      data: { fields }
    })
  }, [])

  /**
   * Sets touched fields.
   */
  const setTouchedFields = useCallback((
    fields: string[],
    opts?: { validate?: boolean }
  ): void => {
    let canDispatch = false

    // Check if we really need to dispatch the event
    for (let i = 0; i < fields.length; i += 1) {
      if (!state.touchedFields[fields[i]]) {
        canDispatch = true
        break
      }
    }

    if (canDispatch) {
      const { validate = false } = { ...opts }
      dispatch({
        type: ACTION_SET_TOUCHED_FIELDS,
        data: {
          fields,
          validate
        }
      })
    }
  }, [state.touchedFields])

  /**
   * Resets form values.
   */
  const reset = useCallback((fields?: string[]): void => {
    if (fields) {
      dispatch({
        type: ACTION_RESET_VALUES,
        data: { fields }
      })
    } else {
      dispatch({ type: ACTION_RESET })
    }
  }, [])

  /**
   * Submits form.
   */
  const submit = useCallback((): Promise<void | R> => {
    dispatch({ type: ACTION_SUBMIT })
    return Promise.resolve(onSubmitRef.current(clone(state.values)))
      .then((result) => {
        if (result) {
          dispatch({
            type: ACTION_SUBMIT_SUCCESS,
            data: { result }
          })
          if (onSubmitted) {
            onSubmitted(result)
          }
        }
        return result
      })
      .catch((error: Error) => {
        dispatch({
          type: ACTION_SUBMIT_ERROR,
          error
        })
      })
  }, [onSubmitted, state.values])

  /**
   * Validates form values.
   */
  const validate = useCallback((opts?: {
    beforeSubmit?: boolean
  }): Promise<void | Errors | undefined> => {
    if (typeof validateRef.current !== 'function') {
      // Validate touched and modified fields only,
      // since we don't have a global validation function.
      // todo validate registered fields
      return validateFields(Object.keys({
        ...state.modifiedFields,
        ...state.touchedFields
      }))
    }

    dispatch({ type: ACTION_VALIDATE })

    return Promise.resolve(validateRef.current(clone(state.values), { ...state.modifiedFields }))
      .then((errors) => {
        if (errors && hasDefinedValues(errors)) {
          dispatch({
            type: ACTION_VALIDATE_FAIL,
            data: { errors }
          })
        } else {
          const { beforeSubmit = false } = opts || {}
          dispatch({
            type: ACTION_VALIDATE_SUCCESS,
            data: { beforeSubmit }
          })
        }
        return errors
      })
      .catch((error) => {
        dispatch({
          type: ACTION_VALIDATE_ERROR,
          error
        })
      })
  }, [state.modifiedFields, state.touchedFields, state.values, validateFields])

  /**
   * Validates if necessary and submits form.
   */
  const validateAndSubmit = useCallback((): Promise<void | R> => (
    !state.validated && validateOnSubmit
      ? validate({ beforeSubmit: true })
        .then((errors) => {
          if (!errors || !hasDefinedValues(errors)) {
            return submit()
          }
          return undefined
        })
      : submit()
  ), [validateOnSubmit, state.validated, validate, submit])

  const debouncedSubmit = useDebouncePromise<R>(validateAndSubmit, submitDelay)

  /**
   * Defines initial values (after loading for example).
   */
  const setInitialValues = useCallback((values: Partial<V>): void => {
    dispatch({
      type: ACTION_INIT_VALUES,
      data: { values }
    })
  }, [])

  /**
   * Handles leaving of a field.
   */
  const handleBlur = useCallback((event: React.FocusEvent<FieldElement>): void => {
    setTouchedFields([event.currentTarget.name])
  }, [setTouchedFields])

  /**
   * Handles change of field value.
   */
  const handleChange = useCallback((
    event: React.ChangeEvent<FieldElement>,
    opts?: { parser? (value: unknown, target: HTMLElement): any }
  ): void => {
    const { parser } = opts || {}
    const { currentTarget } = event
    const {
      name,
      type
    } = currentTarget
    let value

    // Parses value using a custom parser or using the native parser (smart typing).
    const parsedValue = typeof parser === 'function'
      ? parser(currentTarget.value, currentTarget)
      : parseInputValue(currentTarget)

    // Handles array value (checkboxes, select-multiple).
    const el = currentTarget.form?.elements.namedItem(name)
    if (el && isMultipleFieldElement(el)) {
      if (currentTarget instanceof HTMLInputElement) {
        value = getCheckedValues(currentTarget)
      } else if (currentTarget instanceof HTMLSelectElement) {
        value = getSelectedValues(currentTarget)
      }
    } else if (type === 'checkbox' && currentTarget instanceof HTMLInputElement) {
      if (currentTarget.value === '') {
        // Checkbox has no value defined, so we use the checked state instead.
        value = currentTarget.checked
      } else if (typeof parsedValue === 'boolean') {
        // Checkbox has a boolean value.
        value = currentTarget.checked ? parsedValue : !parsedValue
      } else {
        // Checkbox value other than boolean.
        value = currentTarget.checked ? parsedValue : undefined
      }
    } else {
      value = parsedValue
    }

    setValue(name, value)
  }, [setValue])

  /**
   * Handles form reset.
   */
  const handleReset = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    reset()
  }, [reset])

  const handleSetValue = useCallback((name: string) => {
    return (value: unknown | undefined): void => {
      setValue(name, value)
    }
  }, [setValue])

  /**
   * Handles form submit.
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    validateAndSubmit()
  }, [validateAndSubmit])

  /**
   * Returns props of a field.
   */
  const getFieldProps = useCallback(<T> (name: string): FieldAttributes<T> => {
    const value: any = getValue(name)

    // Prepare default props
    let props: FieldAttributes<T> = {
      disabled: disabled || state.submitting || state.loading,
      id: getFieldId(name, value),
      name,
      onBlur: handleBlur,
      onChange: handleChange,
      value
    }

    if (typeof initializeFieldRef.current === 'function') {
      // Prepare custom props based on form state
      const customProps = initializeFieldRef.current(name, state)
      props = {
        ...props,
        ...customProps,
        disabled: props.disabled || customProps?.disabled === true
      }
    }
    return props
  }, [disabled, getValue, handleBlur, handleChange, state])

  // Keep track of mount state.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect((): void => {
    initializeFieldRef.current = initializeFieldFunc
  }, [initializeFieldFunc])

  useEffect(() => {
    onSubmitRef.current = onSubmit
  }, [onSubmit])

  useEffect((): void => {
    transformRef.current = transformFunc
  }, [transformFunc])

  useEffect(() => {
    validateFieldRef.current = validateFieldFunc
  }, [validateFieldFunc])

  useEffect(() => {
    validateRef.current = validateFunc
  }, [validateFunc])

  useEffect(() => {
    if (initialValues && !state.initialized) {
      setInitialValues(initialValues)
    }
  }, [setInitialValues, initialValues, state.initialized])

  const debouncedValidateFields = useDebouncePromise(validateFields, validateDelay)

  useEffect(() => {
    if (state.needValidation === true) {
      validate()
    } else if (state.needValidation instanceof Array && state.needValidation.length > 0) {
      debouncedValidateFields(state.needValidation)
    }
  }, [debouncedValidateFields, state.needValidation, validate])

  // Load initial values using a function.
  useEffect(() => {
    load()
  }, [load])

  return useMemo(() => ({
    ...state,
    clear,
    clearErrors,
    clearTouchedFields,
    getFieldProps,
    getInitialValue,
    getValue,
    handleBlur,
    handleChange,
    handleReset,
    handleSetValue,
    handleSubmit,
    setInitialValues,
    load,
    removeFields,
    reset,
    setError,
    setErrors,
    setValue,
    setValues,
    submit: debouncedSubmit,
    setTouchedFields,
    validate,
    validateField,
    validateFields
  }), [state, clear, clearErrors, clearTouchedFields, getFieldProps, getInitialValue,
    getValue, handleBlur, handleChange, handleReset, handleSetValue, handleSubmit,
    setInitialValues, load, removeFields, reset, setError, setErrors, setValue, setValues,
    debouncedSubmit, setTouchedFields, validate, validateField, validateFields])
}

export default useForm
