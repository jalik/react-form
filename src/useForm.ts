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
  useRef,
  useState
} from 'react'
import useDebouncePromise, { DebouncedFunction } from './useDebouncePromise'
import useFormState, {
  Errors,
  FieldPath,
  FormMode,
  FormState,
  ModifiedState,
  PathsOrValues,
  Values
} from './useFormState'
import { getFieldId, getFieldValue, hasDefinedValues, randomKey } from './utils'
import useFormKeys, { UseFormKeysHook } from './useFormKeys'
import useFormWatch, { UseFormWatchHook } from './useFormWatch'
import useFormErrors, { UseFormErrorsHook } from './useFormErrors'
import useFormStatus, { UseFormStatusHook } from './useFormStatus'
import useFormValues, {
  SetValuesOptions,
  UseFormValuesHook,
  UseFormValuesOptions
} from './useFormValues'
import useFormLoader, { UseFormLoaderHook, UseFormLoaderOptions } from './useFormLoader'
import useFormList, { UseFormListHook } from './useFormList'
import useFormValidation, { UseFormValidationHook } from './useFormValidation'
import useFormSubmission, { AfterSubmitOption } from './useFormSubmission'

export type FieldElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

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

export type InitializeFieldFunction<V extends Values, E> = <C extends ElementType> (path: FieldPath<V>, formState: FormState<V, E, unknown>) => ComponentProps<C> | undefined

/**
 * A function that converts a value to a string.
 */
export type FormatFunction = (value: unknown) => string

/**
 * A function that converts a string to a value.
 */
export type ParseFunction<T = any> = (value: string, target?: HTMLElement) => T

