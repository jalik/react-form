/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import React, {
  ComponentProps,
  ElementType,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import useDebouncePromise from './useDebouncePromise'
import useFormReducer, {
  ACTION_REQUEST_VALIDATION,
  ACTION_RESET,
  ACTION_RESET_VALUES,
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
  randomKey,
  reconstruct
} from './utils'
import useFormKeys, { UseFormKeysHook } from './useFormKeys'
import useFormWatch, { UseFormWatchHook } from './useFormWatch'
import useFormErrors, { UseFormErrorsHook } from './useFormErrors'
import useFormStatus, { UseFormStatusHook, UseFormStatusOptions } from './useFormStatus'
import useFormValues, { PathsOrValues, UseFormValuesHook } from './useFormValues'
import useFormLoader from './useFormLoader'
import useFormList, { UseFormListHook } from './useFormList'
import deepExtend from '@jalik/deep-extend'

export type FormMode = 'controlled' | 'experimental_uncontrolled'

export type FieldElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

// @ts-ignore
export type FieldKey<V extends Values> = (keyof V & string) | (string & {})

export type GetButtonProps = {
  disabled?: boolean;
  onClick?: (...args: any) => void;
  type?: 'submit' | 'reset' | 'button';
  [key: string]: any;
}

export type GetButtonPropsReturnType = {
  disabled?: boolean;
  onClick?: (...args: any) => void;
  type?: any;
}

export type UseFormHook<V extends Values, E = Error, R = any> = FormState<V, E, R> & {
  /**
   * Clears the form (values, errors...).
   * @param fields
   * @param options
   */
  clear (fields?: string[], options?: { forceUpdate?: boolean }): void;
  /**
   * Clears all or given errors.
   * @param fields
   */
  clearErrors: UseFormErrorsHook<V, E>['clearErrors'];
  /**
   * Clears all or given touched fields.
   * @param fields
   */
  clearTouchedFields (fields?: string[]): void;
  /**
   * Contains form errors.
   */
  errors: UseFormErrorsHook<V, E>['errorsState'];
  /**
   * Returns form button props.
   * @param props
   */
  getButtonProps (props?: GetButtonProps): GetButtonPropsReturnType;
  /**
   * Returns field error.
   * @param name
   */
  getError: UseFormErrorsHook<V, E>['getError'];
  /**
   * Returns form errors.
   */
  getErrors: UseFormErrorsHook<V, E>['getErrors'];
  /**
   * Returns field props by name.
   * @param name
   * @param props
   * @param opts
   */
  getFieldProps<Component extends ElementType = any> (
    name: string,
    props?: ComponentProps<Component>,
    opts?: {
      mode?: FormMode;
      format?: (value: unknown) => string;
      parser?: (value: string, target?: HTMLElement) => any;
    }
  ): any;
  /**
   * Returns form props.
   * @param props
   */
  getFormProps (props?: ComponentProps<'form'>): ComponentProps<'form'>;
  /**
   * Returns field's initial value.
   * @param name
   */
  getInitialValue<T> (name: string): T | undefined;
  /**
   * Returns initial values.
   */
  getInitialValues (): Partial<V> | undefined;
  /**
   * Returns modified fields.
   */
  getModified: UseFormStatusHook['getModified'];
  /**
   * Returns touched fields.
   */
  getTouched: UseFormStatusHook['getTouched'];
  /**
   * Returns field value.
   * @param name
   * @param defaultValue
   */
  getValue<T> (name: string, defaultValue?: T): T | undefined;
  /**
   * Returns form values.
   */
  getValues (): Partial<V>;
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
   * Returns true if the form has any error.
   */
  hasError: UseFormErrorsHook<V, E>['hasError'];
  /**
   * Returns the key of a field.
   */
  key: UseFormKeysHook['getKey'];
  /**
   * Tells if the form was initialized.
   */
  initialized: boolean;
  /**
   * The initial values.
   */
  initialValues: UseFormValuesHook<V>['initialValuesState'];
  /**
   * Tells if the field or form was modified.
   */
  isModified: UseFormStatusHook['isModified'];
  /**
   * Tells if the field or form was touched.
   */
  isTouched: UseFormStatusHook['isTouched'];
  /**
   * Loads the form initial values.
   */
  load (): void;
  /**
   * The loading error.
   */
  loadError?: Error;
  /**
   * Tells if the form is loading.
   */
  loading: boolean;
  /**
   * The form mode (controlled/uncontrolled).
   */
  mode: FormMode;
  /**
   * Tells if the form was modified.
   */
  modified: UseFormStatusHook['modified']
  /**
   * Contains all modified fields.
   */
  modifiedFields: UseFormStatusHook['modifiedState'];
  /**
   * Removes given fields.
   * @param fields
   * @param options
   */
  removeFields (fields: string[], options?: { forceUpdate?: boolean }): void;
  /**
   * Resets all or given fields.
   * @param fields
   * @param options
   */
  reset (fields?: string[], options?: { forceUpdate?: boolean }): void;
  /**
   * Resets touched state of given fields or all fields.
   */
  resetTouched: UseFormStatusHook['resetTouched'];
  /**
   * Sets a single field error.
   * @param name
   * @param error
   */
  setError: UseFormErrorsHook<V, E>['setError'];
  /**
   * Sets all or partial errors.
   * @param errors
   * @param opts
   */
  setErrors: UseFormErrorsHook<V, E>['setErrors'];
  /**
   * Sets initial values.
   * @param values
   */
  setInitialValues (values: PathsOrValues<V>): void;
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
    options?: {
      forceUpdate?: boolean,
      validate?: boolean
    }
  ): void;
  /**
   * Sets all or partial fields values.
   * @param values
   * @param options
   */
  setValues (
    values: PathsOrValues<V> | ((previous: V) => V),
    options?: {
      forceUpdate?: boolean,
      partial?: boolean,
      validate?: boolean
    }
  ): void;
  /**
   * Calls the onSubmit function with form values.
   */
  submit (): Promise<void | R>;
  /**
   * Tells if the form was modified.
   */
  touched: UseFormStatusHook['touched'];
  /**
   * Contains all touched fields.
   */
  touchedFields: UseFormStatusHook['touchedState'];
  /**
   * Calls the validate function with form values.
   * @param opts
   */
  validate (opts?: { submitAfter: boolean }): Promise<void | Errors<E> | undefined>;
  /**
   * Calls the validateField function for a single field value.
   * @param name
   */
  validateField (name: string): Promise<E | null | undefined>;
  /**
   * Calls the validate or validateField function for all or given fields.
   * @param fields
   */
  validateFields (fields?: string[]): Promise<void | Errors<E> | undefined>;
  /**
   * Form values.
   */
  values: UseFormValuesHook<V>['valuesState'];
} & Pick<UseFormWatchHook<V>,
  'watch' |
  'watchers'>
  & Pick<UseFormListHook,
  'appendListItem' |
  'insertListItem' |
  'moveListItem' |
  'prependListItem' |
  'removeListItem' |
  'replaceListItem' |
  'swapListItem'>

