/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { build, clone, hasDefinedValues, resolve } from './utils'

export const ACTION_CLEAR = 'CLEAR'
export const ACTION_CLEAR_ERRORS = 'CLEAR_ERRORS'
export const ACTION_CLEAR_TOUCHED_FIELDS = 'CLEAR_TOUCHED_FIELDS'
export const ACTION_INIT_VALUES = 'INIT_VALUES'
export const ACTION_LOAD = 'LOAD'
export const ACTION_LOAD_ERROR = 'LOAD_ERROR'
export const ACTION_LOAD_SUCCESS = 'LOAD_SUCCESS'
export const ACTION_REMOVE = 'REMOVE'
export const ACTION_RESET = 'RESET'
export const ACTION_RESET_VALUES = 'RESET_VALUES'
export const ACTION_SET_ERRORS = 'SET_ERRORS'
export const ACTION_SET_TOUCHED_FIELDS = 'SET_TOUCHED_FIELDS'
export const ACTION_SET_VALUES = 'SET_VALUES'
export const ACTION_SUBMIT = 'SUBMIT'
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR'
export const ACTION_SUBMIT_SUCCESS = 'SUBMIT_SUCCESS'
export const ACTION_VALIDATE = 'VALIDATE'
export const ACTION_VALIDATE_ERROR = 'VALIDATE_ERROR'
export const ACTION_VALIDATE_FAIL = 'VALIDATE_FAIL'
export const ACTION_VALIDATE_SUCCESS = 'VALIDATE_SUCCESS'

export type Errors<E = Error> = Record<string, void | E | undefined>;
export type ModifiedFields = Record<string, boolean>;
export type TouchedFields = Record<string, boolean>;
export type Values = Record<string, unknown>;

export interface FormState<V extends Values = Values, E = Error, R = any> {
  disabled: boolean;
  errors: Errors<E>;
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

export const initialState = {
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
  values: {}
}

export type FormAction<V = Values, E = Error, R = any> =
  { type: 'CLEAR', data?: { fields?: string[] } }
  | { type: 'CLEAR_ERRORS', data?: { fields?: string[] } }
  | { type: 'CLEAR_TOUCHED_FIELDS', data?: { fields?: string[] } }
  | { type: 'INIT_VALUES', data: { values: Partial<V> } }
  | { type: 'LOAD' }
  | { type: 'LOAD_ERROR', error: Error }
  | { type: 'LOAD_SUCCESS', data: { values: Partial<V> } }
  | { type: 'REMOVE', data: { fields: string[] } }
  | { type: 'RESET' }
  | { type: 'RESET_VALUES', data: { fields: string[] } }
  | { type: 'SET_ERRORS', data: { errors: Errors<E>, partial: boolean } }
  | {
  type: 'SET_TOUCHED_FIELDS',
  data: {
    partial: boolean,
    touchedFields: TouchedFields,
    validate: boolean
  }
}
  | { type: 'SET_VALUES', data: { partial: boolean, validate: boolean, values: Values } }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_ERROR', error: Error }
  | { type: 'SUBMIT_SUCCESS', data: { result: R } }
  | { type: 'VALIDATE', data?: { fields?: string[] } }
  | { type: 'VALIDATE_ERROR', error: Error }
  | { type: 'VALIDATE_FAIL', data: { errors: Errors<E> } }
  | { type: 'VALIDATE_SUCCESS', data: { submitAfter: boolean } };

/**
 * Form reducers.
 */
function useFormReducer<V extends Values, E, R> (
  state: FormState<V, E, R>,
  action: FormAction<V, E, R>
): FormState<V, E, R> {
  let nextState: FormState<V, E, R>

  switch (action.type) {
    case ACTION_CLEAR: {
      const { data } = action

      if (data?.fields?.length) {
        const errors = { ...state.errors }
        const modifiedFields = { ...state.modifiedFields }
        const touchedFields = { ...state.touchedFields }
        let initialValues = clone(state.initialValues)
        let values = clone(state.values)

        data.fields.forEach((name: string) => {
          delete errors[name]
          delete modifiedFields[name]
          delete touchedFields[name]
          initialValues = build(name, undefined, initialValues)
          values = build(name, undefined, values)
        })

        nextState = {
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          initialValues,
          modified: hasDefinedValues(modifiedFields),
          modifiedFields,
          touched: hasDefinedValues(touchedFields),
          touchedFields,
          values,
          validateError: undefined,
          validated: false
        }
      } else {
        nextState = {
          ...state,
          ...initialState
        }
      }
      break
    }

    case ACTION_CLEAR_ERRORS: {
      const { data } = action

      if (data?.fields?.length) {
        const errors = { ...state.errors }

        data.fields.forEach((name: string) => {
          delete errors[name]
        })

        nextState = {
          ...state,
          errors,
          hasError: hasDefinedValues(errors)
        }
      } else {
        nextState = {
          ...state,
          errors: {},
          hasError: false
        }
      }
      break
    }

    case ACTION_CLEAR_TOUCHED_FIELDS: {
      const { data } = action

      if (data?.fields?.length) {
        const touchedFields: TouchedFields = { ...state.touchedFields }
        data.fields.forEach((name) => {
          delete touchedFields[name]
        })
        nextState = {
          ...state,
          touched: hasDefinedValues(touchedFields),
          touchedFields
        }
      } else {
        nextState = {
          ...state,
          touched: false,
          touchedFields: {}
        }
      }
      break
    }

    case ACTION_INIT_VALUES: {
      const { data } = action
      nextState = {
        ...state,
        ...initialState,
        initialized: true,
        initialValues: clone(data.values),
        // Trigger validation if needed
        needValidation: state.validateOnInit,
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
        ...state,
        ...initialState,
        initialized: true,
        initialValues: clone(data.values),
        loadError: undefined,
        loaded: true,
        loading: false,
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
        delete errors[name]
        delete modifiedFields[name]
        delete touchedFields[name]

        if (typeof resolve(name, values) !== 'undefined') {
          values = build(name, undefined, values)
        }
      })
      nextState = {
        ...state,
        errors,
        hasError: hasDefinedValues(errors),
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
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
        ...state,
        ...initialState,
        initialValues: state.initialValues,
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
        delete errors[name]
        delete modifiedFields[name]
        delete touchedFields[name]
        const initialValue = resolve(name, initialValues)
        values = build(name, initialValue, values)
      })

      nextState = {
        ...state,
        errors,
        hasError: hasDefinedValues(errors),
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
        values,
        validateError: undefined,
        validated: false
      }
      break
    }

