/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import useDebouncePromise from './useDebouncePromise';
import useFormReducer, {
  ACTION_CLEAR,
  ACTION_CLEAR_ERRORS,
  ACTION_CLEAR_TOUCH,
  ACTION_INIT_VALUES,
  ACTION_LOAD,
  ACTION_LOAD_ERROR,
  ACTION_LOAD_SUCCESS,
  ACTION_REMOVE,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERRORS,
  ACTION_SET_VALUES,
  ACTION_SUBMIT,
  ACTION_SUBMIT_ERROR,
  ACTION_SUBMIT_SUCCESS,
  ACTION_TOUCH,
  ACTION_VALIDATE,
  ACTION_VALIDATE_ERROR,
  ACTION_VALIDATE_FAIL,
  ACTION_VALIDATE_SUCCESS,
  initialState,
} from './useFormReducer';
import {
  build,
  clone,
  getCheckedValues,
  getSelectedValues,
  hasDefinedValues,
  isMultipleFieldElement,
  parseInputValue,
  resolve,
} from './utils';

export type FieldChangeOptions = {
  parser?(value: unknown, target: HTMLElement): any
}

export type Errors = Record<string, void | Error | undefined>

export type ModifiedFields = Record<string, boolean>

export type TouchedFields = Record<string, boolean>

export type Values = Record<string, unknown>

export type FieldAttributes =
  React.InputHTMLAttributes<HTMLInputElement>
  | React.SelectHTMLAttributes<HTMLSelectElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export interface FormState<V extends Values, R> {
  disabled: boolean;
  errors: Errors;
  hasError: boolean;
  initialized: boolean;
  initialValues: Partial<V>;
  loadError?: Error;
  loaded: boolean;
  loading: boolean;
  modified: boolean;
  modifiedFields: ModifiedFields;
  needValidation: boolean | string[];
  submitCount: number;
  submitError?: Error;
  submitResult?: R;
  submitted: boolean;
  submitting: boolean;
  touched: boolean;
  touchedFields: TouchedFields;
  validateError?: Error;
  validated: boolean;
  validateOnChange: boolean;
  validateOnInit: boolean;
  validateOnSubmit: boolean;
  validateOnTouch: boolean;
  validating: boolean;
  values: Partial<V>;
}

export interface UseFormHook<V extends Values, R> extends FormState<V, R> {
  clear(): void;
  clearErrors(): void;
  clearTouch(fields: string[]): void;
  getAttributes(name: string): FieldAttributes | undefined;
  getInitialValue<T>(name: string): T | undefined;
  getValue<T>(name: string, defaultValue?: T): T | undefined;
  handleBlur(event: React.FocusEvent<FieldElement>): void;
  handleChange(event: React.ChangeEvent<FieldElement>, options?: FieldChangeOptions): void;
  handleReset(event: React.FormEvent<HTMLFormElement>): void;
  handleSubmit(event: React.FormEvent<HTMLFormElement>): void;
  initValues(values: Partial<V>): void;
  invalidClass?: string;
  load(): void;
  modifiedClass?: string;
  remove(name: string): void;
  reset(): void;
  submit(): Promise<void | R>;
  setError(name: string, error?: Error): void;
  setErrors(errors: Errors): void;
  setValue(name: string, value?: unknown, validate?: boolean): void;
  setValues(values: Partial<V>, validate?: boolean): void;
  touch(fields: string[]): void;
  validate(): Promise<void | Errors | undefined>;
  validateField(name: string): Promise<void | Error | undefined>;
  validateFields(fields?: string[]): Promise<void | Errors | undefined>;
  validClass?: string;
}

export interface UseFormOptions<V extends Values, R> {
  disabled?: boolean;
  initialValues?: Partial<V>;
  invalidClass?: string;
  modifiedClass?: string;
  nullify?: boolean;
  initializeField?(name: string): FieldAttributes | undefined;
  load?(): Promise<void | V>;
  onSubmit(values: Partial<V>): Promise<void | R>;
  submitDelay?: number;
  transform?(mutation: Values, values: Partial<V>): Partial<V>;
  validate?(values: Partial<V>, modifiedFields: ModifiedFields): Promise<void | Errors | undefined>;
  validateField?(name: string, value: unknown, values: Partial<V>): Promise<void | Error | undefined>;
  validClass?: string;
  validateDelay?: number;
  validateOnChange?: boolean;
  validateOnInit?: boolean;
  validateOnSubmit?: boolean;
  validateOnTouch?: boolean;
}

/**
 * Manage form state and actions.
 */
