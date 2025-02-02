/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import {
  Errors,
  FieldPath,
  FormMode,
  ModifiedFields,
  PathsAndValues,
  PathsOrValues,
  UseFormStateHook,
  Values
} from './useFormState'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { build, clone, hasDefinedValues, resolve } from './utils'
import { UseFormKeysHook } from './useFormKeys'
import { UseFormStatusHook } from './useFormStatus'
import { Observer } from '@jalik/observer'
import { FieldStatus, inputChangeEvent } from './useFormWatch'
import { UseFormErrorsHook } from './useFormErrors'

export type UseFormValuesOptions<V extends Values, E, R> = {
  /**
   * The form keys hook.
   */
  formKeys: UseFormKeysHook<V>;
  /**
   * The form errors hook.
   */
  formErrors: UseFormErrorsHook<V, E>;
  /**
   * The form state hook.
   */
  formState: UseFormStateHook<V, E, R>;
  /**
   * The form keys hook.
   */
  formStatus: UseFormStatusHook<V>;
  /**
   * The form mode.
   */
  mode: FormMode;
  /**
   * Executes a callback when values changed.
   * @param values
   */
  onValuesChange?: (values: Partial<V>, previousValues: Partial<V>) => void;
  /**
   * Resets values with initial values when they change.
   */
  reinitialize?: boolean;
  /**
   * Registered watchers.
   */
  watchers: MutableRefObject<Observer<any, string>>;
}

export type SetValuesOptions = {
  forceUpdate?: boolean;
  initialize?: boolean;
  nullify?: boolean;
  partial: boolean;
  updateErrors?: boolean;
  updateModified?: boolean;
  updateTouched?: boolean;
  validate?: boolean;
}

export type UseFormValuesHook<V extends Values> = {
  /**
   * Clears all values (set to undefined) or for given paths.
   * @param paths
   * @param options
   */
  clearValues (
    paths?: FieldPath<V>[],
    options?: {
      forceUpdate?: boolean;
      initialize?: boolean;
    }): void;
  /**
   * Returns the initial value of a field.
   */
  getInitialValue<T> (path: FieldPath<V>, defaultValue?: T): T | undefined;
  /**
   * Returns the initial values.
   */
  getInitialValues (): Partial<V> | undefined;
  /**
   * Returns a value.
   */
  getValue<T> (path: FieldPath<V>, defaultValue?: T): T | undefined;
  /**
   * Returns values.
   */
  getValues (): Partial<V>;
  /**
   * Removes existing values (set to undefined).
   * @param paths
   * @param options
   */
  removeValues (
    paths: FieldPath<V>[],
    options?: { forceUpdate?: boolean }): void;
  /**
   * Restores all initial values or for given paths.
   * @param paths
   * @param options
   */
  resetValues (
    paths?: FieldPath<V>[],
    options?: { forceUpdate?: boolean }): void;
  /**
   * Sets or replaces initial values.
   * @param values
   * @param options
   */
  setInitialValues (
    values: PathsOrValues<V>,
    options?: { forceUpdate?: boolean }): void;
  /**
   * Sets a single value.
   * @param path
   * @param value
   * @param options
   */
  setValue (
    path: FieldPath<V>,
    value: any,
    options?: {
      forceUpdate?: boolean;
      nullify?: boolean;
      updateErrors?: boolean;
      updateModified?: boolean;
      updateTouched?: boolean;
      validate?: boolean;
    }): void;
  /**
   * Sets given values of all values.
   * @param values
   * @param options
   */
  setValues (
    values: PathsOrValues<V>,
    options?: SetValuesOptions
  ): void;
}

