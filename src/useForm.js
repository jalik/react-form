/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import reducer, {
  ACTION_INIT_VALUES,
  ACTION_LOAD,
  ACTION_LOAD_ERROR,
  ACTION_LOADED,
  ACTION_REMOVE,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERROR,
  ACTION_SET_ERRORS,
  ACTION_SET_VALUES,
  ACTION_SUBMIT,
  ACTION_SUBMIT_ERROR,
  ACTION_SUBMITTED,
  ACTION_VALIDATE,
  ACTION_VALIDATE_ERROR,
  ACTION_VALIDATED,
} from './reducer';
import useDebouncePromise from './useDebouncePromise';
import {
  clone,
  getSelectedValues,
  isElementWithArrayValue,
  parseInputValue,
  resolve,
} from './utils';

/**
 * Returns utils to manage form state.
 * @param {boolean} disabled
 * @param {Object} initialValues
 * @param {string} invalidClass
 * @param {string} modifiedClass
 * @param {boolean} nullify
 * @param {function} onChange
 * @param {function} onInitializeField
 * @param {function} onLoad
 * @param {function} onSubmit
 * @param {function} onValidate
 * @param {function} onValidateField
 * @param {number} submitDelay
 * @param {string} validClass
 * @param {number} validateDelay
 * @throws {Error}
 * @return {{
 *   disabled: boolean,
 *   errors: Object,
 *   getAttributes: function,
 *   getInitialValue: function,
 *   getValue: function,
 *   handleChange: function,
 *   handleReset: function,
 *   handleSubmit: function,
 *   initValues: function,
 *   initialized: boolean,
 *   invalidClass: string,
 *   loadError: Error|null,
 *   loaded: boolean,
 *   loading: boolean,
 *   modified: boolean,
 *   modifiedClass: string,
 *   modifiedFields: Object,
 *   remove: function,
 *   reset: function,
 *   setError: function,
 *   setErrors: function,
 *   setValue: function,
 *   setValues: function,
 *   submit: function,
 *   submitCount: number,
 *   submitError: Error|null,
 *   submitResult: Object|null,
 *   submitted: boolean,
 *   submitting: boolean,
 *   validClass: string,
 *   validate: function,
 *   validateError: Error|null,
 *   validateFields: function,
 *   validated: boolean,
 *   validating: boolean
 *   values: Object,
 *  }}
 */
