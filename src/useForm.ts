/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
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
  getFieldId,
  getFieldValue,
  hasDefinedValues,
  resolve
} from './utils'

export type FieldElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

export interface UseFormHook<V extends Values, E, R> extends FormState<V, E, R> {
  /**
   * Clears the form (values, errors...).
   * @param fields
   */
  clear (fields?: string[]): void;
  /**
   * Clears all or given errors.
   * @param fields
   */
  clearErrors (fields?: string[]): void;
  /**
   * Clears all or given touched fields.
   * @param fields
   */
  clearTouchedFields (fields?: string[]): void;
  /**
   * Returns form button props.
   * @param props
   */
  getButtonProps (props?: React.ComponentProps<'button'>): React.ComponentProps<'button'>;
  /**
   * Returns field props by name.
   * @param name
   * @param props
   * @param opts
   */
  getFieldProps<Component extends ElementType = any> (
    name: string,
    props?: React.ComponentProps<Component>,
    opts?: { parser?: (value: string, target?: HTMLElement) => any }
  ): React.ComponentProps<Component>;
  /**
   * Returns form props.
   * @param props
   */
  getFormProps (props?: React.ComponentProps<'form'>): React.ComponentProps<'form'>;
  /**
   * Returns field's initial value.
   * @param name
   */
  getInitialValue<T> (name: string): T | undefined;
  /**
   * Returns current field value.
   * @param name
   * @param defaultValue
   */
  getValue<T> (name: string, defaultValue?: T): T | undefined;
  /**
   * Handles field blur event.
   * @param event
   */
  handleBlur (event: React.FocusEvent): void;
  /**
   * Handles field change event.
   * @param event
   * @param options
   */
  handleChange (event: React.ChangeEvent, options?: {
    parser? (value: unknown, target?: HTMLElement): any
  }): void;
  /**
   * Handles form reset event.
   * @param event
   */
  handleReset (event: React.FormEvent<HTMLFormElement>): void;
  /**
   * Handles field change event (value based like useState()).
   * @param name
   * @param options
   */
  handleSetValue (name: string, options?: {
    parser?: (value: unknown) => any
  }): (value: unknown | undefined) => void;
  /**
   * Handles form submit event.
   * @param event
   */
  handleSubmit (event: React.FormEvent<HTMLFormElement>): void;
  /**
   * Loads the form initial values.
   */
  load (): void;
  /**
   * Removes given fields.
   * @param fields
   */
  removeFields (fields: string[]): void;
  /**
   * Resets all or given fields.
   * @param fields
   */
  reset (fields?: string[]): void;
  /**
   * Sets a single field error.
   * @param name
   * @param error
   */
  setError (name: string, error?: E): void;
  /**
   * Sets all or partial errors.
   * @param errors
   * @param opts
   */
  setErrors (
    errors: Errors<E>,
    opts?: { partial?: boolean }
  ): void;
  /**
   * Sets initial values.
   * @param values
   */
  setInitialValues (values: Partial<V>): void;
  /**
   * Sets a single touched field.
   * @param name
   * @param touched
   */
  setTouchedField (name: string, touched: boolean | undefined): void;
  /**
   * Sets all partial or partial touched fields.
   * @param fields
   * @param options
   */
  setTouchedFields (
    fields: TouchedFields,
    options?: { partial?: boolean, validate?: boolean }
  ): void;
  /**
   * Sets a single field value.
   * @param name
   * @param value
   * @param options
   */
  setValue (
    name: string,
    value?: unknown,
    options?: { validate?: boolean }
  ): void;
  /**
   * Sets all or partial fields values.
   * @param values
   * @param options
   */
  setValues (
    values: Values | Partial<V> | ((previous: V) => V),
    options?: { partial?: boolean, validate?: boolean }
  ): void;
  /**
   * Calls the onSubmit function with form values.
   */
  submit (): Promise<void | R>;
  /**
   * Calls the validate function with form values.
   * @param opts
   */
  validate (opts?: { submitAfter: boolean }): Promise<void | Errors<E> | undefined>;
  /**
   * Calls the validateField function for a single field value.
   * @param name
   */
  validateField (name: string): Promise<void | E | undefined>;
  /**
   * Calls the validate or validateField function for all or given fields.
   * @param fields
   */
  validateFields (fields?: string[]): Promise<void | Errors<E> | undefined>;
}