export type UseFormHook<V extends Values, E = Error, R = any> = FormState<V, E, R> & {
  /**
   * Clears the form (values, errors...).
   */
  clear: UseFormValuesHook<V>['clearValues'];
  /**
   * Clears all or given errors.
   */
  clearErrors: UseFormErrorsHook<V, E>['clearErrors'];
  /**
   * Clears all or given touched fields.
   */
  clearTouchedFields: UseFormStatusHook<V>['clearTouched'];
  /**
   * Performs an update of the form state (uncontrolled mode).
   */
  forceUpdate (): void;
  /**
   * Returns form button props.
   * @param props
   */
  getButtonProps (props?: GetButtonProps): GetButtonPropsReturnType;
  /**
   * Returns field error.
   */
  getError: UseFormErrorsHook<V, E>['getError'];
  /**
   * Returns form errors.
   */
  getErrors: UseFormErrorsHook<V, E>['getErrors'];
  /**
   * Returns field props by name.
   * @param path
   * @param props
   * @param opts
   */
  getFieldProps<Component extends ElementType = any> (
    path: FieldPath<V>,
    props?: ComponentProps<Component>,
    opts?: {
      format?: FormatFunction | null | false;
      parse?: ParseFunction;
      setValueOptions?: Partial<SetValuesOptions>;
    }
  ): any;
  /**
   * Returns form props.
   * @param props
   */
  getFormProps (props?: ComponentProps<'form'>): ComponentProps<'form'>;
  /**
   * Returns field's initial error.
   */
  getInitialError: UseFormErrorsHook<V, E>['getInitialError'];
  /**
   * Returns initial errors.
   */
  getInitialErrors: UseFormErrorsHook<V, E>['getInitialErrors'];
  /**
   * Returns field's initial value.
   */
  getInitialValue: UseFormValuesHook<V>['getInitialValue'];
  /**
   * Returns initial values.
   */
  getInitialValues: UseFormValuesHook<V>['getInitialValues'];
  /**
   * Returns modified fields.
   */
  getModified: UseFormStatusHook<V>['getModified'];
  /**
   * Returns touched fields.
   */
  getTouched: UseFormStatusHook<V>['getTouched'];
  /**
   * Returns field value.
   */
  getValue: UseFormValuesHook<V>['getValue'];
  /**
   * Returns form values.
   */
  getValues: UseFormValuesHook<V>['getValues'];
  /**
   * Handles field blur event.
   * @param path
   */
  handleFieldBlur (path: FieldPath<V>): (event: React.FocusEvent<FieldElement> | unknown) => void;
  /**
   * Handles field change automatically by detecting if a value or an event is returned.
   * @param path
   * @param options
   */
  handleFieldChange (
    path: FieldPath<V>,
    options?: {
      parse?: ParseFunction;
      setValueOptions?: Partial<SetValuesOptions>;
    }
  ): (valueOrEvent: React.ChangeEvent<FieldElement> | unknown) => void;
  /**
   * Handles form reset event.
   * @param event
   */
  handleReset (event: React.FormEvent<HTMLFormElement>): void;
  /**
   * Handles field change event (value based like useState()).
   * @param path
   * @param options
   */
  handleSetValue (
    path: FieldPath<V>,
    options?: {
      parse?: ParseFunction;
      setValueOptions?: Partial<SetValuesOptions>;
    }
  ): (value: unknown | undefined) => void;
  /**
   * Handles form submit event.
   * @param event
   */
  handleSubmit (event: React.FormEvent<HTMLFormElement>): void;
  /**
   * The generated form id.
   */
  id: string;
  /**
   * Initializes form with values.
   */
  initialize: UseFormValuesHook<V>['initialize'];
  /**
   * Tells if the field or form was modified.
   */
  isModified: UseFormStatusHook<V>['isModified'];
  /**
   * Tells if the field or form was touched.
   */
  isTouched: UseFormStatusHook<V>['isTouched'];
  /**
   * Returns the key of a field.
   */
  key: UseFormKeysHook<V>['getKey'];
  /**
   * Loads the form initial values.
   */
  load: UseFormLoaderHook['load'];
  /**
   * The form mode (controlled/uncontrolled).
   */
  mode: FormMode;
  /**
   * Removes given fields.
   */
  removeFields: UseFormValuesHook<V>['removeValues'];
  /**
   * Resets all or given fields.
   */
  reset: UseFormValuesHook<V>['resetValues'];
  /**
   * Resets all errors or for given paths.
   */
  resetErrors: UseFormErrorsHook<V, E>['resetErrors'];
  /**
   * Resets touched state of given fields or all fields.
   */
  resetTouched: UseFormStatusHook<V>['resetTouched'];
  /**
   * Sets a single field error.
   */
  setError: UseFormErrorsHook<V, E>['setError'];
  /**
   * Sets all or partial errors.
   */
  setErrors: UseFormErrorsHook<V, E>['setErrors'];
  /**
   * Sets initial values.
   */
  setInitialValues: UseFormValuesHook<V>['setInitialValues'];
  /**
   * Sets all partial or partial touched fields.
   */
  setTouched: UseFormStatusHook<V>['setTouched'];
  /**
   * Sets a single touched field.
   */
  setTouchedField: UseFormStatusHook<V>['setTouchedField'];
  /**
   * Sets a single field value.
   */
  setValue: UseFormValuesHook<V>['setValue'];
  /**
   * Sets all or partial fields values.
   * @param values
   * @param options
   */
  setValues (
    values: PathsOrValues<V>,
    options?: SetValuesOptions
  ): void;
  /**
   * Calls the onSubmit function with form values.
   */
  submit: DebouncedFunction<R | undefined>;
  /**
   * Calls the validate function with form values.
   */
  validate: UseFormValidationHook<V, E, R>['validate'];
  /**
   * Calls the validateField function for a single field value.
   */
  validateField: UseFormValidationHook<V, E, R>['validateField'];
  /**
   * Calls the validate or validateField function for all or given fields.
   */
  validateFields: UseFormValidationHook<V, E, R>['validateFields'];
  /**
   * Enables validation on field change.
   */
  validateOnChange: boolean;
  /**
   * Enables validation on form initialization.
   */
  validateOnInit: boolean;
  /**
   * Enables validation on form submit.
   */
  validateOnSubmit: boolean;
  /**
   * Enables validation on field touch.
   */
  validateOnTouch: boolean;
} & Pick<UseFormWatchHook<V>,
  'watch' |
  'watchers'>
  & Pick<UseFormListHook<V>,
  'appendListItem' |
  'insertListItem' |
  'moveListItem' |
  'prependListItem' |
  'removeListItem' |
  'replaceListItem' |
  'swapListItem'>

