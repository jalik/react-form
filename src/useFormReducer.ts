/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

export const ACTION_CLEAR = 'CLEAR'
export const ACTION_REQUEST_VALIDATION = 'REQUEST_VALIDATION'
export const ACTION_RESET = 'RESET'
export const ACTION_RESET_VALUES = 'RESET_VALUES'
export const ACTION_SET_VALUES = 'SET_VALUES'
export const ACTION_SUBMIT = 'SUBMIT'
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR'
export const ACTION_SUBMIT_SUCCESS = 'SUBMIT_SUCCESS'
export const ACTION_VALIDATE = 'VALIDATE'
export const ACTION_VALIDATE_ERROR = 'VALIDATE_ERROR'
export const ACTION_VALIDATE_FAIL = 'VALIDATE_FAIL'
export const ACTION_VALIDATE_SUCCESS = 'VALIDATE_SUCCESS'

export type Errors<E = Error> = Record<string, E | undefined | null>;
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
  disabled?: boolean;
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
}

export const initialState: FormState = {
  debug: false,
  needValidation: false,
  submitCount: 0,
  submitError: undefined,
  submitResult: undefined,
  submitted: false,
  submitting: false,
  validateError: undefined,
  validated: false,
  validateOnChange: false,
  validateOnInit: false,
  validateOnSubmit: false,
  validateOnTouch: false,
  validating: false
}

export type FormAction<V = Values, E = Error, R = any> =
  { type: 'CLEAR', data?: { fields?: string[] } }
  | { type: 'REQUEST_VALIDATION', data: boolean | string[] }
  | { type: 'RESET' }
  | { type: 'RESET_VALUES', data: { fields: string[] } }
  | { type: 'SET_VALUES', data: { partial: boolean, validate: boolean, values: Values } }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_ERROR', error: Error }
  | {
  type: 'SUBMIT_SUCCESS',
  data: { result?: R, clear?: boolean, setInitialValuesOnSuccess?: boolean }
}
  | { type: 'VALIDATE', data?: { fields?: string[] } }
  | { type: 'VALIDATE_ERROR', error: Error }
  | { type: 'VALIDATE_FAIL' }
  | { type: 'VALIDATE_SUCCESS' };

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
        nextState = {
          ...state,
          submitted: false,
          validateError: undefined,
          validated: false
        }
      } else {
        nextState = {
          ...initialState as FormState<V, E, R>,
          debug: state.debug,
          validateOnChange: state.validateOnChange,
          validateOnInit: state.validateOnInit,
          validateOnSubmit: state.validateOnSubmit,
          validateOnTouch: state.validateOnTouch
        }
      }
      break
    }

    case ACTION_REQUEST_VALIDATION:
      nextState = {
        ...state,
        needValidation: action.data
      }
      break

    case ACTION_RESET:
      if (state.validating) {
        // Ignore reset during validation.
        return state
      }
      nextState = {
        ...initialState as FormState<V, E, R>,
        debug: state.debug,
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
      nextState = {
        ...state,
        submitted: false,
        validateError: undefined,
        validated: false
      }
      break
    }

    case ACTION_SET_VALUES: {
      const { data } = action

      nextState = {
        ...state,
        submitted: false,
        needValidation: data.validate
          ? Object.keys(data.values)
          : state.needValidation,
        validated: false
      }
      break
    }

    case ACTION_SUBMIT:
      nextState = {
        ...state,
        submitting: true,
        submitCount: state.submitCount + 1
      }
      break

    case ACTION_SUBMIT_ERROR:
      nextState = {
        ...state,
        submitError: action.error,
        submitting: false
      }
      break

    case ACTION_SUBMIT_SUCCESS:
      nextState = {
        ...(action.data.clear ? initialState as FormState<V, E, R> : state),
        debug: state.debug,
        // todo initialValues: action.data.clear
        //   ? (initialState as FormState<V, E, R>).initialValues
        //   : (action.data.setInitialValuesOnSuccess ? state.values : state.initialValues),
        submitCount: 0,
        submitError: undefined,
        submitting: false,
        submitResult: action.data.result,
        submitted: true,
        validateOnChange: state.validateOnChange,
        validateOnInit: state.validateOnInit,
        validateOnSubmit: state.validateOnSubmit,
        validateOnTouch: state.validateOnTouch
      }
      break

    case ACTION_VALIDATE: {
      const { data } = action
      nextState = {
        ...state,
        // todo keep track of validating fields
        needValidation: false,
        validating: data?.fields ? state.validating : true
      }
      break
    }

    case ACTION_VALIDATE_ERROR:
      nextState = {
        ...state,
        validating: false,
        validateError: action.error
      }
      break

    case ACTION_VALIDATE_FAIL: {
      nextState = {
        ...state,
        validated: false,
        validating: false
      }
      break
    }

    case ACTION_VALIDATE_SUCCESS: {
      nextState = {
        ...state,
        validated: true,
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