export interface UseFormOptions<V extends Values, E, R> {
  /**
   * Tells if form values should be cleared after submit.
   */
  clearAfterSubmit?: boolean;
  /**
   * Should the form be disabled during submit.
   */
  disableOnSubmit?: boolean;
  /**
   * Should the form be disabled during validation.
   */
  disableOnValidate?: boolean;
  /**
   * Enables debugging.
   */
  debug?: boolean;
  /**
   * Disables the form (fields and buttons).
   */
  disabled?: boolean;
  /**
   * Sets the initial values.
   */
  initialValues?: Partial<V>;
  /**
   * Replaces empty string by null on change and on submit.
   */
  nullify?: boolean;
  /**
   * Sets field props dynamically.
   * @param name
   * @param formState
   */
  initializeField?<C extends ElementType> (name: string, formState: FormState<V, E, R>): React.ComponentProps<C> | undefined;
  /**
   * The loading function.
   */
  load? (): Promise<void | V>;
  /**
   * Called when form is submitted.
   * @param values
   */
  onSubmit (values: Partial<V>): Promise<R>;
  /**
   * Called when form has been successfully submitted.
   * @param result
   */
  onSubmitted? (result: R): void;
  /**
   * Resets form with initial values whenever they change.
   */
  reinitialize?: boolean;
  /**
   * The delay before submitting the form.
   */
  submitDelay?: number;
  /**
   * Allows transforming values when form is modified.
   * @param mutation
   * @param values
   */
  transform? (mutation: Values, values: Partial<V>): Partial<V>;
  /**
   * Enables trimming on blur.
   */
  trimOnBlur?: boolean;
  /**
   * Enables trimming on submit.
   */
  trimOnSubmit?: boolean;
  /**
   * Called for form validation.
   * @param values
   * @param modifiedFields
   */
  validate? (
    values: Partial<V>,
    modifiedFields: ModifiedFields
  ): Promise<void | Errors<E> | undefined>;
  /**
   * The delay before starting validation.
   */
  validateDelay?: number;
  /**
   * Called for single field validation.
   * @param name
   * @param value
   * @param values
   */
  validateField? (
    name: string,
    value: unknown,
    values: Partial<V>
  ): Promise<E | undefined>;
  /**
   * Enables validation on field change.
   */
  validateOnChange?: boolean;
  /**
   * Enables validation on form initialization.
   */
  validateOnInit?: boolean;
  /**
   * Enables validation on form submit.
   */
  validateOnSubmit?: boolean;
  /**
   * Enables validation on field touch.
   */
  validateOnTouch?: boolean;
}

/**
 * Manage form state and actions.
 */
