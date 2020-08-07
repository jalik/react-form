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
 *   changes: Object,
 *   disabled: boolean,
 *   errors: Object,
 *   initialized: boolean,
 *   initialValues: Object,
 *   modified: boolean,
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
        changes: {},
        errors: {},
        modified: false,
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
        changes: {},
        errors: {},
        modified: false,
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
      const changes = clone(current.changes);
      const errors = clone(current.errors);
      const initialValues = clone(current.initialValues);
      let values = clone(current.values);

      data.fieldNames.forEach((name) => {
        values = build(name, resolve(name, initialValues), values);
        changes[name] = undefined;
        errors[name] = undefined;
      });

      state = {
        ...current,
        values,
        changes,
        errors,
        modified: Object.keys(changes).length > 0,
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
        changes: {
          ...current.changes,
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
      const changes = clone(current.changes);
      const errors = clone(current.errors);
      let values = clone(current.values);

      Object.keys(data.values).forEach((name) => {
        values = build(name, data.values[name], values);
        changes[name] = data.values[name] !== resolve(name, current.initialValues);
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
        changes,
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
        changes: {},
        modified: false,
        submitting: false,
      };
      break;

    // fixme see how to keep errors and changes when an array field is moved to another index.
    //  solution: handle array operations (append, prepend...) in reducer.
    case ACTION_REMOVE: {
      const changes = { ...current.changes };
      const errors = { ...current.errors };
      const values = clone(current.values);

      if (typeof changes[data.name] !== 'undefined') {
        delete changes[data.name];
      }
      if (typeof errors[data.name] !== 'undefined') {
        delete errors[data.name];
      }
      if (typeof resolve(data.name, current.values) !== 'undefined') {
        build(data.name, undefined, current.values);
      }
      state = {
        ...current,
        changes,
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
