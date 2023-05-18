/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React, { ElementType, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
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
  TouchedFields,
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

export type FieldElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

export interface UseFormHook<V extends Values, E, R> extends FormState<V, E, R> {
  clear (fields?: string[]): void;
  clearErrors (fields?: string[]): void;
  clearTouchedFields (fields?: string[]): void;
  getFieldProps<Component extends ElementType = any> (
    name: string,
    props?: React.ComponentProps<Component>
  ): React.ComponentProps<Component>;
  getInitialValue<T> (name: string): T | undefined;
  getValue<T> (name: string, defaultValue?: T): T | undefined;
  handleBlur (event: React.FocusEvent): void;
  handleChange (event: React.ChangeEvent, options?: {
    parser? (value: unknown, target?: HTMLElement): any
  }): void;
  handleReset (event: React.FormEvent<HTMLFormElement>): void;
  handleSetValue (name: string): (value: unknown | undefined) => void;
  handleSubmit (event: React.FormEvent<HTMLFormElement>): void;
  load (): void;
  removeFields (fields: string[]): void;
  reset (fields?: string[]): void;
  submit (): Promise<void | R>;
  setError (name: string, error?: E): void;
  setErrors (
    errors: Errors<E>,
    opts?: { partial?: boolean }
  ): void;
  setInitialValues (values: Partial<V>): void;
  setTouchedField (name: string, touched: boolean | undefined): void;
  setTouchedFields (
    fields: TouchedFields,
    options?: { partial?: boolean, validate?: boolean }
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
  validate (opts?: { submitAfter: boolean }): Promise<void | Errors<E> | undefined>;
  validateField (name: string): Promise<void | E | undefined>;
  validateFields (fields?: string[]): Promise<void | Errors<E> | undefined>;
}

export interface UseFormOptions<V extends Values, E, R> {
  disabled?: boolean;
  initialValues?: Partial<V>;
  nullify?: boolean;
  initializeField?<C extends ElementType> (name: string, formState: FormState<V, E, R>): React.ComponentProps<C> | undefined;
  load? (): Promise<void | V>;
  onSubmit (values: Partial<V>): Promise<void | R>;
  onSubmitted? (result: R): void;
  reinitialize?: boolean;
  submitDelay?: number;
  transform? (mutation: Values, values: Partial<V>): Partial<V>;
  trimOnBlur?: boolean;
  trimOnSubmit?: boolean;
  validate? (
    values: Partial<V>,
    modifiedFields: ModifiedFields
  ): Promise<void | Errors<E> | undefined>;
  validateField? (
    name: string,
    value: unknown,
    values: Partial<V>
  ): Promise<void | E | undefined>;
  validateDelay?: number;
  validateOnChange?: boolean;
  validateOnInit?: boolean;
  validateOnSubmit?: boolean;
  validateOnTouch?: boolean;
}

/**
 * Manage form state and actions.
 */
function useForm<V extends Values, E = Error, R = any> (options: UseFormOptions<V, E, R>): UseFormHook<V, E, R> {
  const {
    disabled = false,
    initialValues,
    initializeField: initializeFieldFunc,
    load: loadFunc,
    nullify = false,
    onSubmit,
    onSubmitted,
    reinitialize = false,
    submitDelay = 100,
    transform: transformFunc,
    trimOnBlur = false,
    trimOnSubmit = false,
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
    useFormReducer<V, E, R>,
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

  const formDisabled = useMemo(() => (
    disabled || state.disabled || state.loading || state.validating || state.submitting
  ), [disabled, state.disabled, state.loading, state.submitting, state.validating])

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
    if (formDisabled) return

    dispatch({
      type: ACTION_REMOVE,
      data: { fields }
    })
  }, [formDisabled])

  /**
   * Defines form field errors.
   */
  const setErrors = useCallback((errors: Errors<E>, opts?: { partial?: boolean }): void => {
    dispatch({
      type: ACTION_SET_ERRORS,
      data: {
        errors,
        partial: opts?.partial === true
      }
    })
  }, [])

  /**
   * Defines the field error.
   */
  const setError = useCallback((name: string, error: E): void => {
    setErrors({ [name]: error }, { partial: true })
  }, [setErrors])

  /**
   * Validates one or more fields by passing field names.
   */
  const validateFields = useCallback((fields: string[]): Promise<void | Errors<E> | undefined> => {
    dispatch({
      type: ACTION_VALIDATE,
      data: { fields }
    })

    const validate = validateFieldRef.current
    const promises: Promise<[string, void | E | undefined]>[] = validate
      ? fields.map((name: string) => {
        return Promise.resolve(validate(name, getValue(name), state.values))
          .then((error) => [name, error])
      })
      : []

    let errors: Errors<E> = {}

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
  const validateField = useCallback((name: string): Promise<void | E | undefined> => (
    validateFields([name])
      .then((errors: void | Errors<E> | undefined) => {
        const err: Record<string, void | E | undefined> = { ...errors }
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
    if (formDisabled) return

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
    } else if (nullify) {
      Object.entries(mutation).forEach(([name, value]) => {
        if (typeof value === 'string') {
          let nextValue: string | null = value

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
        partial: opts?.partial === true,
        validate: opts?.validate != null ? opts.validate : validateOnChange,
        values: mutation
      }
    })
  }, [formDisabled, nullify, state.values, validateOnChange])

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
    touchedFields: TouchedFields,
    opts?: { partial?: boolean, validate?: boolean }
  ): void => {
    const {
      partial = false,
      validate
    } = { ...opts }

    dispatch({
      type: ACTION_SET_TOUCHED_FIELDS,
      data: {
        touchedFields,
        partial,
        validate: validate != null ? validate : validateOnTouch
      }
    })
  }, [validateOnTouch])

  const setTouchedField = useCallback((name: string, touched: boolean): void => {
    setTouchedFields({ [name]: touched }, { partial: true })
  }, [setTouchedFields])

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
    let values = clone(state.values)

    // Remove extra spaces.
    if (trimOnSubmit) {
      const mutation = flatten(values)
      Object.entries(mutation).forEach(([name, value]) => {
        if (typeof value === 'string') {
          values = build(name, value.trim(), values)
        }
      })
    }

    dispatch({ type: ACTION_SUBMIT })
    return Promise.resolve(onSubmitRef.current(values))
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
      .catch((error) => {
        dispatch({
          type: ACTION_SUBMIT_ERROR,
          error
        })
      })
  }, [onSubmitted, state.values, trimOnSubmit])

  /**
   * Validates form values.
   */
  const validate = useCallback((opts?: {
    submitAfter?: boolean
  }): Promise<void | Errors<E> | undefined> => {
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
          const { submitAfter = false } = opts || {}
          dispatch({
            type: ACTION_VALIDATE_SUCCESS,
            data: { submitAfter }
          })
        }
        return errors
      })
      .catch((error) => {
        dispatch({
          type: ACTION_VALIDATE_ERROR,
          error
        })
        return error
      })
  }, [state.modifiedFields, state.touchedFields, state.values, validateFields])

  /**
   * Validates if necessary and submits form.
   */
  const validateAndSubmit = useCallback(async (): Promise<void | R> => {
    if (!validateOnSubmit) {
      return submit()
    }
    if (state.validated) {
      return submit()
    }
    const errors = await validate({ submitAfter: true })

    if (!errors || !hasDefinedValues(errors)) {
      return submit()
    }
  }, [validateOnSubmit, state.validated, validate, submit])

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
    const { name } = event.currentTarget
    let touch = true

    if (trimOnBlur) {
      let value = getValue(name)

      if (typeof value === 'string') {
        // Remove extra spaces.
        value = value.trim()
        setValue(name, value, { validate: state.validateOnTouch })
        // Avoid unnecessary render because setValue already touch the field.
        touch = false
      }
    }

    if (touch) {
      setTouchedField(name, true)
    }
  }, [getValue, setTouchedField, setValue, state.validateOnTouch, trimOnBlur])

  /**
   * Handles change of field value.
   */
  const handleChange = useCallback((
    event: React.ChangeEvent<FieldElement>,
    opts?: { parser? (value: unknown, target?: HTMLElement): any }
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

    const el = currentTarget.form?.elements.namedItem(name)

    // Handles array value (checkboxes, select-multiple).
    if (el && isMultipleFieldElement(el)) {
      if (currentTarget instanceof HTMLInputElement) {
        value = getCheckedValues(currentTarget)
      } else if (currentTarget instanceof HTMLSelectElement) {
        value = getSelectedValues(currentTarget)
      }

      if (value) {
        // Parse all checked/selected values.
        value = value.map((v) => typeof parser === 'function' ? parser(v) : v)
      }
    } else if (currentTarget instanceof HTMLInputElement && type === 'checkbox') {
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
   * Merging is done in the following order:
   * - Generated props
   * - Initialized props
   * - Passed props
   */
  const getFieldProps = useCallback(<Component extends ElementType> (
    name: string,
    props?: React.ComponentProps<Component>
  ): React.ComponentProps<Component> => {
    const contextValue = getValue<any>(name)
    const inputValue = props?.value

    // Set default props.
    const finalProps: any = {
      id: getFieldId(name, typeof inputValue !== 'undefined' ? inputValue : contextValue),
      name,
      onBlur: handleBlur,
      onChange: handleChange,
      value: contextValue
    }

    // Merge custom props from initializeField() function.
    if (typeof initializeFieldRef.current === 'function') {
      const customProps = initializeFieldRef.current(name, state)
      Object.entries(customProps).forEach(([k, v]) => {
        if (typeof v !== 'undefined') {
          finalProps[k] = v
        }
      })
    }

    // Merge passed props
    if (props) {
      Object.entries(props).forEach(([k, v]) => {
        if (typeof v !== 'undefined' && k !== 'parsedValue') {
          finalProps[k] = v
        }
      })
    }

    // Empty value on radio.
    const { type } = finalProps

    if (type) {
      if (inputValue === null || inputValue === '') {
        if (type === 'radio') {
          // Convert null value for radio only.
          finalProps.value = ''
        }
      }

      if (type === 'checkbox' || type === 'radio') {
        const parsedValue = typeof props?.parsedValue !== 'undefined'
          ? props?.parsedValue
          : inputValue

        if (contextValue instanceof Array) {
          finalProps.checked = contextValue.indexOf(parsedValue) !== -1
          // Remove required attribute on multiple fields.
          finalProps.required = false
        } else {
          // Get checked state from checkbox without value
          // or by comparing checkbox value and context value.
          finalProps.checked = type === 'checkbox' &&
          (inputValue == null || inputValue === '') &&
          typeof contextValue === 'boolean'
            ? contextValue
            : contextValue === parsedValue
        }
      }
    }

    // Set disabled depending on form state or field state.
    finalProps.disabled = formDisabled || props?.disabled

    return finalProps
  }, [formDisabled, getValue, handleBlur, handleChange, state])

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
    if (initialValues && (!state.initialized || reinitialize)) {
      setInitialValues(initialValues)
    }
  }, [setInitialValues, initialValues, state.initialized, reinitialize])

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
    disabled: formDisabled,
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
    setTouchedField,
    setTouchedFields,
    validate,
    validateField,
    validateFields
  }), [state, formDisabled, clear, clearErrors, clearTouchedFields, getFieldProps,
    getInitialValue, getValue, handleBlur, handleChange, handleReset, handleSetValue, handleSubmit,
    setInitialValues, load, removeFields, reset, setError, setErrors, setValue, setValues,
    debouncedSubmit, setTouchedField, setTouchedFields, validate, validateField, validateFields])
}

export default useForm
