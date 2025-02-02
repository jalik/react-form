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

export type UseFormValuesOptions<V extends Values, E, R> = {
  /**
   * The form keys hook.
   */
  formKeys: UseFormKeysHook<V>;
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
   * Restores initial values of given paths.
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
      updateErrors?: boolean;
      updateModified?: boolean;
    }): void;
  /**
   * Sets given values of all values.
   * @param values
   * @param options
   */
  setValues (
    values: PathsOrValues<V>,
    options?: {
      forceUpdate?: boolean;
      initialize?: boolean;
      partial: boolean;
      updateErrors?: boolean;
      updateModified?: boolean;
      validate?: boolean;
    }): void;
}

function useFormValues<V extends Values, E, R> (options: UseFormValuesOptions<V, E, R>): UseFormValuesHook<V> {
  const {
    formKeys,
    formState,
    formStatus,
    mode,
    onValuesChange,
    watchers
  } = options

  const { replaceKeys } = formKeys

  const {
    errorsRef,
    initializedRef,
    initialValuesRef,
    setState,
    valuesRef
  } = formState

  const {
    isTouched,
    setModified
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
      partial,
      updateModified = true,
      updateErrors = true,
      validate
    } = opts ?? {}

    const previousValues = clone(valuesRef.current)

    let nextValues: Partial<V> = partial
      ? valuesRef.current
      : {} as Partial<V>

    const nextErrors: Errors<E> = {}

    const paths = Object.keys(values)

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const value = values[path]
      nextValues = build(path, value, nextValues)

      // Clear error if validation is not needed.
      if (!validate && errorsRef.current[path] != null) {
        nextErrors[path] = undefined
      }
    }
    valuesRef.current = nextValues

    // Update initial values.
    if (!initializedRef.current || initialize) {
      initialValuesRef.current = clone(nextValues)
      initializedRef.current = true

      if (mode === 'controlled' || initialize) {
        // fixme call setState() once in the function
        setState((s) => ({
          ...s,
          initialValues: nextValues
        }))
      }
    }

    const mutation = values

    if (updateModified) {
      // Update modified state.
      const modified: ModifiedFields = {}

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        const value = mutation[path]
        const initialValue = getInitialValue(path)

        modified[path] =
          // Always set false when initializing.
          !initialize &&
          // Set true if new and initial values are different.
          (value !== initialValue) &&
          (value != null || initialValue != null)
        // fixme Set true if array is different.
        // fixme Set true if object is different.
      }
      setModified(modified, { partial })
    }

    // Update values.
    if (mode === 'controlled' || forceUpdate || initialize || validate) {
      setState((s) => {
        const errors = partial ? { ...s.errors, ...nextErrors } : nextErrors
        if (updateErrors) {
          errorsRef.current = nextErrors
        }
        return {
          ...s,
          errors: updateErrors ? errors : s.errors,
          needValidation: validate ? (Object.keys(values) as FieldPath<V>[]) : s.needValidation,
          // todo update modified
          submitError: undefined,
          submitted: false,
          values: nextValues
        }
      })

      // Force update by replacing keys.
      if (mode === 'experimental_uncontrolled') {
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
  }, [errorsRef, getInitialValue, initialValuesRef, initializedRef, isTouched, mode, replaceKeys, setModified, setState, valuesRef, watchers])

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
      forceUpdate: true,
      ...opts,
      partial: paths != null
    })
  }, [setValues])

  const initialize = useCallback<UseFormValuesHook<V>['setInitialValues']>((values, opts) => {
    setValues(values, {
      ...opts,
      forceUpdate: true,
      initialize: true,
      partial: false
    })
  }, [setValues])

  const removeValues = useCallback<UseFormValuesHook<V>['removeValues']>((paths, opts) => {
    clearValues(paths, {
      ...opts,
      initialize: true
    })
  }, [clearValues])

  const resetValues = useCallback<UseFormValuesHook<V>['resetValues']>((paths, opts) => {
    if (paths) {
      const nextValues = {} as PathsAndValues<V>
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        nextValues[path] = getInitialValue(path)
      }
      setValues(nextValues, {
        forceUpdate: true,
        ...opts,
        partial: true
      })
    } else {
      setValues(getInitialValues() ?? {}, {
        forceUpdate: true,
        ...opts,
        partial: false
      })
    }
  }, [getInitialValue, getInitialValues, setValues])

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
