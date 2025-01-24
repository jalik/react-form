/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { ModifiedFields, Values } from './useFormReducer'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { build, clone, flatten, resolve } from './utils'
import { FormMode } from './useForm'
import { UseFormKeysHook } from './useFormKeys'
import { UseFormStatusHook } from './useFormStatus'
import { FieldStatus, inputChangeEvent } from './useFormWatch'
import { Observer } from '@jalik/observer'

// todo add autocompletion with keyof for string in Record
export type PathsOrValues<V extends Values> = Record<string, unknown> | Partial<V>

export type UseFormValuesOptions<V extends Values> = {
  /**
   * The form keys hook.
   */
  formKeys: UseFormKeysHook;
  /**
   * The form keys hook.
   */
  formStatus: UseFormStatusHook;
  /**
   * Contains initial form values.
   */
  initialValues?: Partial<V>;
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
    paths?: string[],
    options?: { forceUpdate?: boolean }): void;
  /**
   * Returns the initial value of a field.
   */
  getInitialValue<T> (path: string, defaultValue?: T): T | undefined;
  /**
   * Returns the initial values.
   */
  getInitialValues (): Partial<V> | undefined;
  /**
   * Returns a value.
   */
  getValue<T> (path: string, defaultValue?: T): T | undefined;
  /**
   * Returns values.
   */
  getValues (): Partial<V>;
  /**
   * Tells if the form was initialized.
   */
  initializedRef: MutableRefObject<boolean>;
  /**
   * Contains initial values ref (uncontrolled).
   */
  initialValuesRef: MutableRefObject<Partial<V> | undefined>;
  /**
   * Contains initial values ref (controlled).
   */
  initialValuesState: Partial<V | undefined>;
  /**
   * Removes existing values (set to undefined).
   * @param paths
   * @param options
   */
  removeValues (
    paths: string[],
    options?: { forceUpdate?: boolean }): void;
  /**
   * Restores initial values of given paths.
   * @param paths
   * @param options
   */
  resetValues (
    paths?: string[],
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
    path: string,
    value: any,
    options?: { forceUpdate?: boolean }): void;
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
    }): void;
  /**
   * The values reference.
   */
  valuesRef: MutableRefObject<Partial<V>>;
  /**
   * The values state.
   */
  valuesState: Partial<V>;
}