export type UseFormOptions<V extends Values, E, R> = {
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
   * Sets the initial errors.
   */
  initialErrors?: Errors<E>;
  /**
   * Sets the initial modified fields.
   */
  initialModified?: UseFormStatusOptions['initialModified'];
  /**
   * Sets the initial touched fields.
   */
  initialTouched?: UseFormStatusOptions['initialTouched'];
  /**
   * Sets the initial values.
   */
  initialValues?: Partial<V>;
  /**
   * The form mode (controlled/uncontrolled).
   */
  mode?: FormMode;
  /**
   * Replaces empty string by null on change and on submit.
   */
  nullify?: boolean;
  /**
   * Sets field props dynamically.
   * @param name
   * @param formState
   */
  initializeField?<C extends ElementType> (name: string, formState: FormState<V, E, R>): ComponentProps<C> | undefined;
  /**
   * The loading function.
   */
  load? (): Promise<V | undefined>;
  /**
   * Called when form is submitted.
   * @param values
   */
  onSubmit?: (values: Partial<V>) => Promise<R>;
  /**
   * Called when form has been successfully submitted.
   * @param result
   * @param values
   */
  onSubmitted? (result: R, values: Partial<V>): void;
  /**
   * Resets form with initial values whenever they change.
   */
  reinitialize?: boolean;
  /**
   * Use submitted values as initial values after form submission.
   */
  setInitialValuesOnSuccess?: boolean;
  /**
   * The delay before submitting the form.
   */
  submitDelay?: number;
  /**
   * Allows transforming values when form is modified.
   * @param mutation
   * @param values
   */
  transform? (mutation: Record<string, unknown>, values: Partial<V>): Record<string, unknown>;
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
    // todo add tests for disableOnSubmit
    disableOnSubmit = true,
    // todo add tests for disableOnValidate
    disableOnValidate = true,
    initialErrors,
    initialModified,
    initialTouched,
    initialValues,
    initializeField: initializeFieldFunc,
    load: loader,
    mode = 'controlled',
    nullify = false,
    onSubmit,
    onSubmitted,
    // todo add tests for reinitialize
    reinitialize = false,
    // todo add tests for setInitialValuesOnSuccess
    setInitialValuesOnSuccess = false,
    submitDelay = 100,
    transform: transformFunc,
    // todo add tests for trimOnBlur
    trimOnBlur = false,
    trimOnSubmit = false,
    validate: validateFunc,
    validateField: validateFieldFunc,
    validateDelay = 400,
    // todo add tests for validateOnChange
    validateOnChange = false,
    validateOnInit = false,
    validateOnSubmit = true,
    // todo add tests for validateOnTouch
    validateOnTouch = false
  } = options

  useEffect(() => {
    if (mode === 'experimental_uncontrolled') {
      console.warn('WARNING: uncontrolled mode is experimental and may not work as expected')
    }
  }, [mode])

  // Generate a unique ID for the form.
  const [formKey] = useState(randomKey(10))

  // Defines the form state.
  const [state, dispatch] = useReducer(
    useFormReducer<V, E, R>,
    {
      ...initialState as FormState<V, E, R>,
      debug,
      validateOnChange,
      validateOnInit,
      validateOnSubmit,
      validateOnTouch
    })

  // Handle form errors.
  const formErrors = useFormErrors<V, E, R>({
    initialErrors,
    state
  })

  // Handle form keys.
  const formKeys = useFormKeys({
    formKey
  })

  // Handle form status.
  const formStatus = useFormStatus({
    initialModified,
    initialTouched,
    mode
  })

  // Handle form watchers.
  const formWatch = useFormWatch<V>()

  // Handle form values.
  const formValues = useFormValues<V>({
    formKeys,
    formStatus,
    initialValues,
    mode,
    // todo pass onValuesChange from useForm options
    // onValuesChange: replaceKeysFromValues,
    reinitialize,
    watchers: formWatch.watchers
  })

  // Handle form lists.
  const formList = useFormList<V, E>({
    formErrors,
    formStatus,
    formValues
  })

  // Handle form loading.
  const formLoader = useFormLoader<V>({
    loader,
    onSuccess (result) {
      setInitialValues(result ?? {}, { forceUpdate: true })
    }
  })

  const {
    clearErrors,
    errorsState,
    getError,
    getErrors,
    hasError,
    setError,
    setErrors
  } = formErrors

  const {
    getKey
  } = formKeys

  const {
    load,
    loading,
    loadError
  } = formLoader

  const {
    clearModified,
    clearTouched,
    getModified,
    getTouched,
    isModified,
    isTouched,
    modified,
    modifiedRef,
    modifiedState,
    resetModified,
    resetTouched,
    setTouchedField,
    setTouched,
    touched,
    touchedRef,
    touchedState
  } = formStatus

  const {
    clearValues,
    getInitialValues,
    initializedRef,
    initialValuesState,
    getInitialValue,
    getValue,
    getValues,
    removeValues,
    resetValues,
    setInitialValues,
    setValues,
    valuesRef,
    valuesState
  } = formValues

  // Defines function references.
  const initializeFieldRef = useRef(initializeFieldFunc)
  const onSubmitRef = useRef(onSubmit)
  const transformRef = useRef(transformFunc)
  const validateFieldRef = useRef(validateFieldFunc)
  const validateRef = useRef(validateFunc)

  // Holds current state (used to stabilize setter functions).
  const currentState = useRef<FormState<V, E, R>>(state)

  // Check if form is disabled regarding various states.
  const formDisabled = useMemo(() => (
    disabled ||
    // Disables fields if default values are undefined.
    !initialValues ||
    loading ||
    (disableOnValidate && state.validating) ||
    (disableOnSubmit && state.submitting)
  ), [disableOnSubmit, disableOnValidate, disabled, initialValues, loading, state.submitting, state.validating])

  /**
   * Clears all values or selected fields only.
   */
  const clear = useCallback<UseFormHook<V, E, R>['clear']>((fields, opts) => {
    const { forceUpdate = true } = opts ?? {}
    clearValues(fields, { forceUpdate })
    clearErrors(fields)
    clearModified(fields, { forceUpdate })
    clearTouched(fields, { forceUpdate })
  }, [clearErrors, clearModified, clearTouched, clearValues])

  /**
   * Removes fields definitely (also removes errors, modified/touched states...).
   */
  const removeFields = useCallback<UseFormHook<V, E, R>['removeFields']>((fields, opts) => {
    const { forceUpdate } = opts ?? {}
    removeValues(fields, { forceUpdate })
    clearErrors(fields)
    clearModified(fields, { forceUpdate })
    clearTouched(fields, { forceUpdate })
  }, [clearErrors, clearModified, clearTouched, removeValues])

  const requestValidation = useCallback((validation: boolean | string[]): void => {
    dispatch({
      type: ACTION_REQUEST_VALIDATION,
      data: validation
    })
  }, [])

  /**
   * Validates one or more fields by passing field names.
   */
  const validateFields = useCallback((fields: string[]) => {
    dispatch({
      type: ACTION_VALIDATE,
      data: { fields }
    })

    const validate = validateFieldRef.current
    const promises: Promise<[string, E | undefined]>[] = validate
      ? fields.map((name: string) => {
        return Promise.resolve(validate(name, getValue(name), getValues()))
          .then((error) => [name, error])
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
          dispatch({ type: ACTION_VALIDATE_FAIL })
          setErrors(validationErrors, { partial: false })
        } else {
          dispatch({ type: ACTION_VALIDATE_SUCCESS })
          clearErrors()
        }
        return validationErrors
      })
      .catch((error) => {
        dispatch({
          type: ACTION_VALIDATE_ERROR,
          error
        })
      })
  }, [clearErrors, errorsState, getValue, getValues, setErrors])

  const debouncedValidateFields = useDebouncePromise(validateFields, validateDelay)

  /**
   * Validates a field value.
   */
  const validateField = useCallback((name: FieldKey<V>) => (
    validateFields([name])
      .then((errors) => {
        const err: Errors<E> = { ...errors }
        return err[name]
      })
  ), [validateFields])

  const debouncedValidateField = useDebouncePromise(validateField, validateDelay)

  /**
   * Defines several field values (use setInitialValues() to set all form values).
   */
  const setFormValues = useCallback<UseFormHook<V, E, R>['setValues']>((
    values,
    opts = {}
  ) => {
    // Ignore action if form disabled
    if (formDisabled) return

    const {
      forceUpdate = false,
      partial = false,
      validate = false
    } = opts ?? {}

    const fieldErrors: Errors<E> = {}

    const currentValues = clone(valuesRef.current)

    let nextValues: PathsOrValues<V> = typeof values === 'function'
      ? { ...values(currentValues as any) }
      : { ...values }

    // Flatten values to make sure mutation only contains field names as keys
    // and field values as values.
    let mutation = flatten(nextValues, null, true)

    Object.entries(mutation).forEach(([path, value]) => {
      let nextValue = value

      // Replace empty string with null.
      if (nullify && value === '') {
        nextValue = null
        mutation[path] = nextValue
      }
      nextValues = build(path, nextValue, nextValues)

      // Clear errors when validation is not triggered after.
      if (!validate) {
        fieldErrors[path] = undefined
      }
    })

    // Apply transformation to values.
    // todo move to useFormValues().setValues()
    if (transformRef.current) {
      mutation = transformRef.current(mutation, reconstruct(deepExtend(currentValues, nextValues)) ?? {})

      // Update next values from mutation.
      Object.entries(mutation).forEach(([path, value]) => {
        nextValues = build(path, value, nextValues)
      })
    }

    setValues(mutation, {
      partial,
      forceUpdate
    })

    // Clear errors when validation is not triggered after.
    if (!validate && hasDefinedValues(fieldErrors)) {
      setErrors(fieldErrors, { partial: true })
    }

    if (mode === 'controlled') {
      dispatch({
        type: ACTION_SET_VALUES,
        data: {
          partial: partial === true,
          validate: validate ?? validateOnChange,
          values: mutation
        }
      })
    }

    if (validate) {
      requestValidation(partial
        ? Object.keys(mutation)
        : true)
    }
  }, [formDisabled, mode, nullify, requestValidation, setErrors, setValues, validateOnChange, valuesRef])

  /**
   * Defines the value of a field.
   */
  const setFormValue = useCallback<UseFormHook<V, E, R>['setValue']>((
    name: string,
    value?: unknown,
    opts?: {
      forceUpdate?: boolean,
      validate?: boolean
    }
  ): void => {
    setFormValues({ [name]: value }, {
      forceUpdate: opts?.forceUpdate,
      partial: true,
      validate: opts?.validate
    })
  }, [setFormValues])

  /**
   * Resets form values.
   */
  const reset = useCallback<UseFormHook<V, E, R>['reset']>((fields, opts) => {
    const { forceUpdate = true } = opts ?? {}

    if (fields) {
      dispatch({
        type: ACTION_RESET_VALUES,
        data: { fields }
      })
    } else {
      dispatch({ type: ACTION_RESET })
    }

    resetValues(fields, { forceUpdate })
    clearErrors(fields)
    resetModified(fields, { forceUpdate })
    resetTouched(fields, { forceUpdate })
  }, [clearErrors, resetModified, resetTouched, resetValues])

  /**
   * Submits form.
   */
  const submit = useCallback((): Promise<void | R> => {
    if (onSubmitRef.current == null) {
      return Promise.reject(new Error('onSubmit not defined'))
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

    dispatch({ type: ACTION_SUBMIT })
    return Promise.resolve(onSubmitRef.current(values))
      .then((result) => {
        dispatch({
          type: ACTION_SUBMIT_SUCCESS,
          data: {
            result,
            clear: clearAfterSubmit,
            setInitialValuesOnSuccess
          }
        })

        if (setInitialValuesOnSuccess) {
          setInitialValues(values)
        } else if (clearAfterSubmit) {
          clearValues(undefined, { forceUpdate: true })
        }
        clearErrors()
        clearModified(undefined, { forceUpdate: true })
        clearTouched(undefined, { forceUpdate: true })

        if (onSubmitted) {
          onSubmitted(result, values)
        }
        return result
      })
      .catch((error) => {
        dispatch({
          type: ACTION_SUBMIT_ERROR,
          error
        })
      })
  }, [clearAfterSubmit, clearErrors, clearModified, clearTouched, clearValues, getValues, nullify, onSubmitted, setInitialValues, setInitialValuesOnSuccess, trimOnSubmit])

  /**
   * Validates form values.
   */
  const validate = useCallback((): Promise<void | Errors<E> | undefined> => {
    if (typeof validateRef.current !== 'function') {
      // Validate touched and modified fields only,
      // since we don't have a global validation function.
      return validateFields(Object.keys({
        ...modifiedRef.current,
        ...touchedRef.current
      }))
    }

    dispatch({ type: ACTION_VALIDATE })

    return Promise.resolve(
      validateRef.current(clone(getValues()), { ...modifiedRef.current })
    )
      .then((validationErrors) => {
        if (validationErrors && hasDefinedValues(validationErrors)) {
          dispatch({ type: ACTION_VALIDATE_FAIL })
          setErrors(validationErrors, { partial: false })
        } else {
          dispatch({ type: ACTION_VALIDATE_SUCCESS })
          clearErrors()
        }
        return validationErrors
      })
      .catch((error) => {
        dispatch({
          type: ACTION_VALIDATE_ERROR,
          error
        })
        return error
      })
  }, [clearErrors, getValues, modifiedRef, setErrors, touchedRef, validateFields])

  const debouncedValidate = useDebouncePromise(validate, validateDelay)

  /**
   * Validates if necessary and submits form.
   */
  const validateAndSubmit = useCallback(async (): Promise<R | void | undefined> => {
    if (!validateOnSubmit) {
      return submit()
    }
    if (state.validated) {
      return submit()
    }
    const errors = await validate()

    if (!errors || !hasDefinedValues(errors)) {
      return submit()
    }
    return Promise.resolve(undefined)
  }, [state.validated, submit, validate, validateOnSubmit])

  const debouncedValidateAndSubmit = useDebouncePromise(validateAndSubmit, submitDelay)

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
    const target = event.currentTarget ?? event.target
    const { name } = target

    if (trimOnBlur) {
      let value = getValue(name)

      if (typeof value === 'string') {
        // Remove extra spaces.
        value = value.trim()
        setFormValue(name, value, { validate: state.validateOnTouch })
        return
      }
    }
    setTouchedField(name, true)
  }, [getValue, setTouchedField, setFormValue, state.validateOnTouch, trimOnBlur])

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
    setFormValue(name, value /* fixme { validate: validateOnChange } */)
  }, [setFormValue])

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
      setFormValue(name, val)
    }
  }, [setFormValue])

  /**
   * Handles form submit.
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    if (onSubmitRef.current != null) {
      event.preventDefault()
      event.stopPropagation()
      validateAndSubmit()
    }
  }, [validateAndSubmit])

  /**
   * Returns button props.
   */
  const getButtonProps = useCallback((props: GetButtonProps = {}): GetButtonPropsReturnType => {
    const type = props.type ?? 'button'
    const result: GetButtonPropsReturnType = { disabled: false, ...props }

    if (props.disabled ||
      formDisabled ||
      // Disable submit or reset button if form is not modified.
      // todo test without mode === 'controlled'
      ((!modified && mode === 'controlled') && (type === 'submit' || type === 'reset'))) {
      result.disabled = true
    }

    if (props.onClick != null) {
      result.onClick = handleButtonClick(props.onClick)
    } else if (type === 'submit') {
      result.onClick = () => {
        validateAndSubmit()
      }
    } else if (type === 'reset') {
      result.onClick = () => {
        reset()
      }
    }
    return result
  }, [formDisabled, handleButtonClick, mode, reset, modified, validateAndSubmit])

  /**
   * Returns props of a field.
   * Merging is done in the following order:
   * - Generated props
   * - Initialized props
   * - Passed props
   */
  const getFieldProps = useCallback(<Component extends ElementType> (
    name: string,
    props?: ComponentProps<Component>,
    opts: {
      mode?: FormMode;
      format?: (value: unknown) => string;
      parser?: (value: string, target?: HTMLElement) => any;
    } = {}
  ) => {
    const contextValue = getValue(name)
    const inputValue = props?.value

    const checkedAttribute = (opts.mode ?? mode) === 'controlled'
      ? 'checked'
      : 'defaultChecked'

    const valueAttribute = (opts.mode ?? mode) === 'controlled'
      ? 'value'
      : 'defaultValue'

    // Set default props.
    const finalProps: any = {
      ...props,
      id: getFieldId(name, formKey),
      name,
      onBlur: handleBlur,
      onChange: (event: React.ChangeEvent<FieldElement>) => {
        handleChange(event, opts)
      }
    }

    if (props?.type !== 'checkbox' && props?.type !== 'radio') {
      finalProps[valueAttribute] = contextValue
    }

    // Merge custom props from initializeField() function.
    // todo pass errors + modified + touched to state
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
          finalProps[valueAttribute] = ''
        }
      }

      if (type === 'checkbox' || type === 'radio') {
        const parsedValue = typeof opts.parser !== 'undefined'
          ? opts.parser(inputValue)
          : inputValue

        if (contextValue instanceof Array) {
          finalProps[checkedAttribute] = contextValue.indexOf(parsedValue) !== -1
          // Remove required attribute on multiple fields.
          finalProps.required = false
        } else {
          // Get checked state from checkbox without value
          // or by comparing checkbox value and context value.
          finalProps[checkedAttribute] = type === 'checkbox' &&
          (inputValue == null || inputValue === '') &&
          typeof contextValue === 'boolean'
            ? contextValue
            : contextValue === parsedValue
        }
      }
    }

    // Set disabled depending on form state or field state.
    finalProps.disabled = formDisabled || props?.disabled

    // For controlled components, replace null by empty string.
    if ((opts.mode ?? mode) === 'controlled' && finalProps.value == null) {
      finalProps.value = ''
    }

    // Convert value to string.
    const { format = String } = opts
    if (format != null && typeof finalProps[valueAttribute] !== 'string' &&
      !(finalProps[valueAttribute] instanceof Array)) {
      finalProps[valueAttribute] = finalProps[valueAttribute] != null
        ? format(finalProps[valueAttribute])
        : ''
    }

    return finalProps
  }, [formDisabled, formKey, getValue, handleBlur, handleChange, mode, state])

  /**
   * Returns form props.
   */
  const getFormProps = useCallback((props: ComponentProps<'form'>): ComponentProps<'form'> => {
    return {
      ...props,
      onReset: handleReset,
      onSubmit: handleSubmit
    }
  }, [handleReset, handleSubmit])

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
    if (state.needValidation === true) {
      validate()
    } else if (state.needValidation instanceof Array && state.needValidation.length > 0) {
      debouncedValidateFields(state.needValidation)
    }
  }, [debouncedValidateFields, state.needValidation, validate])

  // todo CUSTOM SET TOUCHED FIELDS
  // Trigger validation if needed
  // const needValidation = data.validate
  //   ? Object.entries(data.touchedFields).filter(([, v]) => v).map(([k]) => k)
  //   : state.needValidation

  return {
    ...state,

    // errors
    clearErrors,
    errors: errorsState,
    getError,
    getErrors,
    hasError,
    // todo return resetErrors()
    setError,
    setErrors,

    // events
    watch: formWatch.watch,
    watchers: formWatch.watchers,

    // lists
    appendListItem: formList.appendListItem,
    insertListItem: formList.insertListItem,
    moveListItem: formList.moveListItem,
    prependListItem: formList.prependListItem,
    removeListItem: formList.removeListItem,
    replaceListItem: formList.replaceListItem,
    swapListItem: formList.swapListItem,

    // loading
    load,
    loading,
    loadError,

    // props
    getButtonProps,
    getFieldProps,
    getFormProps,

    // status
    clearTouchedFields: clearTouched,
    getModified,
    getTouched,
    isModified,
    isTouched,
    modified,
    modifiedFields: modifiedState,
    resetTouched,
    setTouchedField,
    setTouchedFields: setTouched,
    touched,
    touchedFields: touchedState,

    // values
    getInitialValue,
    getInitialValues,
    getValue,
    getValues,
    initialized: initializedRef.current,
    initialValues: initialValuesState,
    removeFields,
    setInitialValues,
    setValue: setFormValue,
    setValues: setFormValues,
    values: valuesState,

    // global
    clear,
    disabled: formDisabled,
    handleBlur,
    handleChange,
    handleReset,
    handleSetValue,
    handleSubmit,
    key: getKey,
    mode,
    reset,
    submit: debouncedValidateAndSubmit,
    validate: debouncedValidate,
    validateField: debouncedValidateField,
    validateFields: debouncedValidateFields
  }
}

export default useForm
