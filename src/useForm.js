/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Karl STEIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import formReducer, {
  ACTION_INIT_VALUES,
  ACTION_LOAD_ERROR,
  ACTION_REGISTER_FIELD,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERROR,
  ACTION_SET_ERRORS,
  ACTION_SET_VALUE,
  ACTION_SET_VALUES,
  ACTION_SUBMIT,
  ACTION_SUBMIT_ERROR,
  ACTION_SUBMITTED,
  ACTION_UNREGISTER_FIELD,
  ACTION_VALIDATE,
  ACTION_VALIDATE_ERROR,
  ACTION_VALIDATED,
} from './formReducer';
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
 *   invalidClass: string,
 *   loadError: Error,
 *   modified: boolean,
 *   modifiedClass: string,
 *   submitCount: number,
 *   submitError: Error|null,
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
 *   register: function,
 *   reset: function,
 *   setError: function,
 *   setErrors: function,
 *   setValue: function,
 *   setValues: function,
 *   submit: function,
 *   unregister: function,
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
  const [state, dispatch] = useReducer(formReducer, {
    changes: {},
    // Disables fields if default values are undefined.
    disabled: disabled || typeof initialValues === 'undefined' || initialValues === null,
    errors: {},
    fields: {},
    initialValues: initialValues || {},
    invalidClass,
    loadError: null,
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
    dispatch({ type: ACTION_INIT_VALUES, values });
  }, [dispatch]);

  /**
   * Registers a field.
   * @param {string} name
   * @param {Object} options
   */
  const register = useCallback((name, options = {}) => {
    // Warns for potential bug when mixing two validation modes.
    if (onValidateFieldRef.current && options.validator) {
      // eslint-disable-next-line no-console
      console.warn(`field "${name}" has a validator and onValidateField is defined`);
    }
    dispatch({ type: ACTION_REGISTER_FIELD, name, options });
  }, []);

  /**
   * Defines the field error.
   * @param {string} name
   * @param {Object} error
   */
  const setError = useCallback((name, error) => {
    dispatch({ type: ACTION_SET_ERROR, error, name });
  }, [dispatch]);

  /**
   * Defines several field errors.
   * @param {Object} errors
   */
  const setErrors = useCallback((errors) => {
    dispatch({ type: ACTION_SET_ERRORS, errors });
  }, [dispatch]);

  /**
   * Validates one or more fields values.
   * @param {Object}
   */
  const validateValues = useCallback((fields) => {
    const errors = {};
    const promises = [];

    Object.keys(fields).forEach((name) => {
      const field = state.fields[name] || {};

      // Uses field validator attribute or onValidateField.
      const validator = field.validator || onValidateFieldRef.current;

      // Validates field value.
      if (typeof validator === 'function') {
        try {
          const result = validator(fields[name], name, state.values);

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
  }, [setErrors, state.fields, state.values]);

  const debouncedValidateValues = useDebouncePromise(validateValues, validateDelay);

  /**
   * Defines the value of a field.
   * @param {string} name
   * @param {*} value
   */
  const setValue = useCallback((name, value) => {
    dispatch({ type: ACTION_SET_VALUE, name, value });
    debouncedValidateValues({ [name]: value });
  }, [debouncedValidateValues]);

  /**
   * Defines several field values (use initValues() to set all form values).
   * @param {Object} values
   */
  const setValues = useCallback((values) => {
    dispatch({ type: ACTION_SET_VALUES, values });
    debouncedValidateValues(values);
  }, [debouncedValidateValues]);

  /**
   * Resets form values.
   * @param {string[]} fields names
   */
  const reset = useCallback((values) => {
    // Prevents form reset during validation.
    if (state.validating) {
      // eslint-disable-next-line no-console
      console.warn('resetting form during validation has been prevented');
    } else if (values) {
      dispatch({ type: ACTION_RESET_VALUES, values });
    } else {
      dispatch({ type: ACTION_RESET });
    }
  }, [state.validating]);

  /**
   * Submits form.
   * @return {Promise}
   */
  const submit = useCallback(() => {
    // Prevents form submission if it is invalid.
    if (!state.validated) {
      // eslint-disable-next-line no-console
      console.warn('submission of invalid form has been prevented');
      return new Promise(((resolve1) => resolve1(false)));
    }
    dispatch({ type: ACTION_SUBMIT });
    const promise = onSubmitRef.current(clonedValues);

    if (!(promise instanceof Promise)) {
      throw new Error('onSubmit must return a Promise');
    }
    return promise.then((result) => {
      dispatch({ type: ACTION_SUBMITTED });
      return result;
    }).catch((error) => {
      dispatch({ type: ACTION_SUBMIT_ERROR, error });
    });
  }, [clonedValues, state.validated]);

  const debouncedSubmit = useDebouncePromise(submit, submitDelay);

  /**
   * Unregisters a field.
   * @param {string} name
   */
  const unregister = useCallback((name) => {
    dispatch({ type: ACTION_UNREGISTER_FIELD, name });
  }, []);

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

  const debouncedValidate = useDebouncePromise(validate, validateDelay);

  /**
   * Validates if necessary and submits form.
   * todo disable form during validation and submission without re-enabling it between both,
   *  from: validate:disabled => validated:enabled => submit:disabled => submitted:enabled
   *  to: validate:disabled => validated => submit => submitted:enabled
   * @return {Promise}
   */
  const validateAndSubmit = useCallback(() => (
    !state.validated ? validate().then((errors) => {
      if (typeof errors === 'object' && errors !== null && Object.keys(errors).length === 0) {
        return debouncedSubmit();
      }
      return null;
    }) : debouncedSubmit()
  ), [debouncedSubmit, state.validated, validate]);

  const debouncedValidateAndSubmit = useDebouncePromise(validateAndSubmit, submitDelay);

  /**
   * Handles change of field value.
   * @param {Event} event
   */
  const handleChange = useCallback((event) => {
    const { target } = event;
    const { name, type } = target;
    const { parser } = state.fields[name] || {};
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
  }, [getValue, setValue, state.fields]);

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
    debouncedValidateAndSubmit();
  }, [debouncedValidateAndSubmit]);

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

  // Loads form initial values.
  useEffect(() => {
    let mounted = true;

    if (onLoad) {
      const promise = onLoad();

      if (!(promise instanceof Promise)) {
        throw new Error('onLoad must return a Promise');
      }
      promise.then((values) => {
        // Do nothing if component has been unmounted.
        if (mounted) initValues(values);
      }).catch((error) => {
        dispatch({ type: ACTION_LOAD_ERROR, error });
      });
    }
    return () => { mounted = false; };
  }, [initValues, onLoad]);

  return {
    changes: clonedChanges,
    disabled: state.disabled,
    errors: clonedErrors,
    invalidClass,
    loadError: state.loadError,
    modified: state.modified,
    modifiedClass,
    submitCount: state.submitCount,
    submitError: state.submitError,
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
    register,
    reset,
    setError,
    setErrors,
    setValue,
    setValues,
    submit: debouncedValidateAndSubmit,
    unregister,
    validate: debouncedValidate,
  };
}

export default useForm;
