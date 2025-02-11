/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { filterErrors } from './useFormErrors'
import { hasDefinedValues, hasTrueValues } from './utils'

/**
 * Tells how the form should read and write values.
 */
export type FormMode = 'controlled' | 'uncontrolled'
/**
 * Contains the form values.
 */
export type Values = Record<string, any>;
/**
 * Represents a field path.
 */
export type FieldPath<V extends Values> = (keyof V & string) | string
/**
 * Contains fields paths and values.
 */
export type PathsAndValues<V extends Values> = Record<FieldPath<V>, unknown>
/**
 * Contains form values as object or a flat object with paths and values.
 */
export type PathsOrValues<V extends Values> = PathsAndValues<V> | Partial<V>
/**
 * Contains the form errors.
 * todo v6: rename to FormErrors
 */
export type Errors<E = Error> = Record<string, E | undefined | null>;
/**
 * Contains info about modified fields.
 */
export type ModifiedState = Record<string, boolean>;
/**
 * Contains info about touched fields.
 */
export type TouchedState = Record<string, boolean>;

export type FormState<V extends Values = Values, E = Error, R = any> = {
  /**
   * Disables all fields and buttons.
   */
  disabled: boolean;
  /**
   * The fields errors.
   */
  errors: Errors<E>;
  /**
   * Tells if there are any error.
   */
  hasError: boolean;
  /**
   * Tells if the form was initialized.
   */
  initialized: boolean;
  /**
   * Sets initial errors.
   */
  initialErrors: Errors<E>;
  /**
   * Sets initial modified fields.
   */
  initialModified: ModifiedState;
  /**
   * Sets initial touched fields.
   */
  initialTouched: TouchedState;
  /**
   * Contains initial form values.
   */
  initialValues: Partial<V> | undefined;
  /**
   * The loading error.
   */
  loadError: Error | undefined;
  /**
   * Tells if the form is loading.
   */
  loading: boolean;
  /**
   * Tells if the form was modified.
   */
  modified: boolean;
  /**
   Contains modified fields state (controlled mode).
   */
  modifiedFields: ModifiedState;
  /**
   * Tells if the form will trigger a validation or if it will validate some fields.
   */
  needValidation: boolean | FieldPath<V>[];
  /**
   * The number of times the form was submitted (count is reset on success).
   */
  submitCount: number;
  /**
   * The submit error.
   */
  submitError: Error | undefined;
  /**
   * The submit result returned by onSubmit promise.
   */
  submitResult: R | undefined;
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
   * Contains the touched fields state (controlled mode).
   */
  touchedFields: TouchedState;
  /**
   * The validation error.
   */
  validateError: Error | undefined;
  /**
   * Tells if the form was validated.
   */
  validated: boolean;
  /**
   * Tells if the form is validating.
   */
  validating: boolean;
  /**
   * The form values.
   */
  values: Partial<V>;
}

export type UseFormStateOptions<V extends Values, E, R> = {
  debug?: boolean;
  /**
   * Sets the initial state of the form.
   */
  initialState?: Partial<FormState<V, E, R>>;
}

export type UseFormStateHook<V extends Values, E, R> = {
  /**
   * Enable debug logging.
   */
  debug?: boolean;
  /**
   * The errors ref (uncontrolled mode).
   */
  errorsRef: MutableRefObject<Errors<E>>;
  /**
   * Tells if the form was initialized (uncontrolled mode).
   */
  initializedRef: MutableRefObject<boolean>;
  /**
   * The initial values ref (uncontrolled mode).
   */
  initialValuesRef: MutableRefObject<Partial<V> | undefined>;
  /**
   * The modified fields ref (uncontrolled mode).
   */
  modifiedRef: MutableRefObject<ModifiedState>;
  /**
   * The current state of the form.
   */
  state: FormState<V, E, R>;
  /**
   * Sets the new state of the form.
   */
  setState: Dispatch<SetStateAction<FormState<V, E, R>>>;
  /**
   * The touched fields ref (uncontrolled mode).
   */
  touchedRef: MutableRefObject<TouchedState>;
  /**
   * The values ref (uncontrolled mode).
   */
  valuesRef: MutableRefObject<Partial<V>>;
}

function useFormState<V extends Values, E, R> (options: UseFormStateOptions<V, E, R> = {}): UseFormStateHook<V, E, R> {
  const {
    debug = false,
    initialState = {}
  } = options

  const [state, setState] = useState<FormState<V, E, R>>(() => ({
    disabled: false,
    hasError: false,
    initialModified: {},
    initialTouched: {},
    initialValues: undefined,
    loadError: undefined,
    loading: false,
    modified: false,
    needValidation: false,
    submitCount: 0,
    submitError: undefined,
    submitResult: undefined,
    submitted: false,
    submitting: false,
    touched: false,
    validateError: undefined,
    validated: false,
    validating: false,
    ...initialState,
    errors: filterErrors(initialState.errors),
    initialized: initialState.initialValues != null,
    initialErrors: filterErrors(initialState.initialErrors),
    modifiedFields: initialState.initialModified ?? {},
    touchedFields: initialState.initialTouched ?? {},
    values: initialState.initialValues ?? {}
  }))

  const errorsRef = useRef<Errors<E>>(state.errors)
  const initialValuesRef = useRef<Partial<V | undefined>>(state.initialValues)
  const initializedRef = useRef<boolean>(state.initialized)
  const modifiedRef = useRef<ModifiedState>(state.initialModified ?? {})
  const touchedRef = useRef<TouchedState>(state.initialTouched ?? {})
  const valuesRef = useRef<Partial<V>>(state.values ?? {})

  // Computed values.
  const computedState = useMemo(() => ({
    ...state,
    hasError: hasDefinedValues(state.errors),
    initialized: state.initialValues != null,
    modified: hasTrueValues(modifiedRef.current),
    touched: hasTrueValues(touchedRef.current)
  }), [state])

  useEffect(() => {
    if (debug) {
      console.debug('FORM STATE', computedState)
    }
  }, [computedState, debug])

  return {
    debug,
    errorsRef,
    initializedRef,
    initialValuesRef,
    modifiedRef,
    setState,
    state: computedState,
    touchedRef,
    valuesRef
  }
}

export default useFormState
