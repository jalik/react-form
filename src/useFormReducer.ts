/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { Fields, FormErrors, FormState } from './useForm';
import { build, clone, resolve } from './utils';

export const ACTION_CLEAR_ERRORS = 'CLEAR_ERRORS';
export const ACTION_INIT_VALUES = 'INIT_VALUES';
export const ACTION_LOAD = 'LOAD';
export const ACTION_LOAD_FAIL = 'LOAD_FAIL';
export const ACTION_LOAD_SUCCESS = 'LOAD_SUCCESS';
export const ACTION_REMOVE = 'REMOVE';
export const ACTION_RESET = 'RESET';
export const ACTION_RESET_VALUES = 'RESET_VALUES';
export const ACTION_SET_ERROR = 'SET_ERROR';
export const ACTION_SET_ERRORS = 'SET_ERRORS';
export const ACTION_SET_VALUES = 'SET_VALUES';
export const ACTION_SUBMIT = 'SUBMIT';
export const ACTION_SUBMIT_FAIL = 'SUBMIT_FAIL';
export const ACTION_SUBMIT_SUCCESS = 'SUBMIT_SUCCESS';
export const ACTION_VALIDATE = 'VALIDATE';
export const ACTION_VALIDATE_FAIL = 'VALIDATE_FAIL';
export const ACTION_VALIDATE_SUCCESS = 'VALIDATE_SUCCESS';

const initialState: FormState<Fields, any> = {
  disabled: false,
  errors: {},
  hasError: false,
  initialized: true,
  initialValues: undefined,
  loadError: undefined,
  loaded: false,
  loading: false,
  modified: false,
  modifiedFields: {},
  submitCount: 0,
  submitError: undefined,
  submitResult: undefined,
  submitted: false,
  submitting: false,
  validateError: undefined,
  validated: false,
  validating: false,
  values: undefined,
};

export type FormAction<T, R> =
  { type: 'CLEAR_ERRORS' }
  | { type: 'INIT_VALUES', data: { values: T } }
  | { type: 'LOAD' }
  | { type: 'LOAD_FAIL', error: Error }
  | { type: 'LOAD_SUCCESS', data: { values: T } }
  | { type: 'REMOVE', data: { name: string } }
  | { type: 'RESET' }
  | { type: 'RESET_VALUES', data: { fieldNames: string[] } }
  | { type: 'SET_ERROR', data: { name: string, error: Error } }
  | { type: 'SET_ERRORS', data: { errors: { [key: string]: Error } } }
  | { type: 'SET_VALUES', data: { values: Fields } }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_FAIL', error: Error }
  | { type: 'SUBMIT_SUCCESS', data: { result: R } }
  | { type: 'VALIDATE' }
  | { type: 'VALIDATE_FAIL', error: Error }
  | { type: 'VALIDATE_SUCCESS' }

/**
 * Form reducers.
 */