function useForm<V extends Values, R>(options: UseFormOptions<V, R>): UseFormHook<V, R> {
  const {
    disabled = false,
    initialValues,
    invalidClass = 'field-invalid',
    initializeField: initializeFieldFunc,
    load: loadFunc,
    modifiedClass = 'field-modified',
    nullify = false,
    onSubmit,
    submitDelay = 100,
    transform: transformFunc,
    validate: validateFunc,
    validateField: validateFieldFunc,
    validClass = 'field-valid',
    validateDelay = 200,
    validateOnChange = false,
    validateOnInit = false,
    validateOnSubmit = true,
    validateOnTouch = false,
  } = options;

  // Checks options.
  if (typeof onSubmit !== 'function') {
    throw new Error('onSubmit must be a function');
  }
  if (transformFunc && typeof transformFunc !== 'function') {
    throw new Error('transform must be a function');
  }
  if (initializeFieldFunc && typeof initializeFieldFunc !== 'function') {
    throw new Error('initializeField must be a function');
  }
  if (loadFunc && typeof loadFunc !== 'function') {
    throw new Error('load must be a function');
  }
  if (validateFunc && typeof validateFunc !== 'function') {
    throw new Error('validate must be a function');
  }
  if (validateFieldFunc && typeof validateFieldFunc !== 'function') {
    throw new Error('validateField function');
  }

  // Defines function references.
  const initializeFieldRef = useRef(initializeFieldFunc);
  const mountedRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  const transformRef = useRef(transformFunc);
  const validateFieldRef = useRef(validateFieldFunc);
  const validateRef = useRef(validateFunc);

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
      validateOnTouch,
    },
    undefined,
  );

  /**
   * Clears form.
   */
  const clear = useCallback((): void => {
    dispatch({ type: ACTION_CLEAR });
  }, []);

  /**
   * Clears all errors.
   */
  const clearErrors = useCallback((): void => {
    dispatch({ type: ACTION_CLEAR_ERRORS });
  }, []);

  /**
   * Returns attributes of a field.
   */
  const getAttributes = useCallback((
    name: string,
    defaultAttributes?: FieldAttributes,
  ): FieldAttributes | undefined => (
    typeof initializeFieldRef.current === 'function'
      ? initializeFieldRef.current(name)
      : defaultAttributes
  ), []);

  /**
   * Returns the initial value of a field.
   */
  const getInitialValue = useCallback(<T>(name: string): T | undefined => (
    resolve<T>(name, clone(state.initialValues))
  ), [state.initialValues]);

  /**
   * Returns the value of a field.
   */
  const getValue = useCallback(<T>(name: string, defaultValue?: T): T | undefined => {
    const value = resolve<T>(name, clone(state.values));
    return typeof value !== 'undefined' ? value : defaultValue;
  }, [state.values]);

  /**
   * Loads and set initial values.
   */
  const load = useCallback((): void => {
    if (loadFunc) {
      dispatch({ type: ACTION_LOAD });
      loadFunc()
        .then((result) => {
          if (mountedRef && result) {
            dispatch({ type: ACTION_LOAD_SUCCESS, data: { values: result } });
          }
        })
        .catch((error) => {
          dispatch({ type: ACTION_LOAD_ERROR, error });
          throw error;
        });
    }
  }, [loadFunc]);

  /**
   * Removes a field.
   */
  const remove = useCallback((name: string): void => {
    // Ignore action if form disabled
    if (disabled) return;

    dispatch({ type: ACTION_REMOVE, data: { name } });
  }, [disabled]);

  /**
   * Defines the field error.
   */
  const setError = useCallback((name: string, error: Error): void => {
    dispatch({ type: ACTION_SET_ERRORS, data: { errors: { [name]: error } } });
  }, []);

  /**
   * Defines form field errors.
   */
  const setErrors = useCallback((errors: Errors): void => {
    dispatch({ type: ACTION_SET_ERRORS, data: { errors } });
  }, []);

  /**
   * Validates one or more fields by passing field names.
   */
  const validateFields = useCallback((fields: string[]): Promise<void | Errors | undefined> => {
    dispatch({ type: ACTION_VALIDATE });

    const validate = validateFieldRef.current;
    const promises = validate
      ? fields.map((name: string) => {
        const result = validate(name, getValue(name), state.values);

        if (!result) {
          throw new Error('validateField() must return a Promise');
        }
        return result.then((error): [string, void | Error | undefined] => [name, error]);
      })
      : [];

    let errors: Errors = {};

    return Promise
      .all(promises)
      .then((results) => {
        results.forEach((result) => {
          if (result) {
            const [name, error] = result;
            errors = { ...errors, [name]: error };
          }
        });
        dispatch({
          type: ACTION_VALIDATE_FAIL,
          data: {
            // Keep existing errors.
            errors: {
              ...state.errors,
              ...errors,
            },
          },
        });
        return errors;
      })
      .catch((error) => {
        dispatch({ type: ACTION_VALIDATE_ERROR, error });
        throw error;
      });
  }, [getValue, state.errors, state.values]);

  /**
   * Validates a field value.
   */
  const validateField = useCallback((name: string): Promise<void | Error | undefined> => {
    return validateFields([name]).then((errors: void | Errors | undefined) => {
      const err: Record<string, void | Error | undefined> = { ...errors };
      return err[name];
    });
  }, [validateFields]);

  /**
   * Defines several field values (use initValues() to set all form values).
   */
  const setValues = useCallback((values: Values, validate = undefined): void => {
    // Ignore action if form disabled
    if (disabled) return;

    let mutation = { ...values };
    if (transformRef.current) {
      // Merge changes with current values.
      let nextValues = clone(state.values) || {};
      Object.entries(mutation).forEach(([name, value]) => {
        nextValues = build(name, value, nextValues);
      });
      // Allow changing values on the fly
      mutation = transformRef.current(mutation, nextValues);
    }

    dispatch({
      type: ACTION_SET_VALUES,
      data: {
        validate: validate || (validate !== false && validateOnChange),
        values: mutation,
      },
    });
  }, [disabled, state.values, validateOnChange]);

  /**
   * Defines the value of a field.
   */
  const setValue = useCallback((name: string, value?: unknown, validate = undefined): void => {
    setValues({ [name]: value }, validate);
  }, [setValues]);

  /**
   * Clear touched fields.
   */
  const clearTouch = useCallback((fields: string[]) => {
    dispatch({ type: ACTION_CLEAR_TOUCH, data: { fields } });
  }, []);

  /**
   * Set touched fields.
   */
  const touch = useCallback((fields: string[]) => {
    let canDispatch = false;

    // Check if we really need to dispatch the event
    for (let i = 0; i < fields.length; i += 1) {
      if (!state.touchedFields[fields[i]]) {
        canDispatch = true;
        break;
      }
    }

    if (canDispatch) {
      dispatch({ type: ACTION_TOUCH, data: { fields } });
    }
  }, [state.touchedFields]);

  /**
   * Resets form values.
   */
  const reset = useCallback((fields?: string[]): void => {
    if (fields) {
      dispatch({ type: ACTION_RESET_VALUES, data: { fields } });
    } else {
      dispatch({ type: ACTION_RESET });
    }
  }, []);

  /**
   * Submits form.
   */
  const submit = useCallback((): Promise<void | R> => {
    if (!state.values) {
      const error = new Error('Nothing to submit, values are empty');
      dispatch({ type: ACTION_SUBMIT_ERROR, error });
      return Promise.reject(error);
    }
    dispatch({ type: ACTION_SUBMIT });
    const promise = onSubmitRef.current(clone(state.values));

    if (!(promise instanceof Promise)) {
      throw new Error('onSubmit must return a Promise');
    }
    return promise
      .then((result) => {
        if (result) {
          dispatch({ type: ACTION_SUBMIT_SUCCESS, data: { result } });
        }
        return result;
      })
      .catch((error: Error) => {
        dispatch({ type: ACTION_SUBMIT_ERROR, error });
        throw error;
      });
  }, [state.values]);

  /**
   * Validates form values.
   */
  const validate = useCallback((options?: { beforeSubmit?: boolean }): Promise<void | Errors | undefined> => {
    const { beforeSubmit = false } = options || {};
    let promise;

    if (typeof validateRef.current === 'function') {
      dispatch({ type: ACTION_VALIDATE });

      if (!state.values) {
        const error = new Error('Nothing to validate, values are empty');
        dispatch({ type: ACTION_VALIDATE_ERROR, error });
        return Promise.reject(error);
      }
      promise = validateRef.current(clone(state.values), { ...state.modifiedFields });

      if (!(promise instanceof Promise)) {
        throw new Error(`validate() must return a Promise`);
      }
    } else {
      // Validate touched and modified fields only, since we don't have a global validation function.
      // todo validate registered fields
      return validateFields(Object.keys({
        ...state.modifiedFields,
        ...state.touchedFields,
      }));
    }

    return promise
      .then((errors) => {
        if (errors && hasDefinedValues(errors)) {
          dispatch({
            type: ACTION_VALIDATE_FAIL,
            data: { errors },
          });
        } else {
          dispatch({
            type: ACTION_VALIDATE_SUCCESS,
            data: { beforeSubmit },
          });
        }
        return errors;
      })
      .catch((error) => {
        dispatch({
          type: ACTION_VALIDATE_ERROR,
          error,
        });
        throw error;
      });
  }, [state.modifiedFields, state.touchedFields, state.values, validateFields]);

  /**
   * Validates if necessary and submits form.
   */
  const validateAndSubmit = useCallback((): Promise<void | R> => (
    !state.validated && validateOnSubmit
      ? validate({ beforeSubmit: true })
        .then((errors) => {
          if (!errors || !hasDefinedValues(errors)) {
            return submit();
          }
          return undefined;
        })
      : submit()
  ), [validateOnSubmit, state.validated, validate, submit]);

  const debouncedSubmit = useDebouncePromise<R>(validateAndSubmit, submitDelay);

  /**
   * Defines initial values (after loading for example).
   */
  const initValues = useCallback((values: Partial<V>): void => {
    dispatch({ type: ACTION_INIT_VALUES, data: { values } });
  }, []);

  /**
   * Handles leaving of a field.
   */
  const handleBlur = useCallback((event: React.FocusEvent<FieldElement>): void => {
    touch([event.currentTarget.name]);
  }, [touch]);

  /**
   * Handles change of field value.
   */
  const handleChange = useCallback((
    event: React.ChangeEvent<FieldElement>,
    options?: FieldChangeOptions,
  ): void => {
    const { parser } = options || {};
    const { currentTarget } = event;
    const { name, type } = currentTarget;
    let value;

    // Parses value using a custom parser or using the native parser (smart typing).
    const parsedValue = typeof parser === 'function'
      ? parser(currentTarget.value, currentTarget)
      : parseInputValue(currentTarget);

    // Handles array value (checkboxes, select-multiple).
    const el = currentTarget.form?.elements.namedItem(name);
    if (el && isMultipleFieldElement(el)) {
      if (currentTarget instanceof HTMLInputElement) {
        value = getCheckedValues(currentTarget);
      } else if (currentTarget instanceof HTMLSelectElement) {
        value = getSelectedValues(currentTarget);
      }
    } else if (type === 'checkbox' && currentTarget instanceof HTMLInputElement) {
      if (currentTarget.value === '') {
        // Checkbox has no value defined, so we use the checked state instead.
        value = currentTarget.checked;
      } else if (typeof parsedValue === 'boolean') {
        // Checkbox has a boolean value.
        value = currentTarget.checked ? parsedValue : !parsedValue;
      } else {
        // Checkbox value other than boolean.
        value = currentTarget.checked ? parsedValue : undefined;
      }
    } else {
      value = parsedValue;
    }

    // Replaces empty string with null.
    if (value === '' && nullify) {
      value = null;
    }

    setValue(name, value);
  }, [nullify, setValue]);

  /**
   * Handles form reset.
   */
  const handleReset = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    reset();
  }, [reset]);

  /**
   * Handles form submit.
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    validateAndSubmit();
  }, [validateAndSubmit]);

  // Keep track of mount state.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect((): void => {
    initializeFieldRef.current = initializeFieldFunc;
  }, [initializeFieldFunc]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect((): void => {
    transformRef.current = transformFunc;
  }, [transformFunc]);

  useEffect(() => {
    validateFieldRef.current = validateFieldFunc;
  }, [validateFieldFunc]);

  useEffect(() => {
    validateRef.current = validateFunc;
  }, [validateFunc]);

  useEffect(() => {
    if (initialValues && !state.initialized) {
      initValues(initialValues);
    }
  }, [initValues, initialValues, state.initialized]);

  const debouncedValidateFields = useDebouncePromise(validateFields, validateDelay);

  useEffect(() => {
    if (state.needValidation === true) {
      validate();
    } else if (state.needValidation instanceof Array && state.needValidation.length > 0) {
      debouncedValidateFields(state.needValidation);
    }
  }, [debouncedValidateFields, state.needValidation, validate]);

  // Load initial values using a function.
  useEffect(() => {
    load();
  }, [load]);

  return useMemo(() => ({
    ...state,
    // Options
    invalidClass,
    modifiedClass,
    validClass,
    // Methods
    clear,
    clearErrors,
    clearTouch,
    getAttributes,
    getInitialValue,
    getValue,
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    initValues,
    load,
    remove,
    reset,
    setError,
    setErrors,
    setValue,
    setValues,
    submit: debouncedSubmit,
    touch,
    validate,
    validateField,
    validateFields,
  }), [state, invalidClass, modifiedClass, validClass, clear,
    clearErrors, clearTouch, getAttributes, getInitialValue, getValue, handleBlur, handleChange, handleReset,
    handleSubmit, initValues, load, remove, reset, setError, setErrors, setValue, setValues, debouncedSubmit, touch,
    validate, validateField, validateFields]);
}

export default useForm;