function useFormValues<V extends Values, E, R> (options: UseFormValuesOptions<V, E, R>): UseFormValuesHook<V> {
  const {
    formErrors,
    formKeys,
    formState,
    formStatus,
    mode,
    onValuesChange,
    watchers
  } = options

  const { replaceKeys } = formKeys

  const {
    clearErrors,
    resetErrors
  } = formErrors

  const {
    errorsRef,
    initializedRef,
    initialValuesRef,
    modifiedRef,
    setState,
    touchedRef,
    valuesRef
  } = formState

  const {
    clearModified,
    clearTouched,
    resetModified,
    resetTouched,
    isTouched
  } = formStatus

  const onValuesChangeRef = useRef(onValuesChange)

  const getInitialValues = useCallback<UseFormValuesHook<V>['getInitialValues']>(() => {
    return initialValuesRef.current
  }, [initialValuesRef])

  const getInitialValue = useCallback<UseFormValuesHook<V>['getInitialValue']>(<T> (path: FieldPath<V>, defaultValue?: T) => {
    const value = resolve<T>(path, getInitialValues())
    return typeof value !== 'undefined' ? value : defaultValue
  }, [getInitialValues])

  const getValues = useCallback<UseFormValuesHook<V>['getValues']>(() => {
    return valuesRef.current
  }, [valuesRef])

  const getValue = useCallback<UseFormValuesHook<V>['getValue']>(<T> (path: FieldPath<V>, defaultValue?: T) => {
    const value = resolve<T>(path, getValues())
    return typeof value !== 'undefined' ? value : defaultValue
  }, [getValues])

  const setValues = useCallback<UseFormValuesHook<V>['setValues']>((values, opts) => {
    const {
      forceUpdate,
      initialize,
      nullify,
      partial,
      updateErrors = true,
      updateModified = true,
      updateTouched = true,
      validate
    } = opts ?? {}

    const previousValues = clone(valuesRef.current)
    const nextErrors: Errors<E> = {}
    const nextModified: ModifiedFields = {}
    let nextValues: Partial<V> = partial
      ? valuesRef.current
      : {} as Partial<V>

    const paths = Object.keys(values)

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      let value = values[path]

      // Replace empty string with null.
      if (nullify && value === '') {
        value = null
      }

      nextValues = build(path, value, nextValues)

      if (!initialize || partial) {
        // Clear field error.
        if (updateErrors && !validate && errorsRef.current[path] != null) {
          nextErrors[path] = undefined
        }
        // Detect field's new modified state.
        if (updateModified) {
          const initialValue = getInitialValue(path)
          nextModified[path] =
            // Always set false when initializing.
            !initialize &&
            // Set true if new and initial values are different.
            (value !== initialValue) &&
            (value != null || initialValue != null)
          // fixme Set true if array is different.
          // fixme Set true if object is different.

          // No change detected.
          if (nextModified[path] === modifiedRef.current[path]) {
            delete nextModified[path]
          }
        }
      }
    }

    // Update values ref.
    valuesRef.current = nextValues

    // Update state.
    if (mode === 'controlled' || forceUpdate || (initialize || !initializedRef.current) || validate ||
      hasDefinedValues(nextErrors) ||
      hasDefinedValues(nextModified)) {
      setState((s) => {
        const nextState = { ...s }

        // Update initial values.
        if (initialize) {
          initialValuesRef.current = clone(nextValues)
          nextState.initialValues = initialValuesRef.current
          initializedRef.current = true
        }
        // Update errors.
        if (updateErrors) {
          errorsRef.current = partial ? { ...errorsRef.current, ...nextErrors } : nextErrors
          nextState.errors = errorsRef.current
        }
        // Update modified.
        if (updateModified) {
          modifiedRef.current = partial ? { ...modifiedRef.current, ...nextModified } : nextModified
          nextState.modifiedFields = modifiedRef.current
        }
        // Update touched.
        if (updateTouched) {
          touchedRef.current = partial ? { ...touchedRef.current } : {}
          nextState.touchedFields = touchedRef.current
        }
        return {
          ...nextState,
          needValidation: validate ? (Object.keys(values) as FieldPath<V>[]) : s.needValidation,
          submitError: undefined,
          submitted: false,
          values: nextValues
        }
      })

      // Force update by replacing keys.
      if (mode === 'experimental_uncontrolled' && forceUpdate) {
        replaceKeys()
      }
    }

    // Notifies of values change.
    if (onValuesChangeRef.current) {
      onValuesChangeRef.current(nextValues, previousValues)
    }

    // Notify watchers of changes.
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const value = values[path]
      const previousValue = resolve(path, previousValues)

      if (value !== previousValue) {
        const status: FieldStatus = {
          modified: value !== previousValue,
          name: path,
          previousValue,
          touched: isTouched(path),
          value
        }
        watchers.current.emit(inputChangeEvent(path), status)
      }
    }
  }, [errorsRef, getInitialValue, initialValuesRef, initializedRef, isTouched, mode, modifiedRef, replaceKeys, setState, touchedRef, valuesRef, watchers])

  const setValue = useCallback<UseFormValuesHook<V>['setValue']>((path, value, opts) => {
    const currentValue = getValue(path)

    if (currentValue !== value) {
      setValues({ [path]: value } as PathsAndValues<V>, {
        ...opts,
        partial: true
      })
    }
  }, [getValue, setValues])

  const clearValues = useCallback<UseFormValuesHook<V>['clearValues']>((paths, opts) => {
    clearErrors(paths, { forceUpdate: false })
    clearModified(paths, { forceUpdate: false })
    clearTouched(paths, { forceUpdate: false })

    const nextValues = {} as PathsAndValues<V>

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        nextValues[paths[i]] = undefined
      }
    }
    setValues(nextValues, {
      forceUpdate: true,
      updateErrors: false,
      updateModified: false,
      updateTouched: false,
      ...opts,
      partial: paths != null
    })
    // todo optimize to avoid rerender
    setState((s) => ({
      ...s,
      submitCount: 0,
      submitError: undefined,
      submitResult: undefined,
      submitted: false,
      validateError: undefined,
      validated: false
    }))
  }, [clearErrors, clearModified, clearTouched, setState, setValues])

  const initialize = useCallback<UseFormValuesHook<V>['setInitialValues']>((values, opts) => {
    setValues(values, {
      ...opts,
      forceUpdate: true,
      initialize: true,
      partial: false
    })
  }, [setValues])

  const removeValues = useCallback<UseFormValuesHook<V>['removeValues']>((paths, opts) => {
    let nextInitialValues = clone(initialValuesRef.current)

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        nextInitialValues = build(paths[i], undefined, nextInitialValues)
      }
    }
    initialValuesRef.current = nextInitialValues
    clearErrors(paths, { forceUpdate: false })
    clearModified(paths, { forceUpdate: false })
    clearTouched(paths, { forceUpdate: false })
    clearValues(paths, { ...opts })
  }, [clearErrors, clearModified, clearTouched, clearValues, initialValuesRef])

  const resetValues = useCallback<UseFormValuesHook<V>['resetValues']>((paths, opts) => {
    resetErrors(paths, { forceUpdate: false })
    resetModified(paths, { forceUpdate: false })
    resetTouched(paths, { forceUpdate: false })

    let nextValues: PathsOrValues<V>

    if (paths) {
      const record = {} as PathsAndValues<V>
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        record[path] = getInitialValue(path)
      }
      nextValues = record
    } else {
      nextValues = getInitialValues() ?? {}
    }
    setValues(nextValues, {
      forceUpdate: true,
      updateErrors: false,
      updateModified: false,
      updateTouched: false,
      ...opts,
      partial: paths != null
    })
    // todo optimize to avoid rerender
    setState((s) => ({
      ...s,
      needValidation: false,
      submitError: undefined,
      submitted: false,
      validateError: undefined,
      validated: false
    }))
  }, [getInitialValue, getInitialValues, resetErrors, resetModified, resetTouched, setState, setValues])

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange
  }, [onValuesChange])

  return {
    clearValues,
    getInitialValue,
    getInitialValues,
    getValue,
    getValues,
    removeValues,
    resetValues,
    // todo v6: setInitialValues() and initialize() should be separated
    setInitialValues: initialize,
    setValue,
    setValues
  }
}

export default useFormValues
