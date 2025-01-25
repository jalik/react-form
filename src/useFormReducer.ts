/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

export const ACTION_SUBMIT = 'SUBMIT'
export const ACTION_SUBMIT_ERROR = 'SUBMIT_ERROR'
export const ACTION_SUBMIT_SUCCESS = 'SUBMIT_SUCCESS'

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
}

export const initialState: FormState = {
  debug: false,

  submitCount: 0,
  submitError: undefined,
  submitResult: undefined,
  submitted: false,
  submitting: false
}

export type FormAction<V = Values, E = Error, R = any> =
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_ERROR', error: Error }
  | {
  type: 'SUBMIT_SUCCESS',
  data: { result?: R, clear?: boolean, setInitialValuesOnSuccess?: boolean }
}

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
        submitted: true
      }
      break
  }
  return nextState
}

export default useFormReducer
