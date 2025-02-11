/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import {
  Errors,
  FieldPath,
  FormMode,
  ModifiedState,
  PathsAndValues,
  PathsOrValues,
  UseFormStateHook,
  Values
} from './useFormState'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { build, clone, hasDefinedValues, reconstruct, resolve } from './utils'
import { UseFormKeysHook } from './useFormKeys'
import { UseFormStatusHook } from './useFormStatus'
import { Observer } from '@jalik/observer'
import { FieldStatus, inputChangeEvent } from './useFormWatch'
import { UseFormErrorsHook } from './useFormErrors'
import deepExtend from '@jalik/deep-extend'

export type UseFormValuesOptions<V extends Values, E, R> = {
  /**
   * Update the form when it is modified or touched (happens only at the form level).
   */
  forceUpdateOnStatusChange?: boolean;
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
   * Replaces empty string by null when setting values.
   */
  nullify?: boolean;
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
   * Returns transformed values.
   * @param mutation
   * @param values
   */
  transform? (mutation: PathsAndValues<V>, values: Partial<V>): PathsAndValues<V>;
  /**
   * Registered watchers.
   */
  watchers: MutableRefObject<Observer<any, string>>;
}

export type SetValuesOptions = {
  applyTransform?: boolean;
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
    forceUpdateOnStatusChange,
    formErrors,
    formKeys,
    formState,
    formStatus,
    mode,
    onValuesChange,
    transform,
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
  const transformRef = useRef(transform)

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
      applyTransform = true,
      forceUpdate,
      initialize,
      nullify = options.nullify,
      partial,
      updateErrors = true,
      updateModified = true,
      updateTouched = true,
      validate
    } = opts ?? {}

    const previousValues = clone(valuesRef.current)
    const nextErrors: Errors<E> = {}
    const nextModified: ModifiedState = {}
    let nextValues: Partial<V> = partial
      ? valuesRef.current
      : {} as Partial<V>
    let mutation: PathsOrValues<V> = { ...values }

    if (transformRef.current && applyTransform) {
      // Pre calculate next values.
      const allValues = deepExtend({}, valuesRef.current, reconstruct(values))
      // Apply transformation.
      mutation = transformRef.current(values as PathsAndValues<V>, allValues)
    }

    const paths = Object.keys(mutation)

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      let value = mutation[path]

      // Replace empty string with null.
      if (value === '' && nullify) {
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
            // fixme use fast-deep-equal to compare value and previous value (for array and object)
            (value !== initialValue) &&
            (value != null || initialValue != null)

          // No change detected.
          if (nextModified[path] === modifiedRef.current[path]) {
            delete nextModified[path]
          }
        }
      }
    }

    // Update values ref.
    valuesRef.current = nextValues

    if (initialize) {
      initialValuesRef.current = clone(nextValues)
      initializedRef.current = true
    }
    if (updateErrors) {
      errorsRef.current = partial ? { ...errorsRef.current, ...nextErrors } : nextErrors
    }
    if (updateModified) {
      modifiedRef.current = partial ? { ...modifiedRef.current, ...nextModified } : nextModified
    }
    if (updateTouched) {
      touchedRef.current = partial ? { ...touchedRef.current } : {}
    }

    // Update state.
    if (mode === 'controlled' || forceUpdate || validate ||
      (initialize || !initializedRef.current) ||
      (forceUpdateOnStatusChange && hasDefinedValues(nextModified))) {
      setState((s) => {
        const nextState = {
          ...s,
          submitError: undefined,
          submitted: false,
          values: nextValues
        }

        // Update initial values.
        if (initialize) {
          nextState.initialValues = initialValuesRef.current
        }
        // Update errors.
        if (updateErrors) {
          nextState.errors = errorsRef.current
        }
        // Update modified.
        if (updateModified) {
          nextState.modifiedFields = modifiedRef.current
        }
        // Update touched.
        if (updateTouched) {
          nextState.touchedFields = touchedRef.current
        }
        if (validate) {
          nextState.needValidation = paths
        }
        return nextState
      })

      // Force update by replacing keys.
      if (mode === 'uncontrolled' && forceUpdate) {
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
      const value = mutation[path]
      const previousValue = resolve(path, previousValues)

      // fixme use fast-deep-equal to compare value and previous value (for array and object)
      if (initialize || value !== previousValue) {
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
  }, [errorsRef, forceUpdateOnStatusChange, getInitialValue, initialValuesRef, initializedRef, isTouched, mode, modifiedRef, options.nullify, replaceKeys, setState, touchedRef, valuesRef, watchers])

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
    const nextValues = {} as PathsAndValues<V>

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        nextValues[paths[i]] = undefined
      }
    }
    setValues(nextValues, {
      applyTransform: false,
      forceUpdate: true,
      updateErrors: false,
      updateModified: false,
      updateTouched: false,
      ...opts,
      partial: paths != null
    })

    // Clear linked states after values.
    clearErrors(paths, { forceUpdate: true })
    clearModified(paths, { forceUpdate: true })
    clearTouched(paths, { forceUpdate: true })

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
      applyTransform: false,
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
    clearValues(paths, { ...opts })
  }, [clearValues, initialValuesRef])

  const resetValues = useCallback<UseFormValuesHook<V>['resetValues']>((paths, opts) => {
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
      applyTransform: false,
      forceUpdate: true,
      updateErrors: false,
      updateModified: false,
      updateTouched: false,
      ...opts,
      partial: paths != null
    })

    // Reset linked states after values.
    resetErrors(paths, { forceUpdate: true })
    resetModified(paths, { forceUpdate: true })
    resetTouched(paths, { forceUpdate: true })

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

  useEffect(() => {
    transformRef.current = transform
  }, [transform])

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