function useFormReducer<T extends Fields, R>(state: FormState<T, R>, action: FormAction<T, R>): FormState<T, R> {
  let nextState: FormState<T, R>;

  switch (action.type) {
    case ACTION_CLEAR_ERRORS:
      nextState = {
        ...state,
        errors: {},
      };
      break;

    case ACTION_INIT_VALUES: {
      const { data } = action;
      nextState = {
        ...state,
        ...initialState,
        disabled: false,
        initialized: true,
        initialValues: clone(data.values),
        values: data.values,
      };
      break;
    }

    case ACTION_LOAD:
      nextState = {
        ...state,
        disabled: true,
        loadError: undefined,
        loaded: false,
        loading: true,
      };
      break;

    case ACTION_LOAD_FAIL:
      nextState = {
        ...state,
        disabled: false,
        loadError: action.error,
        loaded: false,
        loading: false,
      };
      break;

    case ACTION_LOAD_SUCCESS: {
      const { data } = action;
      nextState = {
        ...state,
        ...initialState,
        disabled: false,
        initialized: true,
        initialValues: clone(data.values),
        loadError: undefined,
        loaded: true,
        loading: false,
        values: data.values,
      };
      break;
    }

    // fixme see how to keep errors and modifiedFields when an array field is moved to another index
    //  solution: handle array operations (append, prepend...) in reducer.
    case ACTION_REMOVE: {
      const { data } = action;
      const modifiedFields = { ...state.modifiedFields };
      const errors = { ...state.errors };
      const values = clone(state.values);

      if (typeof modifiedFields[data.name] !== 'undefined') {
        delete modifiedFields[data.name];
      }
      if (typeof errors[data.name] !== 'undefined') {
        delete errors[data.name];
      }
      if (typeof resolve(data.name, state.values) !== 'undefined') {
        build(data.name, undefined, state.values);
      }
      nextState = {
        ...state,
        modified: Object.keys(modifiedFields).length > 0,
        modifiedFields,
        errors,
        values,
      };
      break;
    }

    case ACTION_RESET:
      if (state.validating) {
        // eslint-disable-next-line no-console
        console.warn('Cannot reset form during validation.');
        return state;
      }
      nextState = {
        ...state,
        values: clone(state.initialValues),
        // Reset form state.
        errors: {},
        modified: false,
        modifiedFields: {},
        submitCount: 0,
        submitError: undefined,
        submitResult: undefined,
        submitted: false,
        submitting: false,
        validateError: undefined,
        validated: false,
        validating: false,
      };
      break;

    case ACTION_RESET_VALUES: {
      if (state.validating) {
        // eslint-disable-next-line no-console
        console.warn('Cannot reset form during validation.');
        return state;
      }
      const modifiedFields = clone(state.modifiedFields);
      const errors = clone(state.errors);
      const initialValues = clone(state.initialValues);
      let values = clone(state.values);

      const { data } = action;
      data.fieldNames.forEach((name: string) => {
        const initialValue = resolve(name, initialValues);
        values = build(name, initialValue, values);
        delete modifiedFields[name];
        delete errors[name];
      });

      nextState = {
        ...state,
        values,
        errors,
        modified: Object.keys(modifiedFields).length > 0,
        modifiedFields,
        // Reset form state.
        submitCount: 0,
        submitError: undefined,
        submitResult: undefined,
        submitted: false,
        submitting: false,
        validateError: undefined,
        validated: false,
        validating: false,
      };
      break;
    }

    case ACTION_SET_ERROR: {
      const { data } = action;
      const errors: FormErrors = {};

      if (data.error != null) {
        errors[data.name] = data.error;
      }
      nextState = {
        ...state,
        errors,
        validated: false,
        validating: false,
        disabled: false,
      };
      break;
    }

    case ACTION_SET_ERRORS: {
      const { data } = action;
      const errors: FormErrors = {};

      Object.keys(data.errors).forEach((name) => {
        errors[name] = data.errors[name];
      });

      nextState = {
        ...state,
        errors,
        validated: false,
        validating: false,
        disabled: false,
      };
      break;
    }

    case ACTION_SET_VALUES: {
      const { data } = action;
      const modifiedFields = clone(state.modifiedFields);
      const errors = clone(state.errors);
      let values = clone(state.values);

      Object.entries(data.values).forEach(([name, value]) => {
        values = build(name, value, values);
        modifiedFields[name] = value !== resolve(name, state.initialValues);
        delete errors[name];
      });

      nextState = {
        ...state,
        values,
        modified: true,
        submitted: false,
        // Invalidate form.
        validated: false,
        // Reset submit count.
        submitCount: 0,
        submitError: undefined,
        // Add fields to changes.
        modifiedFields,
        // Clear fields error.
        errors,
      };
      break;
    }

    case ACTION_SUBMIT:
      nextState = {
        ...state,
        submitting: true,
        // Disable fields when submitting form.
        disabled: true,
        // Reset previous form submitting result.
        submitError: undefined,
        submitResult: undefined,
      };
      break;

    case ACTION_SUBMIT_FAIL:
      nextState = {
        ...state,
        disabled: false,
        submitCount: state.submitCount + 1,
        submitError: action.error,
        submitting: false,
      };
      break;

    case ACTION_SUBMIT_SUCCESS:
      nextState = {
        ...state,
        submitResult: action.data.result,
        submitted: true,
        submitCount: 0,
        submitError: undefined,
        // Re-enable form after submitting.
        disabled: false,
        // Reset form state.
        modified: false,
        modifiedFields: {},
        submitting: false,
      };
      break;

    case ACTION_VALIDATE:
      nextState = {
        ...state,
        validating: true,
        validated: false,
        // Disable form.
        disabled: true,
      };
      break;

    case ACTION_VALIDATE_FAIL:
      nextState = {
        ...state,
        validating: false,
        validateError: action.error,
        disabled: false,
      };
      break;

    case ACTION_VALIDATE_SUCCESS:
      nextState = {
        ...state,
        validated: true,
        validating: false,
        validateError: undefined,
        // todo let form disabled if submission planned after validation
        disabled: false,
        errors: {},
      };
      break;
  }
  return {
    ...nextState,
    hasError: nextState.errors && Object.keys(nextState.errors).length > 0,
  };
}

export default useFormReducer;
