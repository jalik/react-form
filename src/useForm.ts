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
  ModifiedFields,
  PathsAndValues,
  PathsOrValues,
  Values
} from './useFormState'
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
import useFormStatus, { UseFormStatusHook } from './useFormStatus'
import useFormValues, { UseFormValuesHook } from './useFormValues'
import useFormLoader, { UseFormLoaderHook, UseFormLoaderOptions } from './useFormLoader'
import useFormList, { UseFormListHook } from './useFormList'
import deepExtend from '@jalik/deep-extend'
import useFormValidation from './useFormValidation'
import useFormSubmission from './useFormSubmission'

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

export type InitializeFieldFunction<V extends Values, E, R> = <C extends ElementType> (path: FieldPath<V>, formState: FormState<V, E, R>) => ComponentProps<C> | undefined

export type UseFormHook<V extends Values, E = Error, R = any> = FormState<V, E, R> & {
  /**
   * Clears the form (values, errors...).
   * @param paths
   * @param options
   */
  clear (paths?: FieldPath<V>[], options?: { forceUpdate?: boolean }): void;
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
      mode?: FormMode;
      format?: ((value: unknown) => string) | null;
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
   * @param path
   * @param options
   */
  handleSetValue (path: FieldPath<V>, options?: {
    parser?: (value: unknown) => any
  }): (value: unknown | undefined) => void;
  /**
   * Handles form submit event.
   * @param event
   */
  handleSubmit (event: React.FormEvent<HTMLFormElement>): void;
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
   * Removes given fields.
   */
  removeFields: UseFormValuesHook<V>['removeValues'];
  /**
   * Resets all or given fields.
   * @param paths
   * @param options
   */
  reset (paths?: FieldPath<V>[], options?: { forceUpdate?: boolean }): void;
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
   * Sets a single touched field.
   */
  setTouchedField: UseFormStatusHook<V>['setTouchedField'];
  /**
   * Sets all partial or partial touched fields.
   */
  setTouchedFields: UseFormStatusHook<V>['setTouched'];
  /**
   * Sets a single field value.
   * @param path
   * @param value
   * @param options
   */
  setValue (
    path: FieldPath<V>,
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
  submit: DebouncedFunction<R | undefined>;
  /**
   * Calls the validate function with form values.
   * @param opts
   */
  validate (opts?: { submitAfter: boolean }): Promise<Errors<E> | undefined>;
  /**
   * Calls the validateField function for a single field value.
   * @param path
   */
  validateField (path: FieldPath<V>): Promise<E | null | undefined>;
  /**
   * Calls the validate or validateField function for all or given fields.
   * @param paths
   */
  validateFields (paths?: FieldPath<V>[]): Promise<Errors<E> | undefined>;
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
   * Tells if form values should be cleared after submit.
   */
  clearAfterSubmit?: boolean;
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
  initializeField?: InitializeFieldFunction<V, E, R>;
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
   * Called when form values have changed.
   * @param values
   * @param previousValues
   */
  onValuesChange? (values: Partial<V>, previousValues: Partial<V>): void;
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
  transform? (mutation: PathsAndValues<V>, values: Partial<V>): PathsAndValues<V>;
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
    // todo add tests for clearAfterSubmit
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
    load: onLoad,
    mode = 'controlled',
    nullify = false,
    onSubmit,
    onSubmitted,
    onValuesChange,
    // todo add tests for reinitialize
    reinitialize = false,
    // todo add tests for setInitialValuesOnSuccess
    setInitialValuesOnSuccess = false,
    submitDelay = 100,
    transform: transformFunc,
    // todo add tests for trimOnBlur
    trimOnBlur = false,
    // todo add tests for trimOnSubmit
    trimOnSubmit = false,
    validate: validateFunc,
    validateField: validateFieldFunc,
    validateDelay = 400,
    // todo add tests for validateOnChange
    validateOnChange = false,
    // todo add tests for validateOnInit
    validateOnInit = false,
    // todo add tests for validateOnSubmit
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
    setState,
    state,
    valuesRef
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
    formState,
    mode
  })

  // Handle form watchers.
  const formWatch = useFormWatch<V>()

  // Handle form values.
  const formValues = useFormValues<V, E, R>({
    formKeys,
    formState,
    formStatus,
    mode,
    onValuesChange,
    reinitialize,
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
    clearAfterSubmit,
    formErrors,
    formState,
    formStatus,
    formValues,
    nullify,
    onSuccess: onSubmitted,
    setInitialValuesOnSuccess,
    submit: onSubmit,
    trimOnSubmit
  })

  const {
    clearErrors,
    getError,
    getErrors,
    setError,
    setErrors
  } = formErrors

  const {
    getKey,
    replaceKeys
  } = formKeys

  const {
    clearModified,
    clearTouched,
    getModified,
    getTouched,
    isModified,
    isTouched,
    resetModified,
    resetTouched,
    setTouchedField,
    setTouched
  } = formStatus

  const {
    submit,
    submitRef
  } = formSubmission

  const {
    validate
  } = formValidation

  const {
    clearValues,
    getInitialValues,
    getInitialValue,
    getValue,
    getValues,
    removeValues,
    resetValues,
    setInitialValues,
    setValues
  } = formValues

  // Defines function references.
  const initializeFieldRef = useRef(initializeFieldFunc)
  const transformRef = useRef(transformFunc)

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

  const clear = useCallback<UseFormHook<V, E, R>['clear']>((fields, opts) => {
    const { forceUpdate = true } = opts ?? {}
    // todo optimize to avoid rerender
    clearErrors(fields, { forceUpdate: false })
    clearModified(fields, { forceUpdate: false })
    clearTouched(fields, { forceUpdate: false })
    clearValues(fields, { forceUpdate })

    if (fields) {
      setState((s) => ({
        ...s,
        submitCount: 0,
        submitError: undefined,
        submitResult: undefined,
        submitted: false,
        validateError: undefined,
        validated: false
      }))
    }
  }, [clearErrors, clearModified, clearTouched, clearValues, setState])

  const removeFields = useCallback<UseFormHook<V, E, R>['removeFields']>((fields, opts) => {
    const { forceUpdate } = opts ?? {}
    // todo optimize to avoid rerender
    removeValues(fields, { forceUpdate: false })
    clearErrors(fields, { forceUpdate: false })
    clearModified(fields, { forceUpdate: false })
    clearTouched(fields, { forceUpdate })
  }, [clearErrors, clearModified, clearTouched, removeValues])

  const setFormValues = useCallback<UseFormHook<V, E, R>['setValues']>((
    values,
    opts = {}
  ) => {
    const {
      forceUpdate = false,
      partial = false,
      validate = false
    } = opts ?? {}

    const currentValues = clone(valuesRef.current)

    let mutationOrValues: PathsOrValues<V> = typeof values === 'function'
      ? { ...values(currentValues as any) }
      : { ...values }

    // todo move bloc to useFormValues().setValues()
    const keys = Object.keys(mutationOrValues)
    for (let i = 0; i < keys.length; i++) {
      const path = keys[i]
      const value = mutationOrValues[path]
      let nextValue = value

      // Replace empty string with null.
      if (nullify && value === '') {
        nextValue = null
      }

      if (partial) {
        // fixme ts error
        // @ts-ignore
        mutationOrValues[path] = nextValue
      } else {
        mutationOrValues = build(path, nextValue, mutationOrValues)
      }
    }

    // todo move to useFormValues().setValues()
    if (transformRef.current) {
      // Flatten values to make sure mutation only contains field names as keys
      // and field values as values.
      // fixme ts error
      // @ts-ignore
      let mut: PathsAndValues<V> = partial ? mutationOrValues : flatten(mutationOrValues)

      // Apply transformation to values.
      const nextValues = deepExtend({}, currentValues, partial
        ? reconstruct(mutationOrValues)
        : mutationOrValues)
      mut = transformRef.current(mut, nextValues)

      // Update next values from mutation.
      // fixme ts error
      // @ts-ignore
      mutationOrValues = partial ? mut : reconstruct(mut)
    }

    setValues(mutationOrValues, {
      partial,
      forceUpdate,
      validate
    })
  }, [nullify, setValues, valuesRef])

  const setFormValue = useCallback<UseFormHook<V, E, R>['setValue']>((name, value, opts): void => {
    setFormValues({ [name]: value } as PathsAndValues<V>, {
      forceUpdate: opts?.forceUpdate,
      partial: true,
      validate: opts?.validate
    })
  }, [setFormValues])

  const reset = useCallback<UseFormHook<V, E, R>['reset']>((fields, opts) => {
    const { forceUpdate = true } = opts ?? {}
    // todo optimize to avoid rerender
    // todo use resetErrors()
    clearErrors(fields, { forceUpdate: false })
    resetModified(fields, { forceUpdate: false })
    resetTouched(fields, { forceUpdate: false })
    resetValues(fields, { forceUpdate })

    if (fields) {
      setState((s) => ({
        ...s,
        submitError: undefined,
        submitted: false,
        validateError: undefined,
        validated: false
      }))
    }
  }, [clearErrors, resetModified, resetTouched, resetValues, setState])

  const validateAndSubmit = useCallback(async (): Promise<R | undefined> => {
    if (!validateOnSubmit || state.validated) {
      return submit()
    }
    const errors = await validate()

    if (!errors || !hasDefinedValues(errors)) {
      return submit()
    }
    return Promise.resolve(undefined)
  }, [validateOnSubmit, state.validated, validate, submit])

  const debouncedValidateAndSubmit = useDebouncePromise(validateAndSubmit, submitDelay)

  const handleButtonClick = useCallback((listener: (ev: React.MouseEvent<HTMLButtonElement>) => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const target = event.currentTarget || event.target

    if (listener) {
      listener(event)
    } else if (target.type === 'submit') {
      validateAndSubmit()
    } else if (target.type === 'reset') {
      reset()
    }
  }, [reset, validateAndSubmit])

  const handleBlur = useCallback((event: React.FocusEvent<FieldElement>): void => {
    const target = event.currentTarget ?? event.target
    const { name } = target

    setTouchedField(name, true)

    if (validateOnTouch) {
      // fixme cause infinite rerender
      // setNeedValidation([name])
    }

    if (trimOnBlur) {
      let value = getValue(name)

      if (typeof value === 'string') {
        // Remove extra spaces.
        value = value.trim()
        setFormValue(name, value, { validate: validateOnTouch })
      }
    }
  }, [trimOnBlur, setTouchedField, validateOnTouch, getValue, setFormValue])

  const handleChange = useCallback((
    event: React.ChangeEvent<FieldElement>,
    opts?: { parser? (value: string, target?: HTMLElement): any }
  ): void => {
    const target = event.currentTarget ?? event.target
    const { name } = target
    const value = getFieldValue(target, opts)
    setFormValue(name, value, { validate: validateOnChange })
  }, [setFormValue, validateOnChange])

  const handleReset = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    reset()
  }, [reset])

  const handleSetValue = useCallback((
    path: FieldPath<V>,
    opts?: { parser?: (value: unknown) => any }
  ) => {
    return (value: unknown | undefined): void => {
      const val = opts?.parser ? opts?.parser(value) : value
      setFormValue(path, val)
    }
  }, [setFormValue])

  /**
   * Handles form submit.
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    if (submitRef.current != null) {
      event.preventDefault()
      event.stopPropagation()
      validateAndSubmit()
    }
  }, [submitRef, validateAndSubmit])

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
      ((!state.modified && mode === 'controlled') && (type === 'submit' || type === 'reset'))) {
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
  }, [formDisabled, state.modified, mode, handleButtonClick, validateAndSubmit, reset])

  /**
   * Returns props of a field.
   * Merging is done in the following order:
   * - Generated props
   * - Initialized props
   * - Passed props
   */
  const getFieldProps = useCallback(<Component extends ElementType> (
    path: FieldPath<V>,
    props?: ComponentProps<Component>,
    opts: {
      mode?: FormMode;
      format?: ((value: unknown) => string) | null;
      parser?: (value: string, target?: HTMLElement) => any;
    } = {}
  ) => {
    const contextValue = getValue(path)
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
      id: getFieldId(path, formKey),
      name: path,
      onBlur: handleBlur,
      onChange: (event: React.ChangeEvent<FieldElement>) => {
        handleChange(event, opts)
      }
    }

    if (props?.type !== 'checkbox' && props?.type !== 'radio') {
      finalProps[valueAttribute] = contextValue
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

    // Merge passed props
    if (props) {
      const keys = Object.keys(props)

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        const v = props[k]
        if (typeof v !== 'undefined' && k !== 'parsedValue') {
          finalProps[k] = v
        }
      }
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

  useEffect((): void => {
    initializeFieldRef.current = initializeFieldFunc
  }, [initializeFieldFunc])

  useEffect((): void => {
    transformRef.current = transformFunc
  }, [transformFunc])

  useEffect(() => {
    // Set values using initial values when they are provided or if they changed.
    if (initialValues && (!initializedRef.current || reinitialize)) {
      setInitialValues(initialValues)
    }
  }, [initialValues, initializedRef, reinitialize, setInitialValues])

  return {
    // errors
    errors: state.errors,
    hasError: state.hasError,
    initialErrors: state.initialErrors,
    clearErrors,
    getError,
    getErrors,
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
    clearTouchedFields: clearTouched,
    getModified,
    getTouched,
    isModified,
    isTouched,
    resetTouched,
    setTouchedField,
    // todo v6: rename to setTouched()
    setTouchedFields: setTouched,

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
    getInitialValue,
    getInitialValues,
    getValue,
    getValues,
    removeFields,
    setInitialValues,
    setValue: setFormValue,
    setValues: setFormValues,

    // global
    disabled: formDisabled,
    mode,
    clear,
    forceUpdate,
    handleBlur,
    handleChange,
    handleReset,
    handleSetValue,
    handleSubmit,
    key: getKey,
    reset,
    validateOnChange,
    validateOnInit,
    validateOnSubmit,
    validateOnTouch
  }
}

export default useForm