function useForm(
  {
    disabled = false,
    initialValues,
    invalidClass = 'field-invalid',
    modifiedClass = 'field-modified',
    nullify = false,
    onChange,
    onInitializeField,
    onLoad,
    onSubmit,
    onValidate,
    onValidateField,
    submitDelay = 100,
    validClass = 'field-valid',
    validateDelay = 200,
  },
) {
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
  if (typeof onValidate !== 'undefined' && typeof onValidate !== 'function') {
    throw new Error('onValidate must be a function');
  }
  if (typeof onValidateField !== 'undefined' && typeof onValidateField !== 'function') {
    throw new Error('onValidateField function');
  }

  // Defines function references.
  const onInitializeFieldRef = useRef(onInitializeField);
  const onSubmitRef = useRef(onSubmit);
  const onValidateFieldRef = useRef(onValidateField);
  const onValidateRef = useRef(onValidate);

  // Defines the form state.
  const isInitialized = typeof initialValues !== 'undefined' && initialValues !== null;
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(() => ({
      // Disables fields if default values are undefined.
      disabled: disabled || !isInitialized,
      errors: {},
      initialized: isInitialized,
      initialValues: initialValues || {},
      invalidClass,
      loadError: null,
      loaded: false,
      loading: typeof onLoad === 'function',
      modified: false,
      modifiedClass,
      modifiedFields: {},
      submitCount: 0,
      submitError: null,
      submitted: false,
      submitting: false,
      validClass,
      validateError: null,
      validated: false,
      validating: false,
      values: clone(initialValues || {}),
    }), [disabled, initialValues, invalidClass, isInitialized, modifiedClass, onLoad, validClass]),
    undefined,
  );

  /**
   * Returns attributes of a field.
   * @param {string} name
   * @param {Object} defaultAttributes
   */
  const getAttributes = useCallback((name, defaultAttributes = {}) => (
    typeof onInitializeFieldRef.current === 'function'
      ? onInitializeFieldRef.current(name)
      : defaultAttributes
  ), []);

  /**
   * Returns the initial value of a field.
   * @param {string} name
   * @return {*}
   */
  const getInitialValue = useCallback((name) => (
    resolve(name, clone(state.initialValues))
  ), [state.initialValues]);

  /**
   * Returns a copy of field value.
   * @param {string} name
   * @param {*} defaultValue
   * @return {*}
   */
  const getValue = useCallback((name, defaultValue = undefined) => {
    const value = resolve(name, clone(state.values));
    return typeof value !== 'undefined' ? value : defaultValue;
  }, [state.values]);

  /**
   * Defines initial values (after loading for example).
   * @param {Object} values
   */
  const initValues = useCallback((values) => {
    dispatch({ type: ACTION_INIT_VALUES, data: { values } });
  }, [dispatch]);

  /**
   * Removes a field.
   * @param {string} name
   */
  const remove = useCallback((name) => {
    dispatch({ type: ACTION_REMOVE, data: { name } });
  }, []);

  /**
   * Defines the field error.
   * @param {string} name
   * @param {Object} error
   */
  const setError = useCallback((name, error) => {
    dispatch({ type: ACTION_SET_ERROR, data: { error, name } });
  }, []);

  /**
   * Defines several field errors.
   * @param {Object} errors
   */
  const setErrors = useCallback((errors) => {
    dispatch({ type: ACTION_SET_ERRORS, data: { errors } });
  }, []);

  /**
   * Validates a field value.
   * @type {(function(*, *): (Promise))|*}
   */
  const validateField = useCallback((name, value) => {
    if (typeof onValidateFieldRef.current === 'function') {
      try {
        const result = onValidateFieldRef.current(value, name, state.values);

        if (result != null && result instanceof Promise) {
          return result;
        }
        return Promise.resolve(result);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve(null);
  }, [state.values]);

  /**
   * Validates one or more fields by passing field names or names and values.
   * @param {Object}
   */
  const validateFields = useCallback((fieldsOrFieldsAndValues) => {
    const errors = {};
    const promises = [];

    if (fieldsOrFieldsAndValues instanceof Array) {
      fieldsOrFieldsAndValues.forEach((name) => {
        promises.push(
          validateField(name, getValue(name))
            .then((error) => [name, error]),
        );
      });
    } else {
      Object.entries(fieldsOrFieldsAndValues).forEach(([name, value]) => {
        promises.push(
          validateField(name, value)
            .then((error) => [name, error]),
        );
      });
    }

    Promise.all(promises)
      .then((results) => {
        results.forEach(([name, error]) => {
          if (error != null) {
            errors[name] = error;
          }
        });
      })
      .catch((error) => {
        dispatch({ type: ACTION_VALIDATE_ERROR, error });
      })
      .finally(() => {
        setErrors(errors);
      });
  }, [getValue, setErrors, validateField]);

  const debouncedValidateFields = useDebouncePromise(validateFields, validateDelay);

  /**
   * Defines the value of a field.
   * @param {string} name
   * @param {*} value
   */
  const setValue = useCallback((name, value) => {
    let mutation = { [name]: value };
    if (onChange) {
      const nextValues = { ...state.values, ...mutation };
      mutation = onChange ? onChange(mutation, nextValues) : mutation;
    }
    dispatch({ type: ACTION_SET_VALUES, data: { values: mutation } });
    debouncedValidateFields(mutation);
  }, [debouncedValidateFields, onChange, state.values]);

  /**
   * Defines several field values (use initValues() to set all form values).
   * @param {Object} values
   */
  const setValues = useCallback((values) => {
    let mutation = { ...values };
    if (onChange) {
      const nextValues = { ...state.values, ...mutation };
      mutation = onChange ? onChange(mutation, nextValues) : mutation;
    }
    dispatch({ type: ACTION_SET_VALUES, data: { values: mutation } });
    debouncedValidateFields(mutation);
  }, [debouncedValidateFields, onChange, state.values]);

  /**
   * Resets form values.
   * @param {string[]} fields names
   */
  const reset = useCallback((fieldNames = undefined) => {
    if (fieldNames) {
      dispatch({ type: ACTION_RESET_VALUES, data: { fieldNames } });
    } else {
      dispatch({ type: ACTION_RESET });
    }
  }, []);

  /**
   * Submits form.
   * @return {Promise}
   */
  const submit = useCallback(() => {
    dispatch({ type: ACTION_SUBMIT });
    const promise = onSubmitRef.current(clone(state.values));

    if (!(promise instanceof Promise)) {
      throw new Error('onSubmit must return a Promise');
    }
    return promise.then((result) => {
      dispatch({ type: ACTION_SUBMITTED, data: { result } });
      return result;
    }).catch((error) => {
      dispatch({ type: ACTION_SUBMIT_ERROR, error });
    });
  }, [state.values]);

  const debouncedSubmit = useDebouncePromise(submit, submitDelay);

  /**
   * Validates form values.
   * @return {Promise}
   */
  const validate = useCallback(() => {
    // todo tells when the submission will follow the validation
    //  see comment in ACTION_VALIDATED case of formReducer.js
    dispatch({ type: ACTION_VALIDATE });

    let promise;

    if (typeof onValidateRef.current === 'function') {
      promise = onValidateRef.current(clone(state.values), clone(state.modifiedFields));

      if (!(promise instanceof Promise)) {
        throw new Error('onValidate() must return a Promise');
      }
    } else {
      // Validation is not set, so we don't return any errors to let normal form submission happen.
      promise = new Promise((resolve1) => { resolve1({}); });
    }

    return promise.then((errors) => {
      if (typeof errors === 'object' && errors !== null && Object.keys(errors).length > 0) {
        setErrors(errors);
      } else {
        dispatch({ type: ACTION_VALIDATED });
      }
      return errors;
    }).catch((error) => {
      dispatch({ type: ACTION_VALIDATE_ERROR, error });
    });
  }, [setErrors, state.modifiedFields, state.values]);

  /**
   * Validates if necessary and submits form.
   * todo disable form during validation and submission without re-enabling it between both,
   *  from: validate:disabled => validated:enabled => submit:disabled => submitted:enabled
   *  to: validate:disabled => validated => submit => submitted:enabled
   * @return {Promise}
   */
  const validateAndSubmit = useCallback(() => (
    !state.validated ? validate().then((errors) => {
      if (!errors || (typeof errors === 'object' && Object.keys(errors).length === 0)) {
        return debouncedSubmit();
      }
      return null;
    }) : debouncedSubmit()
  ), [debouncedSubmit, state.validated, validate]);

  /**
   * Handles change of field value.
   * @param {Event} event
   * @param {{parser: function}} options
   */
  const handleChange = useCallback((event, options) => {
    const { parser } = options || {};
    const { target } = event;
    const { name, type } = target;
    let value;

    // Parses value using a custom parser or using the native parser (smart typing).
    let parsedValue = typeof parser === 'function'
      ? parser(target.value, target)
      : parseInputValue(target);

    // Replaces empty string with null.
    if (parsedValue === '' && nullify) {
      parsedValue = null;
    }

    // Handles array value (checkboxes, select-multiple).
    if (isElementWithArrayValue(target.form.elements[name])) {
      let array;

      if (target.multiple) {
        array = getSelectedValues(target);
      } else {
        array = getValue(name, []);

        if (target.checked) {
          array.push(parsedValue);
        } else {
          array.splice(array.indexOf(parsedValue), 1);
        }
      }
      value = array;
    } else if (type === 'checkbox') {
      if (typeof parsedValue === 'boolean') {
        // Checkbox is unique and handles a boolean value.
        value = target.checked ? parsedValue : !parsedValue;
      } else {
        // Checkbox is unique and handles any value different of boolean.
        value = target.checked ? parsedValue : undefined;
      }
    } else {
      value = parsedValue;
    }
    setValue(name, value);
  }, [getValue, nullify, setValue]);

  /**
   * Handles form reset.
   * @param {Event} event
   */
  const handleReset = useCallback((event) => {
    event.preventDefault();
    reset();
  }, [reset]);

  /**
   * Handles form submit.
   * @param {Event} event
   */
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    validateAndSubmit();
  }, [validateAndSubmit]);

  useEffect(() => {
    onInitializeFieldRef.current = onInitializeField;
  }, [onInitializeField]);

  // Load initial values using a function.
  useEffect(() => {
    let mounted = true;
    if (typeof onLoad === 'function') {
      dispatch({ type: ACTION_LOAD });
      onLoad()
        .then((result) => {
          if (mounted) {
            initValues(result);
            dispatch({ type: ACTION_LOADED, data: { values: result } });
          }
        })
        .catch((error) => {
          dispatch({ type: ACTION_LOAD_ERROR, error });
        });
    }
    return () => {
      mounted = false;
    };
  }, [initValues, onLoad]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    onValidateFieldRef.current = onValidateField;
  }, [onValidateField]);

  useEffect(() => {
    onValidateRef.current = onValidate;
  }, [onValidate]);

  useEffect(() => {
    if (initialValues && !state.initialized) {
      initValues(initialValues);
    }
  }, [initValues, initialValues, state.initialized]);

  return useMemo(() => ({
    ...clone(state),
    invalidClass,
    modifiedClass,
    validClass,
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
    validateFields,
  }), [
    state, invalidClass, modifiedClass, validClass, getAttributes,
    getInitialValue, getValue, handleChange, handleReset, handleSubmit,
    initValues, remove, reset, setError, setErrors, setValue, setValues,
    validateAndSubmit, validate, validateFields,
  ]);
}

export default useForm;
