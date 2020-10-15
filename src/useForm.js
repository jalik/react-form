/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
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
  ACTION_REMOVE,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERROR,
  ACTION_SET_ERRORS,
  ACTION_SET_VALUE,
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
 *   changes: Object,
 *   disabled: boolean,
 *   errors: Object,
 *   initialized: boolean,
 *   invalidClass: string,
 *   modified: boolean,
 *   modifiedClass: string,
 *   submitCount: number,
 *   submitError: Error|null,
 *   submitResult: Object|null,
 *   submitted: boolean,
 *   submitting: boolean,
 *   validClass: string,
 *   validateError: Error|null,
 *   validated: boolean,
 *   validating: boolean
 *   values: Object,
 *   getAttributes: function,
 *   getInitialValue: function,
 *   getValue: function,
 *   handleChange: function,
 *   handleReset: function,
 *   handleSubmit: function,
 *   initValues: function,
 *   remove: function,
 *   reset: function,
 *   setError: function,
 *   setErrors: function,
 *   setValue: function,
 *   setValues: function,
 *   submit: function,
 *   validate: function
 *  }}
 */
function useForm(
  {
    disabled = false,
    initialValues,
    invalidClass = 'field-invalid',
    modifiedClass = 'field-modified',
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
  const onLoadRef = useRef(onLoad);
  const onSubmitRef = useRef(onSubmit);
  const onValidateFieldRef = useRef(onValidateField);
  const onValidateRef = useRef(onValidate);

  // Defines the form state.
  const isInitialized = typeof initialValues !== 'undefined' && initialValues !== null;
  const [state, dispatch] = useReducer(reducer, {
    changes: {},
    // Disables fields if default values are undefined.
    disabled: disabled || !isInitialized,
    errors: {},
    initialized: isInitialized,
    initialValues: initialValues || {},
    invalidClass,
    modified: false,
    modifiedClass,
    submitCount: 0,
    submitError: null,
    submitted: false,
    submitting: false,
    validClass,
    validateError: null,
    validated: false,
    validating: false,
    values: clone(initialValues || {}),
  }, undefined);

  // Optimizes cloned variables.
  const clonedChanges = useMemo(() => clone(state.changes), [state.changes]);
  const clonedErrors = useMemo(() => clone(state.errors), [state.errors]);
  const clonedInitialValues = useMemo(() => clone(state.initialValues), [state.initialValues]);
  const clonedValues = useMemo(() => clone(state.values), [state.values]);

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
    resolve(name, clonedInitialValues)
  ), [clonedInitialValues]);

  /**
   * Returns a copy of field value.
   * @param {string} name
   * @param {*} defaultValue
   * @return {*}
   */
  const getValue = useCallback((name, defaultValue) => {
    const value = resolve(name, clonedValues);
    return typeof value !== 'undefined' ? value : defaultValue;
  }, [clonedValues]);

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
   * Validates one or more fields values.
   * @param {Object}
   */
  const validateValues = useCallback((fields) => {
    const errors = {};
    const promises = [];

    Object.keys(fields).forEach((name) => {
      // Validates field value.
      if (typeof onValidateFieldRef.current === 'function') {
        try {
          const result = onValidateFieldRef.current(fields[name], name, state.values);

          // Asynchronous validation by catching promise error.
          if (typeof result !== 'undefined' && result instanceof Promise) {
            promises.push(result);
            result.then((error) => {
              errors[name] = error;
            }).catch((error) => {
              dispatch({ type: ACTION_VALIDATE_ERROR, error });
            });
          }
        } catch (error) {
          // Synchronous validation by catching error.
          errors[name] = error;
        }
      }
    });

    // Updates errors.
    Promise.all(promises).finally(() => {
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
      }
    });
  }, [setErrors, state.values]);

  const debouncedValidateValues = useDebouncePromise(validateValues, validateDelay);

  /**
   * Defines the value of a field.
   * @param {string} name
   * @param {*} value
   */
  const setValue = useCallback((name, value) => {
    dispatch({ type: ACTION_SET_VALUE, data: { name, value } });
    debouncedValidateValues({ [name]: value });
  }, [debouncedValidateValues]);

  /**
   * Defines several field values (use initValues() to set all form values).
   * @param {Object} values
   */
  const setValues = useCallback((values) => {
    dispatch({ type: ACTION_SET_VALUES, data: { values } });
    debouncedValidateValues(values);
  }, [debouncedValidateValues]);

  /**
   * Resets form values.
   * @param {string[]} fields names
   */
  const reset = useCallback((fieldNames) => {
    // Prevents form reset during validation.
    if (state.validating) {
      // eslint-disable-next-line no-console
      console.warn('resetting form during validation has been prevented');
    } else if (fieldNames) {
      dispatch({ type: ACTION_RESET_VALUES, data: { fieldNames } });
    } else {
      dispatch({ type: ACTION_RESET });
    }
  }, [state.validating]);

  /**
   * Submits form.
   * @return {Promise}
   */
  const submit = useCallback(() => {
    dispatch({ type: ACTION_SUBMIT });
    const promise = onSubmitRef.current(clonedValues);

    if (!(promise instanceof Promise)) {
      throw new Error('onSubmit must return a Promise');
    }
    return promise.then((result) => {
      dispatch({ type: ACTION_SUBMITTED, data: { result } });
      return result;
    }).catch((error) => {
      dispatch({ type: ACTION_SUBMIT_ERROR, error });
    });
  }, [clonedValues]);

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
      promise = onValidateRef.current(clonedValues, clonedChanges);

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
  }, [clonedChanges, clonedValues, setErrors]);

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
  const handleChange = useCallback((event, { parser }) => {
    const { target } = event;
    const { name, type } = target;
    let value;

    // Parses value using a custom parser or using the native parser (smart typing).
    const parsedValue = typeof parser === 'function'
      ? parser(target.value, target)
      : parseInputValue(target);

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
        // Checkbox is unique and handles any value different than boolean.
        value = target.checked ? parsedValue : undefined;
      }
    } else {
      value = parsedValue;
    }
    setValue(name, value);
  }, [getValue, setValue]);

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

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

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

  return {
    changes: clonedChanges,
    disabled: state.disabled,
    errors: clonedErrors,
    initialized: state.initialized,
    invalidClass,
    modified: state.modified,
    modifiedClass,
    submitCount: state.submitCount,
    submitError: state.submitError,
    submitResult: state.submitResult,
    submitted: state.submitted,
    submitting: state.submitting,
    validClass,
    validateError: state.validateError,
    validated: state.validated,
    validating: state.validating,
    values: clonedValues,
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
  };
}

export default useForm;
