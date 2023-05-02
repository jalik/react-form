/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { build, clone, hasDefinedValues, resolve } from './utils'

export const ACTION_CLEAR = 'CLEAR'
export const ACTION_CLEAR_ERRORS = 'CLEAR_ERRORS'
export const ACTION_CLEAR_TOUCH = 'CLEAR_TOUCH'
export const ACTION_INIT_VALUES = 'INIT_VALUES'
export const ACTION_LOAD = 'LOAD'
export const ACTION_LOAD_ERROR = 'LOAD_ERROR'
export const ACTION_LOAD_SUCCESS = 'LOAD_SUCCESS'
export const ACTION_REMOVE = 'REMOVE'
export const ACTION_RESET = 'RESET'
export const ACTION_RESET_VALUES = 'RESET_VALUES'
export const ACTION_SET_ERRORS = 'SET_ERRORS'
export const ACTION_SET_VALUES = 'SET_VALUES'
export const ACTION_SUBMIT = 'SUBMIT'
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR'
export const ACTION_SUBMIT_SUCCESS = 'SUBMIT_SUCCESS'
export const ACTION_TOUCH = 'TOUCH'
export const ACTION_VALIDATE = 'VALIDATE'
export const ACTION_VALIDATE_ERROR = 'VALIDATE_ERROR'
export const ACTION_VALIDATE_FAIL = 'VALIDATE_FAIL'
export const ACTION_VALIDATE_SUCCESS = 'VALIDATE_SUCCESS'

export type Errors = Record<string, void | Error | undefined>;
export type ModifiedFields = Record<string, boolean>;
export type TouchedFields = Record<string, boolean>;
export type Values = Record<string, unknown>;

export interface FormState<V extends Values, R> {
  disabled: boolean;
  errors: Errors;
  hasError: boolean;
  initialized: boolean;
  initialValues: Partial<V>;
  loadError?: Error;
  loaded: boolean;
  loading: boolean;
  modified: boolean;
  modifiedFields: ModifiedFields;
  needValidation: boolean | string[];
  submitCount: number;
  submitError?: Error;
  submitResult?: R;
  submitted: boolean;
  submitting: boolean;
  touched: boolean;
  touchedFields: TouchedFields;
  validateError?: Error;
  validated: boolean;
  validateOnChange: boolean;
  validateOnInit: boolean;
  validateOnSubmit: boolean;
  validateOnTouch: boolean;
  validating: boolean;
  values: Partial<V>;
}

export const initialState: FormState<Values, any> = {
  disabled: false,
  errors: {},
  hasError: false,
  initialized: false,
  initialValues: {},
  loadError: undefined,
  loaded: false,
  loading: false,
  modified: false,
  modifiedFields: {},
  needValidation: false,
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
  validateOnChange: false,
  validateOnInit: false,
  validateOnSubmit: true,
  validateOnTouch: false,
  values: {}
}

