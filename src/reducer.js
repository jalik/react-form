/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import {
  build,
  clone,
  resolve,
} from './utils';

export const ACTION_CLEAR_ERRORS = 'CLEAR_ERRORS';
export const ACTION_INIT_VALUES = 'INIT_VALUES';
export const ACTION_LOAD = 'LOAD';
export const ACTION_LOAD_ERROR = 'LOAD_ERROR';
export const ACTION_LOADED = 'LOADED';
export const ACTION_REMOVE = 'REMOVE';
export const ACTION_RESET = 'RESET';
export const ACTION_RESET_VALUES = 'RESET_VALUES';
export const ACTION_SET_ERROR = 'SET_ERROR';
export const ACTION_SET_ERRORS = 'SET_ERRORS';
export const ACTION_SET_VALUES = 'SET_VALUES';
export const ACTION_SUBMIT = 'SUBMIT';
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR';
export const ACTION_SUBMITTED = 'SUBMITTED';
export const ACTION_VALIDATE = 'VALIDATE';
export const ACTION_VALIDATE_ERROR = 'VALIDATE_ERROR';
export const ACTION_VALIDATED = 'VALIDATED';

const initialState = {
  disabled: false,
  errors: {},
  initialized: true,
  initialValues: null,
  loadError: null,
  loaded: false,
  loading: false,
  modified: false,
  modifiedFields: {},
  submitCount: 0,
  submitError: null,
  submitResult: null,
  submitted: false,
  submitting: false,
  validateError: null,
  validated: false,
  validating: false,
  values: {},
};

/**
 * Form reducers.
 * @param {Object} current
 * @param {Object} action
 * @throws {Error}
 * @return {{
 *   disabled: boolean,
 *   errors: Object,
 *   hasError: boolean,
 *   initialized: boolean,
 *   initialValues: Object,
 *   loadError: Error|null,
 *   loaded: boolean,
 *   loading: boolean,
 *   modified: boolean,
 *   modifiedFields: Object,
 *   submitCount: number,
 *   submitError: Error|null,
 *   submitResult: Object|null,
 *   submitted: boolean,
 *   submitting: boolean,
 *   validateError: Error|null,
 *   validated: boolean,
 *   validating: boolean,
 *   values: Object,
 * }}
 */