    case ACTION_SET_ERRORS: {
      const { data } = action
      const errors: Errors<E> = data.partial ? { ...state.errors } : {}

      Object.keys(data.errors).forEach((name) => {
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
      const errors = clone(state.errors)
      const touchedFields = clone(state.touchedFields)
      const modifiedFields = clone(state.modifiedFields)
      let values: Partial<V> = data.partial ? clone(state.values) : {}

      Object.entries(data.values).forEach(([name, value]) => {
        values = build(name, value, values)

        // Compare initial value to detect change,
        // ignore when comparing null and undefined together.
        const initialValue = resolve(name, state.initialValues)
        const modified = value !== initialValue && (initialValue != null || value != null)

        modifiedFields[name] = modified
        touchedFields[name] = modified

        // Do not clear errors when validation is triggered
        // to avoid errors to disappear/appear quickly during typing.
        if (!data.validate) {
          delete errors[name]
        }
      })

      nextState = {
        ...state,
        errors,
        hasError: hasDefinedValues(errors),
        modified: true,
        modifiedFields,
        touchedFields,
        needValidation: data.validate
          ? Object.keys(data.values)
          : state.needValidation,
        validated: false,
        values
      }
      break
    }

    case ACTION_SUBMIT:
      nextState = {
        ...state,
        disabled: true,
        submitting: true,
        submitCount: state.submitCount + 1
      }
      break

    case ACTION_SUBMIT_ERROR:
      nextState = {
        ...state,
        disabled: false,
        submitError: action.error,
        submitting: false
      }
      break

    case ACTION_SUBMIT_SUCCESS:
      nextState = {
        ...state,
        ...initialState,
        submitResult: action.data.result,
        submitted: true
      }
      break

    case ACTION_SET_TOUCHED_FIELDS: {
      const { data } = action
      const touchedFields: TouchedFields = data.partial
        ? { ...state.touchedFields, ...data.touchedFields }
        : { ...data.touchedFields }

      // Trigger validation if needed
      const needValidation = data.validate
        ? Object.entries(data.touchedFields).filter(([, v]) => v).map(([k]) => k)
        : state.needValidation

      console.log('TOUCH', touchedFields, needValidation)

      nextState = {
        ...state,
        needValidation,
        touched: true,
        touchedFields
      }
      break
    }

    case ACTION_VALIDATE: {
      const { data } = action
      nextState = {
        ...state,
        // todo keep track of validating fields
        disabled: data?.fields ? state.disabled : true,
        needValidation: false,
        validated: data?.fields ? state.validated : false,
        validating: data?.fields ? state.validating : true
      }
      break
    }

    case ACTION_VALIDATE_ERROR:
      nextState = {
        ...state,
        disabled: false,
        validating: false,
        validateError: action.error
      }
      break

    case ACTION_VALIDATE_FAIL: {
      const errors: Errors<E> = {}
      const { data } = action

      Object.keys(data.errors).forEach((name) => {
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
        // Let form disabled if submission planned after validation
        disabled: action.data.submitAfter,
        errors: {},
        hasError: false,
        validated: true,
        validating: false,
        validateError: undefined
      }
      break

    default:
      throw new Error('Invalid action type passed to useFormReducer()')
  }
  return nextState
}

export default useFormReducer