export type FormAction<V, R> =
  { type: 'CLEAR' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_TOUCH', data: { fields: string[] } }
  | { type: 'INIT_VALUES', data: { values: Partial<V> } }
  | { type: 'LOAD' }
  | { type: 'LOAD_ERROR', error: Error }
  | { type: 'LOAD_SUCCESS', data: { values: Partial<V> } }
  | { type: 'REMOVE', data: { fields: string[] } }
  | { type: 'RESET' }
  | { type: 'RESET_VALUES', data: { fields: string[] } }
  | { type: 'SET_ERRORS', data: { errors: Errors } }
  | { type: 'SET_VALUES', data: { values: Values, validate?: boolean } }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_ERROR', error: Error }
  | { type: 'SUBMIT_SUCCESS', data: { result: R } }
  | { type: 'TOUCH', data: { fields: string[] } }
  | { type: 'VALIDATE', data?: { fields?: string[] } }
  | { type: 'VALIDATE_ERROR', error: Error }
  | { type: 'VALIDATE_FAIL', data: { errors: Errors } }
  | { type: 'VALIDATE_SUCCESS', data: { beforeSubmit?: boolean } };

/**
 * Form reducers.
 */
function useFormReducer<V extends Values, R> (
  state: FormState<V, R>,
  action: FormAction<V, R>
): FormState<V, R> {
  let nextState: FormState<V, R>

  switch (action.type) {
    case ACTION_CLEAR:
      nextState = {
        ...initialState,
        initialValues: {},
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch,
        values: {}
      }
      break

    case ACTION_CLEAR_ERRORS:
      nextState = {
        ...state,
        errors: {},
        hasError: false
      }
      break

    case ACTION_CLEAR_TOUCH: {
      const { data } = action
      const touchedFields: TouchedFields = { ...state.touchedFields }
      data.fields.forEach((name) => {
        delete touchedFields[name]
      })
      nextState = {
        ...state,
        touched: hasDefinedValues(touchedFields),
        touchedFields
      }
      break
    }

    case ACTION_INIT_VALUES: {
      const { data } = action
      nextState = {
        ...initialState,
        disabled: false,
        initialized: true,
        initialValues: clone(data.values),
        // Trigger validation if needed
        needValidation: state.validateOnInit,
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch,
        values: data.values
      }
      break
    }

    case ACTION_LOAD:
      nextState = {
        ...state,
        disabled: true,
        loadError: undefined,
        loaded: false,
        loading: true
      }
      break

    case ACTION_LOAD_ERROR:
      nextState = {
        ...state,
        disabled: false,
        loadError: action.error,
        loaded: false,
        loading: false
      }
      break

    case ACTION_LOAD_SUCCESS: {
      const { data } = action
      nextState = {
        ...initialState,
        disabled: false,
        initialized: true,
        initialValues: clone(data.values),
        loadError: undefined,
        loaded: true,
        loading: false,
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch,
        values: data.values
      }
      break
    }

    // fixme see how to keep errors and modifiedFields when an array field is moved to another index
    //  solution: handle array operations (append, prepend...) in reducer.
    case ACTION_REMOVE: {
      const { data } = action
      const errors = { ...state.errors }
      const modifiedFields = { ...state.modifiedFields }
      const touchedFields = { ...state.touchedFields }
      let values = clone(state.values)

      data.fields.forEach((name) => {
        if (typeof errors[name] !== 'undefined') {
          delete errors[name]
        }
        if (typeof modifiedFields[name] !== 'undefined') {
          delete modifiedFields[name]
        }
        if (typeof touchedFields[name] !== 'undefined') {
          delete touchedFields[name]
        }
        if (typeof resolve(name, values) !== 'undefined') {
          values = build(name, undefined, values)
        }
      })
      nextState = {
        ...state,
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
        errors,
        hasError: hasDefinedValues(errors),
        values
      }
      break
    }

    case ACTION_RESET:
      if (state.validating) {
        // eslint-disable-next-line no-console
        console.warn('Cannot reset form during validation.')
        return state
      }
      nextState = {
        ...initialState,
        initialValues: state.initialValues,
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch,
        values: clone(state.initialValues)
      }
      break

    case ACTION_RESET_VALUES: {
      if (state.validating) {
        // eslint-disable-next-line no-console
        console.warn('Cannot reset form during validation.')
        return state
      }
      const errors = { ...state.errors }
      const modifiedFields = { ...state.modifiedFields }
      const touchedFields = { ...state.touchedFields }
      const initialValues = clone(state.initialValues)
      let values = clone(state.values)

      const { data } = action
      data.fields.forEach((name: string) => {
        const initialValue = resolve(name, initialValues)
        values = build(name, initialValue, values)
        delete errors[name]
        delete modifiedFields[name]
        delete touchedFields[name]
      })

      nextState = {
        ...state,
        values,
        errors,
        hasError: hasDefinedValues(errors),
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
        // Reset form state.
        submitCount: 0,
        submitError: undefined,
        submitResult: undefined,
        submitted: false,
        submitting: false,
        validateError: undefined,
        validated: false,
        validating: false
      }
      break
    }

    case ACTION_SET_ERRORS: {
      const { data } = action
      const errors: Errors = {}

      Object.keys(data.errors)
        .forEach((name) => {
          // Ignore undefined/null errors
          if (data.errors[name]) {
            errors[name] = data.errors[name]
          }
        })

      nextState = {
        ...state,
        errors,
        hasError: hasDefinedValues(data.errors)
      }
      break
    }

    case ACTION_SET_VALUES: {
      const { data } = action
      const modifiedFields = clone(state.modifiedFields)
      const errors = clone(state.errors)
      let values = clone(state.values)

      Object.entries(data.values)
        .forEach(([name, value]) => {
          values = build(name, value, values)
          modifiedFields[name] = value !== resolve(name, state.initialValues)

          // Do not clear errors when validation is triggered
          // to avoid errors to disappear/appear quickly during typing.
          if (!data.validate) {
            delete errors[name]
          }
        })

      nextState = {
        ...state,
        values,
        needValidation: data.validate === true ? Object.keys(data.values) : state.needValidation,
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
        hasError: hasDefinedValues(errors)
      }
      break
    }

    case ACTION_SUBMIT:
      nextState = {
        ...state,
        submitting: true,
        // Disable fields when submitting form.
        disabled: true,
        // Reset previous form submitting result.
        submitError: undefined,
        submitResult: undefined
      }
      break

    case ACTION_SUBMIT_ERROR:
      nextState = {
        ...state,
        disabled: false,
        submitCount: state.submitCount + 1,
        submitError: action.error,
        submitting: false
      }
      break

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
        submitting: false
      }
      break

    case ACTION_TOUCH: {
      const { data } = action
      const touchedFields: TouchedFields = { ...state.touchedFields }
      let { touched } = state

      data.fields.forEach((name) => {
        touchedFields[name] = true
        touched = true
      })

      nextState = {
        ...state,
        // Trigger validation if needed
        needValidation: state.validateOnTouch ? [...data.fields] : state.needValidation,
        touched,
        touchedFields
      }
      break
    }

    case ACTION_VALIDATE: {
      const { data } = action
      nextState = {
        ...state,
        needValidation: false,
        // todo keep track of validating fields
        disabled: data?.fields ? state.disabled : true,
        validated: data?.fields ? state.validated : false,
        validating: data?.fields ? state.validating : true
      }
      break
    }

    case ACTION_VALIDATE_ERROR:
      nextState = {
        ...state,
        validating: false,
        validateError: action.error,
        disabled: false
      }
      break

    case ACTION_VALIDATE_FAIL: {
      const errors: Errors = {}
      const { data } = action

      Object.keys(data.errors)
        .forEach((name) => {
          // Ignore undefined/null errors
          if (data.errors[name]) {
            errors[name] = data.errors[name]
          }
        })
      nextState = {
        ...state,
        disabled: false,
        errors,
        hasError: hasDefinedValues(data.errors),
        validating: false
      }
      break
    }

    case ACTION_VALIDATE_SUCCESS:
      nextState = {
        ...state,
        errors: {},
        hasError: false,
        validated: true,
        validating: false,
        validateError: undefined,
        // Let form disabled if submission planned after validation
        disabled: action.data.beforeSubmit === true
      }
      break

    default:
      nextState = { ...state }
  }
  return nextState
}

export default useFormReducer