function reducer(current, { data, error, type }) {
  let state;

  switch (type) {
    case ACTION_CLEAR_ERRORS:
      state = {
        ...current,
        errors: {},
      };
      break;

    case ACTION_INIT_VALUES:
      state = {
        ...initialState,
        disabled: false,
        initialized: true,
        initialValues: clone(data.values),
        values: data.values,
      };
      break;

    case ACTION_LOAD:
      state = {
        ...current,
        loadError: null,
        loaded: false,
        loading: true,
      };
      break;

    case ACTION_LOAD_ERROR:
      state = {
        ...current,
        loadError: error,
        loaded: false,
        loading: false,
      };
      break;

    case ACTION_LOADED:
      state = {
        ...initialState,
        initialized: true,
        initialValues: clone(data.values),
        loadError: null,
        loaded: true,
        loading: false,
        values: data.values,
      };
      break;

    case ACTION_RESET:
      if (current.validating) {
        console.warn('Reset form ignored during validation.');
        return current;
      }
      state = {
        ...current,
        values: clone(current.initialValues),
        // Reset form state.
        errors: {},
        modified: false,
        modifiedFields: {},
        submitCount: 0,
        submitError: null,
        submitResult: null,
        submitted: false,
        submitting: false,
        validateError: null,
        validated: false,
        validating: false,
      };
      break;

    case ACTION_RESET_VALUES: {
      if (current.validating) {
        console.warn('Reset form ignored during validation.');
        return current;
      }
      const modifiedFields = clone(current.modifiedFields);
      const errors = clone(current.errors);
      const initialValues = clone(current.initialValues);
      let values = clone(current.values);

      data.fieldNames.forEach((name) => {
        values = build(name, resolve(name, initialValues), values);
        delete modifiedFields[name];
        delete errors[name];
      });

      state = {
        ...current,
        values,
        errors,
        modified: Object.keys(modifiedFields).length > 0,
        modifiedFields,
        // Reset form state.
        submitCount: 0,
        submitError: null,
        submitResult: null,
        submitted: false,
        submitting: false,
        validateError: null,
        validated: false,
        validating: false,
      };
      break;
    }

    case ACTION_SET_ERROR:
      state = {
        ...current,
        errors: { ...current.errors, [data.name]: data.error },
        validated: false,
        validating: false,
        disabled: false,
      };
      break;

    case ACTION_SET_ERRORS: {
      const errors = clone(current.errors);

      Object.keys(data.errors).forEach((name) => {
        errors[name] = data.errors[name];
      });

      state = {
        ...current,
        errors,
        validated: false,
        validating: false,
        disabled: false,
      };
      break;
    }

    case ACTION_SET_VALUES: {
      const modifiedFields = clone(current.modifiedFields);
      const errors = clone(current.errors);
      let values = clone(current.values);

      Object.keys(data.values).forEach((name) => {
        values = build(name, data.values[name], values);
        modifiedFields[name] = data.values[name] !== resolve(name, current.initialValues);
        delete errors[name];
      });

      state = {
        ...current,
        values,
        modified: true,
        submitted: false,
        // Invalidate form.
        validated: false,
        // Reset submit count.
        submitCount: 0,
        submitError: null,
        // Add fields to changes.
        modifiedFields,
        // Clear fields error.
        errors,
      };
      break;
    }

    case ACTION_SUBMIT:
      state = {
        ...current,
        submitting: true,
        // Disable fields when submitting form.
        disabled: true,
        // Reset previous form submitting result.
        submitError: null,
        submitResult: null,
      };
      break;

    case ACTION_SUBMIT_ERROR:
      state = {
        ...current,
        disabled: false,
        submitCount: current.submitCount + 1,
        submitError: error,
        submitting: false,
      };
      break;

    case ACTION_SUBMITTED:
      state = {
        ...current,
        submitResult: data.result,
        submitted: true,
        submitCount: 0,
        submitError: null,
        // Re-enable form after submitting.
        disabled: false,
        // Reset form state.
        modified: false,
        modifiedFields: {},
        submitting: false,
      };
      break;

    // fixme see how to keep errors and modifiedFields when an array field is moved to another index
    //  solution: handle array operations (append, prepend...) in reducer.
    case ACTION_REMOVE: {
      const modifiedFields = { ...current.modifiedFields };
      const errors = { ...current.errors };
      const values = clone(current.values);

      if (typeof modifiedFields[data.name] !== 'undefined') {
        delete modifiedFields[data.name];
      }
      if (typeof errors[data.name] !== 'undefined') {
        delete errors[data.name];
      }
      if (typeof resolve(data.name, current.values) !== 'undefined') {
        build(data.name, undefined, current.values);
      }
      state = {
        ...current,
        modifiedFields,
        errors,
        values,
      };
      break;
    }

    case ACTION_VALIDATE:
      state = {
        ...current,
        validating: true,
        validated: false,
        // Disable form.
        disabled: true,
      };
      break;

    case ACTION_VALIDATE_ERROR:
      state = {
        ...current,
        validating: false,
        validateError: error,
        disabled: false,
      };
      break;

    case ACTION_VALIDATED:
      state = {
        ...current,
        validated: true,
        validating: false,
        validateError: null,
        // todo let form disabled if submission planned after validation
        disabled: false,
        errors: {},
      };
      break;

    default:
      throw new Error(`Unknown reducer action type "${type}"`);
  }
  return {
    ...state,
    hasError: Object.keys(state.errors).length > 0,
  };
}

export default reducer;
