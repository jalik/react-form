/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { HTMLAttributes, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import useDebouncePromise from './useDebouncePromise';
import useFormReducer, {
  ACTION_CLEAR_ERRORS,
  ACTION_INIT_VALUES,
  ACTION_LOAD,
  ACTION_LOAD_FAIL,
  ACTION_LOAD_SUCCESS,
  ACTION_REMOVE,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERROR,
  ACTION_SET_ERRORS,
  ACTION_SET_VALUES,
  ACTION_SUBMIT,
  ACTION_SUBMIT_FAIL,
  ACTION_SUBMIT_SUCCESS,
  ACTION_VALIDATE,
  ACTION_VALIDATE_FAIL,
  ACTION_VALIDATE_SUCCESS,
} from './useFormReducer';
import {
  build,
  clone,
  getCheckedValues,
  getSelectedValues,
  isMultipleFieldElement,
  parseInputValue,
  resolve,
} from './utils';

export type FieldChangeOptions = {
  parser?(value: unknown, target: HTMLElement): any
}

export type FormErrors = { [key: string]: Error; }

export type Fields = Record<string, unknown>

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type ModifiedFields = Record<string, boolean>

export interface FormState<T extends Fields, R> {
  disabled: boolean;
  errors: FormErrors;
  hasError: boolean;
  initialized: boolean;
  initialValues?: T;
  loadError?: Error;
  loaded: boolean;
  loading: boolean;
  modified: boolean;
  modifiedFields: ModifiedFields;
  submitCount: number;
  submitError?: Error;
  submitResult?: R;
  submitted: boolean;
  submitting: boolean;
  validateError?: Error;
  validated: boolean;
  validating: boolean;
  values?: T;
}

export interface UseFormHook<T extends Fields, R> extends FormState<T, R> {
  clearErrors(): void;
  getAttributes(name: string): HTMLAttributes<FieldElement> | undefined;
  getInitialValue<V>(name: string): V | undefined;
  getValue<V>(name: string, defaultValue?: V): V;
  handleChange(event: React.FormEvent<FieldElement>, options: FieldChangeOptions): void;
  handleReset(event: React.FormEvent<HTMLFormElement>): void;
  handleSubmit(event: React.FormEvent<HTMLFormElement>): void;
  initValues(values: T): void;
  invalidClass?: string;
  modifiedClass?: string;
  remove(name: string): void;
  reset(): void;
  submit(): Promise<void | R>; // todo return type
  setError(name: string, error?: Error): void;
  setErrors(errors: FormErrors): void;
  setValue(name: string, value?: unknown): void;
  setValues(values: Partial<T>): void;
  // todo rename to validate()
  validateFields(fields: string[] | Partial<T>): Promise<void | FormErrors>;
  validateField(name: string, value?: unknown): Promise<void | Error | undefined>;
  validClass?: string;
}

export interface UseFormOptions<T, R> {
  disabled: boolean;
  initialValues: T;
  invalidClass: string;
  modifiedClass: string;
  nullify: boolean;
  onChange?(mutation: Fields, values: Partial<T>): Partial<T>;
  onInitializeField?(name: string): HTMLAttributes<FieldElement>;
  onLoad?(): Promise<T>;
  onSubmit?(values: Partial<T>): Promise<R>;
  validate?(values: Partial<T>, modifiedFields: ModifiedFields): Promise<void | FormErrors>;
  validateField?(name: string, value: unknown, values?: T): Promise<void | Error | undefined>;
  submitDelay: number;
  validClass: string;
  validateDelay: number;
}

/**
 * Returns utils to manage form state.
 */
function useForm<T extends Fields, R>(options: UseFormOptions<T, R>): UseFormHook<T, R> {
  const {
    disabled = false,
    initialValues,
    invalidClass = 'field-invalid',
    modifiedClass = 'field-modified',
    nullify = false,
    onChange,
    onInitializeField,
    onLoad,
    onSubmit,
    validate: validateFunc,
    validateField: validateFieldFunc,
    submitDelay = 100,
    validClass = 'field-valid',
    validateDelay = 200,
  } = options;

  // Checks options.
  if (onChange != null && typeof onChange !== 'function') {
    throw new Error('onChange must be a function');
  }
  if (typeof onSubmit !== 'function') {
    throw new Error('onSubmit must be a function');
  }
  if (typeof onInitializeField !== 'undefined' && typeof onInitializeField !== 'function') {
    throw new Error('onInitializeField must be a function');
  }
  if (typeof onLoad !== 'undefined' && typeof onLoad !== 'function') {
    throw new Error('onLoad must be a function');
  }
  if (typeof validateFunc !== 'undefined' && typeof validateFunc !== 'function') {
    throw new Error('validate must be a function');
  }
  if (typeof validateFieldFunc !== 'undefined' && typeof validateFieldFunc !== 'function') {
    throw new Error('validateField function');
  }

  // Defines function references.
  const onInitializeFieldRef = useRef(onInitializeField);
  const onSubmitRef = useRef(onSubmit);
  const validateFieldRef = useRef(validateFieldFunc);
  const validateRef = useRef(validateFunc);
  const isInitialized = initialValues != null;

  // Defines the form state.
  const [state, dispatch] = useReducer(
    useFormReducer<T, R>,
    {
      // Disables fields if default values are undefined.
      disabled: disabled || !isInitialized,
      errors: {},
      hasError: false,
      initialized: isInitialized,
      initialValues: initialValues || {},
      loaded: false,
      loading: typeof onLoad === 'function',
      modified: false,
      modifiedFields: {},
      submitCount: 0,
      submitted: false,
      submitting: false,
      validated: false,
      validating: false,
      values: initialValues, // todo clone<T>(initialValues || {}),
    },
    undefined,
  );

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
    defaultAttributes?: HTMLAttributes<FieldElement>,
  ): HTMLAttributes<FieldElement> | undefined => (
    typeof onInitializeFieldRef.current === 'function'
      ? onInitializeFieldRef.current(name)
      : defaultAttributes
  ), []);

  /**
   * Returns the initial value of a field.
   */
  const getInitialValue = useCallback((name: string): any => (
    resolve(name, clone(state.initialValues))
  ), [state.initialValues]);

  /**
   * Returns a copy of field value.
   */
  const getValue = useCallback((name: string, defaultValue?: unknown): any => {
    const value = resolve(name, clone(state.values));
    return typeof value !== 'undefined' ? value : defaultValue;
  }, [state.values]);

  /**
   * Defines initial values (after loading for example).
   */
  const initValues = useCallback((values: T): void => {
    dispatch({ type: ACTION_INIT_VALUES, data: { values } });
  }, [dispatch]);

  /**
   * Removes a field.
   */
  const remove = useCallback((name: string): void => {
    dispatch({ type: ACTION_REMOVE, data: { name } });
  }, []);

  /**
   * Defines the field error.
   */
  const setError = useCallback((name: string, error: Error): void => {
    dispatch({ type: ACTION_SET_ERROR, data: { error, name } });
  }, []);

  /**
   * Defines several field errors.
   */
  const setErrors = useCallback((errors: FormErrors): void => {
    dispatch({ type: ACTION_SET_ERRORS, data: { errors } });
  }, []);

  /**
   * Validates a field value.
   */
  const validateField = useCallback((name: string, value?: unknown): Promise<void | Error | undefined> => {
    if (typeof validateFieldRef.current === 'function') {
      try {
        const result = validateFieldRef.current(name, value, state.values);

        if (result != null && result instanceof Promise) {
          return result;
        }
        return Promise.resolve(result);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve(undefined);
  }, [state.values]);

  /**
   * Validates one or more fields by passing field names or names and values.
   */
  const validateFields = useCallback((fieldsOrFieldsAndValues: string[] | Partial<T>): Promise<void | FormErrors> => {
    const errors: FormErrors = {};
    const promises: Promise<[string, void | Error | undefined]>[] = [];

    if (fieldsOrFieldsAndValues instanceof Array) {
      fieldsOrFieldsAndValues.forEach((name: string): void => {
        promises.push(
          validateField(name, getValue(name))
            .then((error) => [name, error]),
        );
      });
    } else {
      Object.entries(fieldsOrFieldsAndValues).forEach(([name, value]): void => {
        promises.push(
          validateField(name, value)
            .then((error) => [name, error]),
        );
      });
    }

    return Promise.all(promises)
      .then((results) => {
        results.forEach(([name, error]) => {
          if (error != null) {
            errors[name] = error;
          }
        });
      })
      .catch((error) => {
        dispatch({ type: ACTION_VALIDATE_FAIL, error });
      })
      .finally(() => {
        setErrors(errors);
      });
  }, [getValue, setErrors, validateField]);

  const debouncedValidateFields = useDebouncePromise(validateFields, validateDelay);

  /**
   * Defines several field values (use initValues() to set all form values).
   */
  const setValues = useCallback((values: Fields): void => {
    let mutation = { ...values };
    if (onChange) {
      let nextValues = clone(state.values) || {};
      Object.entries(mutation).forEach(([name, value]) => {
        nextValues = build(name, value, nextValues);
      });
      // Allow changing values on the fly
      mutation = onChange ? onChange(mutation, nextValues) : mutation;
    }
    dispatch({ type: ACTION_SET_VALUES, data: { values: mutation } });
    debouncedValidateFields(mutation);
  }, [debouncedValidateFields, onChange, state.values]);

  /**
   * Defines the value of a field.
   */
  const setValue = useCallback((name: string, value?: unknown): void => {
    setValues({ [name]: value });
  }, [setValues]);

  /**
   * Resets form values.
   */
  const reset = useCallback((fieldNames?: string[]): void => {
    if (fieldNames) {
      dispatch({ type: ACTION_RESET_VALUES, data: { fieldNames } });
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
      dispatch({ type: ACTION_SUBMIT_FAIL, error });
      return Promise.reject(error);
    }
    dispatch({ type: ACTION_SUBMIT });
    const promise: Promise<R> = onSubmitRef.current(clone<T>(state.values));

    if (!(promise instanceof Promise)) {
      throw new Error('onSubmit must return a Promise');
    }
    return promise
      .then((result: R): R => {
        dispatch({ type: ACTION_SUBMIT_SUCCESS, data: { result } });
        return result;
      })
      .catch((error: Error): void => {
        dispatch({ type: ACTION_SUBMIT_FAIL, error });
      });
  }, [state.values]);

  const debouncedSubmit = useDebouncePromise<R>(submit, submitDelay);

  /**
   * Validates form values.
   */
  const validate = useCallback((): Promise<void | FormErrors> => {
    // todo tells when the submission will follow the validation
    //  see comment in ACTION_VALIDATED case of formReducer.js
    dispatch({ type: ACTION_VALIDATE });

    let promise;

    if (typeof validateRef.current === 'function') {
      if (!state.values) {
        const error = new Error('Nothing to validate, values are empty');
        dispatch({ type: ACTION_VALIDATE_FAIL, error });
        return Promise.reject(error);
      }
      promise = validateRef.current(clone(state.values), { ...state.modifiedFields });

      if (!(promise instanceof Promise)) {
        throw new Error(`validate() must return a Promise`);
      }
    } else {
      // Validation is not set, so we don't return any errors to let normal form submission happen.
      promise = Promise.resolve<FormErrors>({});
    }

    return promise
      .then((errors) => {
        if (typeof errors === 'object' && errors !== null && Object.keys(errors).length > 0) {
          setErrors(errors);
        } else {
          dispatch({ type: ACTION_VALIDATE_SUCCESS });
        }
        return errors;
      })
      .catch((error) => {
        dispatch({ type: ACTION_VALIDATE_FAIL, error });
      });
  }, [setErrors, state.modifiedFields, state.values]);

  /**
   * Validates if necessary and submits form.
   * todo disable form during validation and submission without re-enabling it between both,
   *  from: validate:disabled => validated:enabled => submit:disabled => submitted:enabled
   *  to: validate:disabled => validated => submit => submitted:enabled
   */
  const validateAndSubmit = useCallback((): Promise<void | R> => (
    !state.validated
      ? validate().then((errors) => {
        if (!errors || (typeof errors === 'object' && Object.keys(errors).length === 0)) {
          return debouncedSubmit();
        }
        return undefined;
      })
      : debouncedSubmit()
  ), [debouncedSubmit, state.validated, validate]);

  /**
   * Handles change of field value.
   */
  const handleChange = useCallback((
    event: React.FormEvent<FieldElement>,
    options: FieldChangeOptions,
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
    reset();
  }, [reset]);

  /**
   * Handles form submit.
   */
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    validateAndSubmit();
  }, [validateAndSubmit]);

  // Load initial values using a function.
  useEffect(() => {
    let mounted = true;
    if (typeof onLoad === 'function') {
      dispatch({ type: ACTION_LOAD });
      onLoad()
        .then((result) => {
          if (mounted) {
            initValues(result);
            dispatch({ type: ACTION_LOAD_SUCCESS, data: { values: result } });
          }
        })
        .catch((error) => {
          dispatch({ type: ACTION_LOAD_FAIL, error });
        });
    }
    return () => {
      mounted = false;
    };
  }, [initValues, onLoad]);

  useEffect((): void => {
    onInitializeFieldRef.current = onInitializeField;
  }, [onInitializeField]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

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

  return useMemo(() => ({
    ...state,
    invalidClass,
    modifiedClass,
    validClass,
    clearErrors,
    getAttributes,
    getInitialValue,
    getValue,
    handleChange,
    handleReset,
    handleSubmit,
    initValues,
    remove,
    reset,
    setError,
    setErrors,
    setValue,
    setValues,
    submit: validateAndSubmit,
    validate,
    validateField,
    validateFields,
  }), [state, invalidClass, modifiedClass, validClass, clearErrors, getAttributes, getInitialValue, getValue,
    handleChange, handleReset, handleSubmit, initValues, remove, reset, setError, setErrors, setValue, setValues,
    validateAndSubmit, validate, validateField, validateFields]);
}

export default useForm;