export type UseFormOptions<V extends Values, E, R> = {
  /**
   * Tells what to do with values after submit.
   */
  afterSubmit?: AfterSubmitOption;
  /**
   * Enables debugging.
   */
  debug?: boolean;
  /**
   * Should the form be disabled during submit.
   */
  disableOnSubmit?: boolean;
  /**
   * Should the form be disabled during validation.
   */
  disableOnValidate?: boolean;
  /**
   * Disable submit button if form is not modified.
   */
  disableSubmitIfNotModified?: boolean;
  /**
   * Disable submit button if form is not valid.
   */
  disableSubmitIfNotValid?: boolean;
  /**
   * Disables the form (fields and buttons).
   */
  disabled?: boolean;
  /**
   * Enable HTML validation when submit event is triggered.
   */
  enableHTMLValidation?: boolean;
  /**
   * Update the form when it is modified or touched (happens only at the form level).
   */
  forceUpdateOnStatusChange?: boolean;
  /**
   * Sets the initial errors.
   */
  initialErrors?: Errors<E>;
  /**
   * Sets the initial modified fields.
   */
  initialModified?: FormState<V, E, R>['initialModified'];
  /**
   * Sets the initial touched fields.
   */
  initialTouched?: FormState<V, E, R>['initialTouched'];
  /**
   * Sets the initial values.
   */
  initialValues?: Partial<V>;
  /**
   * Sets field props dynamically.
   * @param path
   * @param formState
   */
  initializeField?: InitializeFieldFunction<V, E>;
  /**
   * The loading function.
   */
  load?: UseFormLoaderOptions<V, E, R>['onLoad'];
  /**
   * The form mode (controlled/uncontrolled).
   */
  mode?: FormMode;
  /**
   * Replaces empty string by null on change and on submit.
   */
  nullify?: boolean;
  /**
   * Called when the form submission has failed.
   * @param error
   */
  onError? (error: Error): void;
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
  onSuccess? (result: R, values: Partial<V>): void;
  /**
   * Called when form values have changed.
   * @param values
   * @param previousValues
   */
  onValuesChange? (values: Partial<V>, previousValues: Partial<V>): void;
  /**
   * Prevents native action when form is submitted.
   */
  preventDefaultOnSubmit?: boolean;
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
  transform?: UseFormValuesOptions<V, E, R>['transform'];
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
    modifiedFields: ModifiedState
  ): Promise<Errors<E> | undefined>;
  /**
   * The delay before starting validation.
   */
  validateDelay?: number;
  /**
   * Called for single field validation.
   * @param path
   * @param value
   * @param values
   */
  validateField? (
    path: FieldPath<V>,
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
    afterSubmit,
    debug = false,
    disabled = false,
    // todo add tests for disableOnSubmit
    disableOnSubmit = true,
    // todo add tests for disableOnValidate
    disableOnValidate = true,
    disableSubmitIfNotModified = false,
    disableSubmitIfNotValid = false,
    enableHTMLValidation = false,
    forceUpdateOnStatusChange = false,
    initialErrors,
    initialModified,
    initialTouched,
    initialValues,
    initializeField: initializeFieldFunc,
    load: onLoad,
    mode = 'controlled',
    nullify = false,
    onError,
    onSubmit,
    onSuccess,
    onValuesChange,
    preventDefaultOnSubmit = true,
    // todo add tests for reinitialize
    reinitialize = false,
    submitDelay = 100,
    transform,
    // todo add tests for trimOnBlur
    trimOnBlur = false,
    // todo add tests for trimOnSubmit
    trimOnSubmit = false,
    validate: validateFunc,
    validateField: validateFieldFunc,
    validateDelay = 400,
    // todo add tests for validateOnChange
    validateOnChange = false,
    validateOnInit = false,
    // todo add tests for validateOnSubmit
    validateOnSubmit = true,
    // todo add tests for validateOnTouch
    validateOnTouch = false
  } = options

  useEffect(() => {
    if (validateFieldFunc == null) {
      if (validateOnChange) {
        // eslint-disable-next-line no-console
        console.error('validateField function must be provided when validateOnChange is true')
      }
      if (validateOnTouch) {
        // eslint-disable-next-line no-console
        console.error('validateField function must be provided when validateOnTouch is true')
      }
    }
  }, [validateFieldFunc, validateOnChange, validateOnTouch])

  // Generate a unique ID for the form.
  const [formKey] = useState(() => randomKey(10))

  const formState = useFormState<V, E, R>({
    debug,
    initialState: {
      errors: initialErrors,
      initialErrors,
      initialModified,
      initialTouched,
      initialValues
    }
  })
  const {
    initializedRef,
    state
  } = formState

  // Handle form errors.
  const formErrors = useFormErrors<V, E, R>({
    formState,
    mode
  })

  // Handle form keys.
  const formKeys = useFormKeys({
    formKey
  })

  // Handle form status.
  const formStatus = useFormStatus({
    forceUpdateOnStatusChange,
    formState,
    mode
  })

  // Handle form watchers.
  const formWatch = useFormWatch<V>()

  // Handle form values.
  const formValues = useFormValues<V, E, R>({
    forceUpdateOnStatusChange,
    formErrors,
    formKeys,
    formState,
    formStatus,
    mode,
    nullify,
    onValuesChange,
    reinitialize,
    transform,
    watchers: formWatch.watchers
  })

  // Handle form validation
  const formValidation = useFormValidation<V, E, R>({
    formErrors,
    formState,
    formStatus,
    formValues,
    validate: validateFunc,
    validateField: validateFieldFunc,
    validateDelay
  })

  // Handle form lists.
  const formList = useFormList<V, E, R>({
    formErrors,
    formState,
    formStatus,
    formValues
  })

  // Handle form loading.
  const formLoader = useFormLoader<V, E, R>({
    formState,
    onLoad
  })

  // Handle form submission.
  const formSubmission = useFormSubmission<V, E, R>({
    afterSubmit,
    formErrors,
    formState,
    formStatus,
    formValues,
    nullify,
    onError,
    onSuccess,
    submit: onSubmit,
    trimOnSubmit
  })

  const {
    getKey,
    replaceKeys
  } = formKeys

  const {
    setTouchedField
  } = formStatus

  const {
    submit,
    submitRef
  } = formSubmission

  const {
    setNeedValidation,
    validate
  } = formValidation

  const {
    getValue,
    initialize,
    resetValues,
    setValue,
    setValues
  } = formValues

  // Defines function references.
  const initializeFieldRef = useRef(initializeFieldFunc)

  // Check if form is disabled regarding various states.
  const formDisabled = useMemo(() => (
    disabled ||
    // Disables fields if default values are undefined.
    !initialValues ||
    state.loading ||
    (disableOnValidate && state.validating) ||
    (disableOnSubmit && state.submitting)
  ), [disableOnSubmit, disableOnValidate, disabled, initialValues, state.loading, state.submitting, state.validating])

  const forceUpdate = useCallback<UseFormHook<V, E, R>['forceUpdate']>(() => {
    replaceKeys()
  }, [replaceKeys])

  const setFormValues = useCallback<UseFormHook<V, E, R>['setValues']>((
    values,
    opts
  ) => {
    const {
      forceUpdate = false,
      partial = false,
      validate = false
    } = opts ?? {}

    setValues(values, {
      forceUpdate,
      nullify: opts?.nullify ?? nullify,
      partial,
      validate
    })
  }, [nullify, setValues])

  const validateAndSubmit = useCallback(async (): Promise<R | undefined> => {
    // Submit without validation if:
    // - validation is disabled
    // - form is already validated
    // - there is no validation function
    if (!validateOnSubmit || state.validated || (validateFunc == null && validateFieldFunc == null)) {
      return submit()
    }
    const errors = await validate()

    if (!errors || !hasDefinedValues(errors)) {
      return submit()
    }
    return Promise.resolve(undefined)
  }, [state.validated, submit, validate, validateFieldFunc, validateFunc, validateOnSubmit])

  const debouncedValidateAndSubmit =
    useDebouncePromise(validateAndSubmit, submitDelay)

  const handleFieldBlur = useCallback<UseFormHook<V, E, R>['handleFieldBlur']>((path) => () => {
    setTouchedField(path, true, {
      forceUpdate: forceUpdateOnStatusChange
    })

    if (validateOnTouch) {
      setNeedValidation([path])
    }

    if (trimOnBlur) {
      let value = getValue(path)

      if (typeof value === 'string') {
        // Remove extra spaces.
        value = value.trim()
        setValue(path, value, { validate: validateOnTouch })
      }
    }
  }, [forceUpdateOnStatusChange, getValue, setNeedValidation, setTouchedField, setValue, trimOnBlur, validateOnTouch])

  const handleReset = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    resetValues(undefined, { forceUpdate: true })
  }, [resetValues])

  const handleSetValue = useCallback<UseFormHook<V, E, R>['handleSetValue']>((path, opts) => {
    const {
      parse,
      setValueOptions
    } = opts ?? {}

    return (value) => {
      let parsedValue = value

      if (typeof parse === 'function') {
        if (value instanceof Array) {
          parsedValue = value.map((el) => typeof el === 'string' ? parse(el) : el)
        } else if (typeof value === 'string') {
          parsedValue = parse(value)
        }
      }

      setValue(path, parsedValue, {
        validate: validateOnChange,
        ...setValueOptions
      })
    }
  }, [setValue, validateOnChange])

  const handleFieldChange = useCallback<UseFormHook<V, E, R>['handleFieldChange']>((path, opts) => {
    return (valueOrEvent: React.ChangeEvent<FieldElement> | unknown) => {
      if (typeof valueOrEvent === 'object' && valueOrEvent != null && 'nativeEvent' in valueOrEvent) {
        const target =
          (valueOrEvent as React.ChangeEvent<FieldElement>).currentTarget ??
          (valueOrEvent as React.ChangeEvent<FieldElement>).target

        // Get parsed value from field.
        const parsedValue = getFieldValue(target, opts)

        setValue(path, parsedValue, {
          validate: validateOnChange,
          ...opts
        })
      } else {
        handleSetValue(path, opts)(valueOrEvent)
      }
    }
  }, [handleSetValue, setValue, validateOnChange])

  /**
   * Handles form submit.
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    if (submitRef.current != null) {
      if (preventDefaultOnSubmit) {
        event.preventDefault()
        event.stopPropagation()
      }
      debouncedValidateAndSubmit()
    }
  }, [debouncedValidateAndSubmit, preventDefaultOnSubmit, submitRef])

  /**
   * Returns button props.
   */
  const getButtonProps = useCallback((props: GetButtonProps = {}): GetButtonPropsReturnType => {
    const type = props.type ?? 'button'
    const result: GetButtonPropsReturnType = { disabled: false, ...props }

    if (props.disabled || formDisabled ||
      (state.hasError && disableSubmitIfNotValid && type === 'submit') ||
      (!state.modified && (mode === 'controlled' || forceUpdateOnStatusChange) && (
        // Disable submit button if form is not modified.
        (type === 'submit' && disableSubmitIfNotModified) ||
        // Disable reset button if form is not modified.
        type === 'reset'
      ))) {
      result.disabled = true
    }
    return result
  }, [disableSubmitIfNotModified, disableSubmitIfNotValid, forceUpdateOnStatusChange, formDisabled, mode, state.hasError, state.modified])

  /**
   * Returns props of a field.
   * Merging is done in the following order:
   * - Generated props
   * - Initialized props
   * - Passed props
   */
  const getFieldProps = useCallback<UseFormHook<V, E, R>['getFieldProps']>(<Component extends ElementType> (
    path: FieldPath<V>,
    props?: ComponentProps<Component>, // fixme improve type autocompletion
    opts: {
      format?: FormatFunction | null | false;
      parse?: ParseFunction;
      setValueOptions?: Partial<SetValuesOptions>;
    } = {}
  ) => {
    const {
      format = String,
      parse,
      setValueOptions
    } = opts ?? {}

    const {
      value,
      defaultValue,
      ...otherProps
    } = props ?? {} as ComponentProps<Component>

    const checkedAttribute = mode === 'controlled'
      ? 'checked'
      : 'defaultChecked'

    const valueAttribute = mode === 'controlled'
      ? 'value'
      : 'defaultValue'

    // Use any of value or defaultValue as input value,
    // but always use attribute depending on mode if available.
    const inputValue = (() => {
      if (typeof props?.[valueAttribute] !== 'undefined') {
        return props?.[valueAttribute]
      }
      if (typeof value !== 'undefined') {
        return value
      }
      if (typeof defaultValue !== 'undefined') {
        return defaultValue
      }
    })()

    // Get current value from context.
    const contextValue = getValue(path)

    // Set default props.
    const finalProps: any = {
      onBlur: handleFieldBlur(path),
      onChange: handleFieldChange(path, {
        parse,
        setValueOptions
      }),
      // Define field ID.
      id: otherProps.type === 'checkbox' || otherProps.type === 'radio'
        ? getFieldId(path + '_' + inputValue, formKey)
        : getFieldId(path, formKey),
      // fixme avoid spreading checked and defaultChecked together
      ...otherProps,
      name: path
    }

    // Merge custom props from initializeField() function.
    if (typeof initializeFieldRef.current === 'function') {
      const customProps = initializeFieldRef.current(path, state)
      const keys = Object.keys(customProps)

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        const v = customProps[k]
        if (typeof v !== 'undefined') {
          finalProps[k] = v
        }
      }
    }

    // Merge passed props.
    if (otherProps) {
      const keys = Object.keys(otherProps)

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        const v = otherProps[k]
        if (typeof v !== 'undefined' && k !== 'parsedValue') {
          finalProps[k] = v
        }
      }
    }

    // Set disabled depending on form state or field state.
    finalProps.disabled = props?.disabled || finalProps.disabled || formDisabled

    const { type } = finalProps

    if (type === 'checkbox' || type === 'radio') {
      // Use input value for checkbox and radio.
      finalProps[valueAttribute] = inputValue
    } else {
      // Use form value.
      finalProps[valueAttribute] = contextValue
    }

    if (type === 'checkbox' || type === 'radio') {
      let parsedValue = typeof inputValue === 'string' && typeof parse === 'function'
        ? parse(inputValue)
        : inputValue

      // Make sure empty string is considered as a null value.
      if (parsedValue === '') {
        parsedValue = null
      }

      if (contextValue instanceof Array) {
        // Set checked state by looking for checkbox value in the array.
        finalProps[checkedAttribute] = contextValue.includes(parsedValue)
        // Make sure required attribute is not set on multiple fields.
        finalProps.required = undefined
      } else if (type === 'checkbox') {
        finalProps[checkedAttribute] =
          (parsedValue === undefined || parsedValue === '')
            // Input value is not defined and field value is true.
            ? contextValue === true
            // Input value matches field value.
            : contextValue === parsedValue
      } else if (type === 'radio') {
        finalProps[checkedAttribute] = contextValue === parsedValue
      }
    }

    if (typeof format === 'function' && finalProps[valueAttribute] != null && typeof finalProps[valueAttribute] !== 'string') {
      if (finalProps[valueAttribute] instanceof Array) {
        // Convert array values to string.
        finalProps[valueAttribute] = finalProps[valueAttribute].map(format)
      } else {
        // Convert value to string.
        finalProps[valueAttribute] = finalProps[valueAttribute] != null
          ? format(finalProps[valueAttribute])
          : ''
      }
    } else if (mode === 'controlled' && finalProps[valueAttribute] == null) {
      // Make sure null is replaced with empty string
      // to avoid switching from controlled to uncontrolled input.
      finalProps[valueAttribute] = ''
    }
    return finalProps
  }, [formDisabled, formKey, getValue, handleFieldBlur, handleFieldChange, mode, state])

  /**
   * Returns form props.
   */
  const getFormProps = useCallback((props: ComponentProps<'form'>): ComponentProps<'form'> => {
    return {
      id: formKey,
      ...props,
      noValidate: !enableHTMLValidation,
      onReset: handleReset,
      onSubmit: handleSubmit
    }
  }, [enableHTMLValidation, formKey, handleReset, handleSubmit])

  useEffect((): void => {
    initializeFieldRef.current = initializeFieldFunc
  }, [initializeFieldFunc])

  useEffect(() => {
    // Set values using initial values when they are provided or if they changed.
    if (initialValues && (!initializedRef.current || reinitialize)) {
      initialize(initialValues, { forceUpdate: true })
    }
  }, [initialValues, initialize, initializedRef, reinitialize])

  useEffect(() => {
    if (state.initialized && validateOnInit) {
      validate()
    }
  }, [state.initialized, validate, validateOnInit])

  return {
    // errors
    errors: state.errors,
    hasError: state.hasError,
    initialErrors: state.initialErrors,
    clearErrors: formErrors.clearErrors,
    getError: formErrors.getError,
    getErrors: formErrors.getErrors,
    getInitialError: formErrors.getInitialError,
    getInitialErrors: formErrors.getInitialErrors,
    resetErrors: formErrors.resetErrors,
    setError: formErrors.setError,
    setErrors: formErrors.setErrors,

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
    loadError: state.loadError,
    loading: state.loading,
    load: formLoader.load,

    // props
    getButtonProps,
    getFieldProps,
    getFormProps,

    // status
    initialModified: state.initialModified,
    initialTouched: state.initialTouched,
    modified: state.modified,
    modifiedFields: state.modifiedFields,
    touched: state.touched,
    touchedFields: state.touchedFields,
    clearTouchedFields: formStatus.clearTouched,
    getModified: formStatus.getModified,
    getTouched: formStatus.getTouched,
    isModified: formStatus.isModified,
    isTouched: formStatus.isTouched,
    resetTouched: formStatus.resetTouched,
    setTouchedField: formStatus.setTouchedField,
    setTouched: formStatus.setTouched,

    // submission
    submitCount: state.submitCount,
    submitError: state.submitError,
    submitResult: state.submitResult,
    submitted: state.submitted,
    submitting: state.submitting,
    submit: debouncedValidateAndSubmit,

    // validation
    needValidation: state.needValidation,
    validateError: state.validateError,
    validated: state.validated,
    validating: state.validating,
    validate: formValidation.validate,
    validateField: formValidation.validateField,
    validateFields: formValidation.validateFields,

    // values
    initialized: state.initialized,
    initialValues: state.initialValues,
    values: state.values,
    clear: formValues.clearValues,
    getInitialValue: formValues.getInitialValue,
    getInitialValues: formValues.getInitialValues,
    getValue: formValues.getValue,
    getValues: formValues.getValues,
    initialize: formValues.initialize,
    removeFields: formValues.removeValues,
    reset: formValues.resetValues,
    setInitialValues: formValues.setInitialValues,
    setValue: formValues.setValue,
    setValues: setFormValues,

    // global
    disabled: formDisabled,
    id: formKey,
    mode,
    forceUpdate,
    handleFieldBlur,
    handleFieldChange,
    handleReset,
    handleSetValue,
    handleSubmit,
    key: getKey,
    validateOnChange,
    validateOnInit,
    validateOnSubmit,
    validateOnTouch
  }
}

export default useForm