function useFormValues<V extends Values> (options: UseFormValuesOptions<V>): UseFormValuesHook<V> {
  const {
    formKeys,
    formStatus,
    initialValues,
    mode,
    onValuesChange,
    reinitialize,
    watchers
  } = options

  const initialValuesRef = useRef<Partial<V | undefined>>(initialValues)
  const [initialValuesState, setInitialValuesState] = useState<Partial<V | undefined>>(initialValuesRef.current)
  const initializedRef = useRef<boolean>(initialValuesRef.current != null)

  const valuesRef = useRef<Partial<V>>(initialValues ?? {})
  const [valuesState, setValuesState] = useState<Partial<V>>(valuesRef.current)

  const { replaceKeysFromValues } = formKeys
  const {
    isTouched,
    setModified
  } = formStatus

  const getInitialValues = useCallback<UseFormValuesHook<V>['getInitialValues']>(() => {
    return initialValuesRef.current
  }, [])

  const getInitialValue = useCallback<UseFormValuesHook<V>['getInitialValue']>(<T> (path: string, defaultValue?: T) => {
    const value = resolve<T>(path, getInitialValues())
    return typeof value !== 'undefined' ? value : defaultValue
  }, [getInitialValues])

  const getValues = useCallback<UseFormValuesHook<V>['getValues']>(() => {
    return valuesRef.current
  }, [])

  const getValue = useCallback<UseFormValuesHook<V>['getValue']>(<T> (path: string, defaultValue?: T) => {
    const value = resolve<T>(path, getValues())
    return typeof value !== 'undefined' ? value : defaultValue
  }, [getValues])

  const setValues = useCallback<UseFormValuesHook<V>['setValues']>((values, opts) => {
    const {
      forceUpdate,
      initialize,
      partial
    } = opts ?? {}

    const prevData = valuesRef.current
    let data: Partial<V> = partial
      ? valuesRef.current
      : {} as Partial<V>

    Object.entries(values).forEach(([path, value]) => {
      data = build(path, value, data)
    })
    valuesRef.current = data

    // Update initial values.
    if (!initializedRef.current || initialize) {
      initialValuesRef.current = clone(data)
      initializedRef.current = true

      if (mode === 'controlled') {
        setInitialValuesState(data)
      }
    }

    // Update modified state.
    const modified: ModifiedFields = {}
    const mutation = flatten(values, null, true)
    Object.entries(mutation).forEach(([path, value]) => {
      const initialValue = getInitialValue(path)
      // Compare value with initial value.
      modified[path] = value !== initialValue &&
        // Ignore when comparing null and undefined.
        (value != null || initialValue != null) &&
        // Ignore array and object.
        // fixme compare arrays and objects
        (!(value instanceof Array) || !(initialValue instanceof Array)) &&
        (typeof value !== 'object' || typeof initialValue !== 'object')
    })
    setModified(modified, { partial })

    // Update values.
    if (mode === 'controlled' || forceUpdate) {
      setValuesState(data)

      // Force update by replacing keys.
      if (mode === 'experimental_uncontrolled') {
        replaceKeysFromValues(values)
      }
    }

    // Notifies of values change.
    if (onValuesChange) {
      onValuesChange(data, prevData)
    }

    // Notify watchers of all field changes.
    Object.entries(mutation).forEach(([path, value]) => {
      const previousValue = resolve(path, prevData)

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
    })
  }, [setModified, mode, onValuesChange, getInitialValue, replaceKeysFromValues, isTouched, watchers])

  const setValue = useCallback<UseFormValuesHook<V>['setValue']>((path, value, opts) => {
    const currentValue = getValue(path)

    if (currentValue !== value) {
      setValues({ [path]: value }, {
        ...opts,
        partial: true
      })
    }
  }, [getValue, setValues])

  const clearValues = useCallback<UseFormValuesHook<V>['clearValues']>((paths, opts) => {
    let data: Partial<V> = {}

    if (paths) {
      paths.forEach((path) => {
        data = build(path, undefined, data)
      })
    }
    setValues(data, {
      forceUpdate: true,
      ...opts,
      partial: paths != null && paths.length > 0
    })
  }, [setValues])

  const initialize = useCallback<UseFormValuesHook<V>['setInitialValues']>((values, opts) => {
    setValues(values, {
      forceUpdate: true,
      ...opts,
      initialize: true,
      partial: false
    })
  }, [setValues])

  const removeValues = useCallback<UseFormValuesHook<V>['removeValues']>((paths, opts) => {
    let initialData: Partial<V> = initialValuesRef.current ?? {}
    let data: Partial<V> = valuesRef.current

    if (paths) {
      // Remove from values and initial values.
      paths.forEach((path) => {
        if (typeof resolve(path, initialValuesRef) !== 'undefined') {
          initialData = build(path, undefined, initialData)
        }
        if (typeof resolve(path, data) !== 'undefined') {
          data = build(path, undefined, data)
        }
      })
    }
    setValues(data, {
      forceUpdate: true,
      ...opts,
      partial: false
    })
  }, [setValues])

  const resetValues = useCallback<UseFormValuesHook<V>['resetValues']>((paths, opts) => {
    const initialData: Partial<V> = initialValuesRef.current ?? {}
    let data: Partial<V> = initialData

    if (paths) {
      data = valuesRef.current
      paths.forEach((path) => {
        const initialValue = resolve(path, initialData)
        data = build(path, initialValue, data)
      })
    }
    setValues(data, {
      forceUpdate: true,
      ...opts,
      partial: false
    })
  }, [setValues])

  useEffect(() => {
    // Set values using initial values when they are provided or if they changed.
    if (initialValues && (!initializedRef.current || reinitialize)) {
      initialize(initialValues, { forceUpdate: true })
    }
  }, [initialValues, initialize, reinitialize])

  return {
    clearValues,
    getInitialValue,
    getInitialValues,
    getValue,
    getValues,
    initializedRef,
    initialValuesRef,
    initialValuesState,
    removeValues,
    resetValues,
    setInitialValues: initialize,
    setValue,
    setValues,
    valuesRef,
    valuesState
  }
}

export default useFormValues
