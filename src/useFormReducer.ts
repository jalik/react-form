/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { Errors, FormState, TouchedFields, Values } from './useForm';
import { build, clone, resolve } from './utils';

export const ACTION_CLEAR = 'CLEAR';
export const ACTION_CLEAR_ERRORS = 'CLEAR_ERRORS';
export const ACTION_CLEAR_TOUCH = 'CLEAR_TOUCH';
export const ACTION_INIT_VALUES = 'INIT_VALUES';
export const ACTION_LOAD = 'LOAD';
export const ACTION_LOAD_ERROR = 'LOAD_ERROR';
export const ACTION_LOAD_SUCCESS = 'LOAD_SUCCESS';
export const ACTION_REMOVE = 'REMOVE';
export const ACTION_RESET = 'RESET';
export const ACTION_RESET_VALUES = 'RESET_VALUES';
export const ACTION_SET_ERROR = 'SET_ERROR';
export const ACTION_SET_ERRORS = 'SET_ERRORS';
export const ACTION_SET_VALUES = 'SET_VALUES';
export const ACTION_SUBMIT = 'SUBMIT';
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR';
export const ACTION_SUBMIT_SUCCESS = 'SUBMIT_SUCCESS';
export const ACTION_TOUCH = 'TOUCH';
export const ACTION_VALIDATE = 'VALIDATE';
export const ACTION_VALIDATE_ERROR = 'VALIDATE_ERROR';
export const ACTION_VALIDATE_SUCCESS = 'VALIDATE_SUCCESS';

const initialState: FormState<Values, any> = {
  disabled: false,
  errors: {},
  hasError: false,
  initialized: true,
  initialValues: {},
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
  touched: false,
  touchedFields: {},
  validateError: undefined,
  validated: false,
  validating: false,
  values: {},
};

export type FormAction<V, R> =
  { type: 'CLEAR' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_TOUCH', data: { fieldNames: string[] } }
  | { type: 'INIT_VALUES', data: { values: Partial<V> } }
  | { type: 'LOAD' }
  | { type: 'LOAD_ERROR', error: Error }
  | { type: 'LOAD_SUCCESS', data: { values: Partial<V> } }
  | { type: 'REMOVE', data: { name: string } }
  | { type: 'RESET' }
  | { type: 'RESET_VALUES', data: { fieldNames: string[] } }
  | { type: 'SET_ERROR', data: { name: string, error: Error } }
  | { type: 'SET_ERRORS', data: { errors: Errors } }
  | { type: 'SET_VALUES', data: { values: Values } }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_ERROR', error: Error }
  | { type: 'SUBMIT_SUCCESS', data: { result: R } }
  | { type: 'TOUCH', data: { fieldNames: string[] } }
  | { type: 'VALIDATE' }
  | { type: 'VALIDATE_ERROR', error: Error }
  | { type: 'VALIDATE_SUCCESS' }

/**
 * Form reducers.
 */
function useFormReducer<V extends Values, R>(state: FormState<V, R>, action: FormAction<V, R>): FormState<V, R> {
  let nextState: FormState<V, R>;

  switch (action.type) {
    case ACTION_CLEAR:
      nextState = {
        ...state,
        ...initialState,
        initialValues: {},
        values: {},
      };
      break;
    case ACTION_CLEAR_ERRORS:
      nextState = {
        ...state,
        errors: {},
      };
      break;

    case ACTION_CLEAR_TOUCH: {
      const { data } = action;
      const touchedFields: TouchedFields = { ...state.touchedFields };
      data.fieldNames.forEach((name) => {
        delete touchedFields[name];
      });
      nextState = {
        ...state,
        touched: Object.keys(touchedFields).length > 0,
        touchedFields,
      };
      break;
    }

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

    case ACTION_LOAD_ERROR:
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
      const errors = { ...state.errors };
      const modifiedFields = { ...state.modifiedFields };
      const touchedFields = { ...state.touchedFields };
      const values = clone(state.values);

      if (typeof errors[data.name] !== 'undefined') {
        delete errors[data.name];
      }
      if (typeof modifiedFields[data.name] !== 'undefined') {
        delete modifiedFields[data.name];
      }
      if (typeof touchedFields[data.name] !== 'undefined') {
        delete touchedFields[data.name];
      }
      if (typeof resolve(data.name, state.values) !== 'undefined') {
        build(data.name, undefined, state.values);
      }
      nextState = {
        ...state,
        modified: Object.keys(modifiedFields).length > 0,
        modifiedFields,
        touched: Object.keys(touchedFields).length > 0,
        touchedFields,
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
        ...initialState,
        initialValues: state.initialValues,
        values: clone(state.initialValues),
      };
      break;

    case ACTION_RESET_VALUES: {
      if (state.validating) {
        // eslint-disable-next-line no-console
        console.warn('Cannot reset form during validation.');
        return state;
      }
      const errors = { ...state.errors };
      const modifiedFields = { ...state.modifiedFields };
      const touchedFields = { ...state.touchedFields };
      const initialValues = clone(state.initialValues);
      let values = clone(state.values);

      const { data } = action;
      data.fieldNames.forEach((name: string) => {
        const initialValue = resolve(name, initialValues);
        values = build(name, initialValue, values);
        delete errors[name];
        delete modifiedFields[name];
        delete touchedFields[name];
      });

      nextState = {
        ...state,
        values,
        errors,
        modified: Object.keys(modifiedFields).length > 0,
        modifiedFields,
        touched: Object.keys(touchedFields).length > 0,
        touchedFields,
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
      const errors: Errors = {};

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
      const errors: Errors = {};

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

    case ACTION_SUBMIT_ERROR:
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
        touched: false,
        touchedFields: {},
        submitting: false,
      };
      break;

    case ACTION_TOUCH: {
      const { data } = action;
      const touchedFields: TouchedFields = { ...state.touchedFields };
      let { touched } = state;

      data.fieldNames.forEach((name) => {
        touchedFields[name] = true;
        touched = true;
      });

      nextState = {
        ...state,
        touched,
        touchedFields,
      };
      break;
    }

    case ACTION_VALIDATE:
      nextState = {
        ...state,
        validating: true,
        validated: false,
        // Disable form.
        disabled: true,
      };
      break;

    case ACTION_VALIDATE_ERROR:
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
