/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { ModifiedFields, Values } from './useFormReducer'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { build, clone, resolve } from './utils'
import { FieldKey, FormMode } from './useForm'
import { UseFormKeysHook } from './useFormKeys'
import { UseFormStatusHook } from './useFormStatus'
import { Observer } from '@jalik/observer'
import { FieldStatus, inputChangeEvent } from './useFormWatch'

export type FieldPaths<V extends Values> = Record<FieldKey<V>, unknown>
export type PathsOrValues<V extends Values> = FieldPaths<V> | Partial<V>

export type UseFormValuesOptions<V extends Values> = {
  /**
   * The form keys hook.
   */
  formKeys: UseFormKeysHook<V>;
  /**
   * The form keys hook.
   */
  formStatus: UseFormStatusHook<V>;
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
    paths?: FieldKey<V>[],
    options?: {
      forceUpdate?: boolean;
      initialize?: boolean;
    }): void;
  /**
   * Returns the initial value of a field.
   */
  getInitialValue<T> (path: FieldKey<V>, defaultValue?: T): T | undefined;
  /**
   * Returns the initial values.
   */
  getInitialValues (): Partial<V> | undefined;
  /**
   * Returns a value.
   */
  getValue<T> (path: FieldKey<V>, defaultValue?: T): T | undefined;
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
    paths: FieldKey<V>[],
    options?: { forceUpdate?: boolean }): void;
  /**
   * Restores initial values of given paths.
   * @param paths
   * @param options
   */
  resetValues (
    paths?: FieldKey<V>[],
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
    path: FieldKey<V>,
    value: any,
    options?: {
      forceUpdate?: boolean;
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
      updateModified?: boolean;
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

  const onValuesChangeRef = useRef(onValuesChange)

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

  const getInitialValue = useCallback<UseFormValuesHook<V>['getInitialValue']>(<T> (path: FieldKey<V>, defaultValue?: T) => {
    const value = resolve<T>(path, getInitialValues())
    return typeof value !== 'undefined' ? value : defaultValue
  }, [getInitialValues])

  const getValues = useCallback<UseFormValuesHook<V>['getValues']>(() => {
    return valuesRef.current
  }, [])

  const getValue = useCallback<UseFormValuesHook<V>['getValue']>(<T> (path: FieldKey<V>, defaultValue?: T) => {
    const value = resolve<T>(path, getValues())
    return typeof value !== 'undefined' ? value : defaultValue
  }, [getValues])

  const setValues = useCallback<UseFormValuesHook<V>['setValues']>((values, opts) => {
    const {
      forceUpdate,
      initialize,
      partial,
      updateModified = true
    } = opts ?? {}

    const prevData = clone(valuesRef.current)

    let data: Partial<V> = partial
      ? valuesRef.current
      : {} as Partial<V>

    const paths = Object.keys(values)

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const value = values[path]
      data = build(path, value, data)
    }
    valuesRef.current = data

    // Update initial values.
    if (!initializedRef.current || initialize) {
      initialValuesRef.current = clone(data)
      initializedRef.current = true

      if (mode === 'controlled') {
        setInitialValuesState(data)
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
          // Set true if new and initial values are different.
          (value !== initialValue) &&
          (value != null || initialValue != null)
        // fixme Set true if array is different.
        // fixme Set true if object is different.
      }
      setModified(modified, { partial })
    }

    // Update values.
    if (mode === 'controlled' || forceUpdate) {
      setValuesState(data)

      // Force update by replacing keys.
      if (mode === 'experimental_uncontrolled') {
        replaceKeysFromValues(values)
      }
    }

    // Notifies of values change.
    if (onValuesChangeRef.current) {
      onValuesChangeRef.current(data, prevData)
    }

    // Notify watchers of changes.
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const value = mutation[path]
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
    }
  }, [setModified, mode, getInitialValue, replaceKeysFromValues, isTouched, watchers])

  const setValue = useCallback<UseFormValuesHook<V>['setValue']>((path, value, opts) => {
    const currentValue = getValue(path)

    if (currentValue !== value) {
      setValues({ [path]: value } as FieldPaths<V>, {
        ...opts,
        partial: true
      })
    }
  }, [getValue, setValues])

  const clearValues = useCallback<UseFormValuesHook<V>['clearValues']>((paths, opts) => {
    const data = {} as FieldPaths<V>

    if (paths) {
      for (let i = 0; i < paths.length; i++) {
        data[paths[i]] = null
      }
    }

    setValues(data, {
      forceUpdate: true,
      ...opts,
      partial: paths != null
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
    clearValues(paths, {
      ...opts,
      initialize: true
    })
  }, [clearValues])

  const resetValues = useCallback<UseFormValuesHook<V>['resetValues']>((paths, opts) => {
    const initialData: Partial<V> = initialValuesRef.current ?? {}
    let data: Partial<V> = initialData

    if (paths) {
      data = valuesRef.current

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        data[path] = resolve(path, initialData)
      }
    }

    setValues(data, {
      forceUpdate: true,
      ...opts,
      partial: false
    })
  }, [setValues])

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange
  }, [onValuesChange])

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
    // todo v6: setInitialValues() and initialize() should be separated
    setInitialValues: initialize,
    setValue,
    setValues,
    valuesRef,
    valuesState
  }
}

export default useFormValues