function useForm<V extends Values, E = Error, R = any> (options: UseFormOptions<V, E, R>): UseFormHook<V, E, R> {
  const {
    clearAfterSubmit = false,
    debug = false,
    disabled = false,
    disableOnSubmit = true,
    disableOnValidate = true,
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
    validateDelay = 400,
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
      debug,
      initialized: initialValues != null,
      initialValues: initialValues || {},
      loading: typeof loadFunc === 'function',
      values: initialValues || {},
      validateOnChange,
      validateOnInit,
      validateOnSubmit,
      validateOnTouch
    })

  // Holds current state (used to stabilize setter functions).
  const currentState = useRef<FormState<V, E, R>>(state)

  // Check if form is disabled regarding various states.
  const formDisabled = useMemo(() => (
    disabled ||
    // Disables fields if default values are undefined.
    !initialValues ||
    state.loading ||
    (disableOnValidate && state.validating) ||
    (disableOnSubmit && state.submitting)
  ), [disableOnSubmit, disableOnValidate, disabled, initialValues, state.loading, state.submitting, state.validating])

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
    const promises: Promise<[string, E | undefined]>[] = validate
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

        if (hasDefinedValues(errors)) {
          dispatch({
            type: ACTION_VALIDATE_FAIL,
            data: {
              errors: { ...errors },
              partial: true
            }
          })
        } else {
          dispatch({
            type: ACTION_VALIDATE_SUCCESS,
            data: {
              fields,
              submitAfter: false
            }
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
  }, [getValue, state.values])

  const debouncedValidateFields = useDebouncePromise(validateFields, validateDelay)

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

  const debouncedValidateField = useDebouncePromise(validateField, validateDelay)

  /**
   * Defines several field values (use setInitialValues() to set all form values).
   */
  const setValues = useCallback((
    values: Values | Partial<V> | ((previous: Partial<V>) => Partial<V>),
    opts?: {
      partial?: boolean,
      validate?: boolean
    }
  ): void => {
    // Ignore action if form disabled
    if (formDisabled) return

    const currentValues: Partial<V> = { ...currentState.current.values }

    const nextValues: Partial<V> = typeof values === 'function'
      ? { ...values(currentValues) }
      : { ...values }

    // Flatten values to make sure mutation only contains field names as keys
    // and field values as values.
    let mutation = flatten(nextValues)

    if (transformRef.current) {
      // Merge changes with current values.
      let nextValues = currentValues ? clone(currentValues) : {}
      Object.entries(mutation)
        .forEach(([name, value]) => {
          nextValues = build(name, value, nextValues)
        })
      // Apply transformation to changed values.
      mutation = transformRef.current(mutation, nextValues)
    }

    if (nullify) {
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

    // Update current state before dispatching it.
    let nextValuesState = opts?.partial ? currentValues : {}
    Object.entries(mutation).forEach(([name, value]) => {
      nextValuesState = build(name, value, currentValues)
    })
    currentState.current.values = nextValuesState

    dispatch({
      type: ACTION_SET_VALUES,
      data: {
        partial: opts?.partial === true,
        validate: opts?.validate != null ? opts.validate : validateOnChange,
        values: mutation
      }
    })
  }, [formDisabled, nullify, validateOnChange])

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

    dispatch({ type: ACTION_SUBMIT })
    return Promise.resolve(onSubmitRef.current(values))
      .then((result) => {
        dispatch({
          type: ACTION_SUBMIT_SUCCESS,
          data: {
            result,
            clear: clearAfterSubmit
          }
        })
        if (onSubmitted) {
          onSubmitted(result)
        }
        return result
      })
      .catch((error) => {
        dispatch({
          type: ACTION_SUBMIT_ERROR,
          error
        })
      })
  }, [clearAfterSubmit, nullify, onSubmitted, state.values, trimOnSubmit])

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
            data: {
              errors,
              partial: false
            }
          })
        } else {
          const { submitAfter = false } = opts || {}
          dispatch({
            type: ACTION_VALIDATE_SUCCESS,
            data: {
              fields: [],
              submitAfter
            }
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

  const debouncedValidate = useDebouncePromise(validate, validateDelay)

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
  }, [state.validated, submit, validate, validateOnSubmit])

  const debouncedValidateAndSubmit = useDebouncePromise<R>(validateAndSubmit, submitDelay)

  /**
   * Defines initial values (after loading for example).
   */
  const setInitialValues = useCallback((values: Partial<V>): void => {
    dispatch({
      type: ACTION_INIT_VALUES,
      data: { values }
    })
  }, [])

  const handleButtonClick = useCallback((listener: (ev: React.MouseEvent<HTMLButtonElement>) => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const target = event.currentTarget || event.target

    if (listener) {
      listener(event)
    } else if (target.type === 'submit') {
      submit()
    } else if (target.type === 'reset') {
      reset()
    }
  }, [reset, submit])

  /**
   * Handles leaving of a field.
   */
  const handleBlur = useCallback((event: React.FocusEvent<FieldElement>): void => {
    const target = event.currentTarget || event.target
    const { name } = target
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
    opts?: { parser? (value: string, target?: HTMLElement): any }
  ): void => {
    const target = event.currentTarget || event.target
    const { name } = target
    const value = getFieldValue(target, opts)
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

  const handleSetValue = useCallback((
    name: string,
    opts?: { parser?: (value: unknown) => any }
  ) => {
    return (value: unknown | undefined): void => {
      const val = opts?.parser ? opts?.parser(value) : value
      setValue(name, val)
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
   * Returns button props.
   */
  const getButtonProps = useCallback((props: React.ComponentProps<'button'>): React.ComponentProps<'button'> => {
    const type = props?.type || 'button'
    return {
      ...props,
      disabled: formDisabled || props?.disabled ||
        // Disable submit or reset button if form is not modified.
        (!state.modified && (type === 'submit' || type === 'reset')),
      onClick: props?.onClick != null
        ? handleButtonClick(props?.onClick)
        : undefined
    }
  }, [formDisabled, handleButtonClick, state.modified])

  /**
   * Returns props of a field.
   * Merging is done in the following order:
   * - Generated props
   * - Initialized props
   * - Passed props
   */
  const getFieldProps = useCallback(<Component extends ElementType> (
    name: string,
    props?: React.ComponentProps<Component>,
    opts?: { parser?: (value: string, target?: HTMLElement) => any }
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
        const parsedValue = typeof opts?.parser !== 'undefined'
          ? opts.parser(inputValue)
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

  /**
   * Returns form props.
   */
  const getFormProps = useCallback((props: React.ComponentProps<'form'>): React.ComponentProps<'form'> => {
    return {
      ...props,
      onReset: handleReset,
      onSubmit: handleSubmit
    }
  }, [handleReset, handleSubmit])

  // Keep track of mount state.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    currentState.current = state
  }, [state])

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
    getButtonProps,
    getFieldProps,
    getFormProps,
    getInitialValue,
    getValue,
    handleBlur,
    handleChange,
    handleReset,
    handleSetValue,
    handleSubmit,
    load,
    removeFields,
    reset,
    setError,
    setErrors,
    setInitialValues,
    setTouchedField,
    setTouchedFields,
    setValue,
    setValues,
    submit: debouncedValidateAndSubmit,
    validate: debouncedValidate,
    validateField: debouncedValidateField,
    validateFields: debouncedValidateFields
  }), [state, formDisabled, clear, clearErrors, clearTouchedFields, getButtonProps,
    getFieldProps, getFormProps, getInitialValue, getValue, handleBlur, handleChange, handleReset,
    handleSetValue, handleSubmit, setInitialValues, load, removeFields, reset, setError, setErrors,
    setValue, setValues, debouncedValidateAndSubmit, setTouchedField, setTouchedFields,
    debouncedValidate, debouncedValidateField, debouncedValidateFields])
}

export default useForm
