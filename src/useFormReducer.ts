/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
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

export type Errors<E = Error> = Record<string, E | undefined>;
export type ModifiedFields = Record<string, boolean>;
export type TouchedFields = Record<string, boolean>;
export type Values = Record<string, any>;

export interface FormState<V extends Values = Values, E = Error, R = any> {
  /**
   * Enables debugging.
   */
  debug: boolean;
  /**
   * Disables all fields and buttons.
   */
  disabled: boolean;
  /**
   * Contains fields errors.
   */
  errors: Errors<E>;
  /**
   * Tells if the form has any error.
   */
  hasError: boolean;
  /**
   * Tells if the form was initialized.
   */
  initialized: boolean;
  /**
   * Contains initial form values.
   */
  initialValues: Partial<V>;
  /**
   * The loading error.
   */
  loadError?: Error;
  /**
   * Tells if the form is loading.
   */
  loading: boolean;
  /**
   * Tells if the form was modified.
   */
  modified: boolean;
  /**
   * The fields that were modified.
   */
  modifiedFields: ModifiedFields;
  /**
   * Tells if the form will trigger a validation or if it will validate some fields.
   */
  needValidation: boolean | string[];
  /**
   * The number of times the form was submitted (count is reset on success).
   */
  submitCount: number;
  /**
   * The submit error.
   */
  submitError?: Error;
  /**
   * The submit result returned by onSubmit promise.
   */
  submitResult?: R;
  /**
   * Tells if the form was submitted successfully.
   */
  submitted: boolean;
  /**
   * Tells if the form is submitting.
   */
  submitting: boolean;
  /**
   * Tells if the form was touched.
   */
  touched: boolean;
  /**
   * The fields that were touched.
   */
  touchedFields: TouchedFields;
  /**
   * The validation error.
   */
  validateError?: Error;
  /**
   * Tells if the form was validated.
   */
  validated: boolean;
  /**
   * Tells if validation is done when a field is modified.
   */
  validateOnChange: boolean;
  /**
   * Tells if validation is done when form is initialized.
   */
  validateOnInit: boolean;
  /**
   * Tells if validation is done when form is submitted.
   */
  validateOnSubmit: boolean;
  /**
   * Tells if validation is done when a field is touched.
   */
  validateOnTouch: boolean;
  /**
   * Tells if the form is validating.
   */
  validating: boolean;
  /**
   * The current form values.
   */
  values: Partial<V>;
}

export const initialState = {
  disabled: false,
  errors: {},
  hasError: false,
  initialized: false,
  initialValues: {},
  loadError: undefined,
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
  | { type: 'SUBMIT_SUCCESS', data: { result: R, clear: boolean } }
  | { type: 'VALIDATE', data?: { fields?: string[] } }
  | { type: 'VALIDATE_ERROR', error: Error }
  | { type: 'VALIDATE_FAIL', data: { errors: Errors<E>, partial: boolean } }
  | { type: 'VALIDATE_SUCCESS', data: { fields: string[], submitAfter: boolean } };

/**
 * Form reducers.
 */
function useFormReducer<V extends Values, E, R> (
  state: FormState<V, E, R>,
  action: FormAction<V, E, R>
): FormState<V, E, R> {
  let nextState: FormState<V, E, R>

  if (state.debug) {
    // eslint-disable-next-line no-console
    console.log(action)
  }

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
          submitted: false,
          touched: hasDefinedValues(touchedFields),
          touchedFields,
          values,
          validateError: undefined,
          validated: false
        }
      } else {
        nextState = {
          ...initialState,
          debug: state.debug,
          initialized: true,
          validateOnChange: state.validateOnChange,
          validateOnInit: state.validateOnInit,
          validateOnSubmit: state.validateOnSubmit,
          validateOnTouch: state.validateOnTouch
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
        ...initialState,
        debug: state.debug,
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
        loading: true
      }
      break

    case ACTION_LOAD_ERROR:
      nextState = {
        ...state,
        disabled: false,
        loadError: action.error,
        loading: false
      }
      break

    case ACTION_LOAD_SUCCESS: {
      const { data } = action
      nextState = {
        ...initialState,
        debug: state.debug,
        initialized: true,
        initialValues: clone(data.values),
        loadError: undefined,
        loading: false,
        values: data.values,
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch
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
        submitted: false,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
        values
      }
      break
    }

    case ACTION_RESET:
      if (state.validating) {
        // Ignore reset during validation.
        return state
      }
      nextState = {
        ...initialState,
        debug: state.debug,
        initialized: state.initialized,
        initialValues: state.initialValues,
        values: clone(state.initialValues),
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch
      }
      break

    case ACTION_RESET_VALUES: {
      if (state.validating) {
        // Ignore reset during validation.
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
        submitted: false,
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
        hasError: hasDefinedValues(errors)
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

        if (modified) {
          modifiedFields[name] = modified
          touchedFields[name] = modified
        } else {
          delete modifiedFields[name]
          delete touchedFields[name]
        }

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
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        submitted: false,
        touched: true,
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
        ...(action.data.clear ? initialState : state),
        debug: state.debug,
        disabled: false,
        initialized: true,
        modified: false,
        modifiedFields: {},
        submitCount: 0,
        submitError: undefined,
        submitting: false,
        submitResult: action.data.result,
        submitted: true,
        touched: false,
        touchedFields: {},
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch
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

      // Check if at least one field has been touched
      const touched = Object.values({ ...state.touchedFields, ...data.touchedFields })
        .find((v) => v) || false

      nextState = {
        ...state,
        needValidation,
        touched,
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
        disabled: false,
        errors,
        hasError: hasDefinedValues(errors),
        validated: false,
        validating: false
      }
      break
    }

    case ACTION_VALIDATE_SUCCESS: {
      const { data } = action
      const isSpecific = data.fields.length > 0
      const errors = isSpecific ? { ...state.errors } : {}

      if (isSpecific) {
        data.fields.forEach((name) => {
          // Clear fields errors.
          delete errors[name]
        })
      }
      const hasError = hasDefinedValues(errors)
      nextState = {
        ...state,
        // Let form disabled if submission planned after validation
        disabled: data.submitAfter,
        errors,
        hasError,
        validated: !hasError,
        validating: false,
        validateError: undefined
      }
      break
    }

    default:
      throw new Error('Invalid action type passed to useFormReducer()')
  }
  return nextState
}

export default useFormReducer
