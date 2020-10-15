/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
 */

import {
  build,
  clone,
  resolve,
} from './utils';

export const ACTION_INIT_VALUES = 'INIT_VALUES';
export const ACTION_REMOVE = 'REMOVE';
export const ACTION_RESET = 'RESET';
export const ACTION_RESET_VALUES = 'RESET_VALUES';
export const ACTION_SET_ERROR = 'SET_ERROR';
export const ACTION_SET_ERRORS = 'SET_ERRORS';
export const ACTION_SET_VALUE = 'SET_VALUE';
export const ACTION_SET_VALUES = 'SET_VALUES';
export const ACTION_SUBMIT = 'SUBMIT';
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR';
export const ACTION_SUBMITTED = 'SUBMITTED';
export const ACTION_VALIDATE = 'VALIDATE';
export const ACTION_VALIDATE_ERROR = 'VALIDATE_ERROR';
export const ACTION_VALIDATED = 'VALIDATED';

/**
 * Form reducers.
 * @param {Object} current
 * @param {Object} action
 * @throws {Error}
 * @return {{
 *   disabled: boolean,
 *   errors: Object,
 *   initialized: boolean,
 *   initialValues: Object,
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
    case ACTION_INIT_VALUES:
      state = {
        ...current,
        initialized: true,
        initialValues: clone(data.values),
        values: data.values,
        // Enable form.
        disabled: false,
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

    case ACTION_RESET:
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
      const modifiedFields = clone(current.modifiedFields);
      const errors = clone(current.errors);
      const initialValues = clone(current.initialValues);
      let values = clone(current.values);

      data.fieldNames.forEach((name) => {
        values = build(name, resolve(name, initialValues), values);
        modifiedFields[name] = undefined;
        errors[name] = undefined;
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

    case ACTION_SET_VALUE: {
      state = {
        ...current,
        values: build(data.name, data.value, clone(current.values)),
        modified: true,
        submitted: false,
        // Invalidate form.
        validated: false,
        // Reset submit count.
        submitCount: 0,
        submitError: null,
        // Update changed fields.
        modifiedFields: {
          ...current.modifiedFields,
          [data.name]: data.value !== resolve(data.name, current.initialValues),
        },
        // Clear field error.
        errors: {
          ...current.errors,
          [data.name]: undefined,
        },
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
        errors[name] = undefined;
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
        // Replace initial values when form is submitted.
        initialValues: clone(current.values),
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
  return state;
}

export default reducer;
