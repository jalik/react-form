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
export const ACTION_REGISTER_FIELD = 'REGISTER_FIELD';
export const ACTION_RESET = 'RESET';
export const ACTION_RESET_VALUES = 'RESET_VALUES';
export const ACTION_SET_ERROR = 'SET_ERROR';
export const ACTION_SET_ERRORS = 'SET_ERRORS';
export const ACTION_SET_VALUE = 'SET_VALUE';
export const ACTION_SET_VALUES = 'SET_VALUES';
export const ACTION_SUBMIT = 'SUBMIT';
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR';
export const ACTION_SUBMITTED = 'SUBMITTED';
export const ACTION_UNREGISTER_FIELD = 'UNREGISTER_FIELD';
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
 *   fields: Object,
 *   initialized: boolean,
 *   initialValues: Object,
 *   modified: boolean,
 *   submitCount: number,
 *   submitError: Error|null,
 *   submitted: boolean,
 *   submitting: boolean,
 *   validateError: Error|null,
 *   validated: boolean,
 *   validating: boolean,
 *   values: Object,
 * }}
 */
function formReducer(current, action) {
  let state;

  switch (action.type) {
    case ACTION_INIT_VALUES:
      state = {
        ...current,
        initialized: true,
        initialValues: clone(action.values),
        values: action.values,
        // Enable form.
        disabled: false,
        // Reset form state.
        changes: {},
        errors: {},
        modified: false,
        submitCount: 0,
        submitError: null,
        submitted: false,
        submitting: false,
        validateError: null,
        validated: false,
        validating: false,
      };
      break;

    case ACTION_REGISTER_FIELD:
      // Ignore registration of already registered fields (radios, checkboxes).
      if (typeof current.fields[action.name] !== 'undefined') {
        return current;
      }
      state = {
        ...current,
        fields: { ...current.fields, [action.name]: action.options },
        // todo add field to changes if it is registered after form initialization
        // changes: { ...current.changes, [action.name]: current.initialValues !== null },
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

      action.values.forEach((name) => {
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
        errors: { ...current.errors, [action.name]: action.error },
        validated: false,
        validating: false,
        disabled: false,
      };
      break;

    case ACTION_SET_ERRORS: {
      const errors = clone(current.errors);

      Object.keys(action.errors).forEach((name) => {
        errors[name] = action.errors[name];
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
        values: build(action.name, action.value, clone(current.values)),
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
          [action.name]: action.value !== resolve(action.name, current.initialValues),
        },
        // Clear field error.
        errors: {
          ...current.errors,
          [action.name]: undefined,
        },
      };
      break;
    }

    case ACTION_SET_VALUES: {
      const changes = clone(current.changes);
      const errors = clone(current.errors);
      let values = clone(current.values);

      Object.keys(action.values).forEach((name) => {
        values = build(name, action.values[name], values);
        changes[name] = action.values[name] !== resolve(name, current.initialValues);
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
      };
      break;

    case ACTION_SUBMIT_ERROR:
      state = {
        ...current,
        disabled: false,
        submitCount: current.submitCount + 1,
        submitError: action.error,
        submitting: false,
      };
      break;

    case ACTION_SUBMITTED:
      state = {
        ...current,
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

    case ACTION_UNREGISTER_FIELD: {
      const changes = { ...current.changes };
      const errors = { ...current.errors };
      const values = clone(current.values);

      if (typeof changes[action.name] !== 'undefined') {
        delete changes[action.name];
      }
      if (typeof errors[action.name] !== 'undefined') {
        delete errors[action.name];
      }
      if (typeof resolve(action.name, current.values) !== 'undefined') {
        build(action.name, undefined, current.values);
      }
      // fixme see how to keep errors and changes when field is moved.
      //  when moved (from an index to another index in an array),
      //  the field is unregistered and registered again.
      //  solution 1: using a garbage collector (remove unregistered items after a delay).
      //  solution 2: handle array operations (append, prepend...) in reducer.

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
        validateError: action.error,
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
      throw new Error(`Unknown reducer action type "${action.type}"`);
  }
  return state;
}

export default formReducer;
