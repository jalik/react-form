/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { Values } from './useFormReducer'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { build, clone, resolve } from './utils'
import { FormMode } from './useForm'

export type UseFormValuesOptions<V extends Values> = {
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
  getInitialValue<T> (path: string): T | undefined;
  /**
   * Returns the initial values.
   */
  getInitialValues (): Partial<V> | undefined;
  /**
   * Returns a value.
   */
  getValue<T> (path: string): T | undefined;
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
    values: Partial<V>,
    options?: { forceUpdate?: boolean }): void;
  /**
   * Sets given values of all values.
   * @param values
   * @param options
   */
  setValues (
    values: Partial<V>,
    options?: {
      forceUpdate?: boolean,
      partial: boolean
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
    initialValues,
    mode,
    onValuesChange,
    reinitialize
  } = options

  const initialValuesRef = useRef<Partial<V | undefined>>(initialValues)
  const [initialValuesState, setInitialValuesState] = useState<Partial<V | undefined>>(initialValuesRef.current)
  const initializedRef = useRef<boolean>(initialValuesRef.current != null)

  const valuesRef = useRef<Partial<V>>(initialValues ?? {})
  const [valuesState, setValuesState] = useState<Partial<V>>(valuesRef.current)

  const clearValues = useCallback<UseFormValuesHook<V>['clearValues']>((paths, opts) => {
    const { forceUpdate } = opts ?? {}

    const prevData = clone(valuesRef.current ?? {} as Partial<V>)
    let data: Partial<V> = {}

    if (paths) {
      data = clone(valuesRef.current ?? {} as Partial<V>)
      paths.forEach((path) => {
        data = build(path, undefined, data)
      })
    }
    valuesRef.current = data

    if (mode === 'controlled' || forceUpdate) {
      setValuesState(data)

      if (onValuesChange) {
        onValuesChange(data, prevData)
      }
    }
  }, [mode, onValuesChange])

  const getInitialValues = useCallback<UseFormValuesHook<V>['getInitialValues']>(() => {
    return initialValuesRef.current != null
      ? clone(initialValuesRef.current ?? {} as Partial<V>)
      : undefined
  }, [])

  const getInitialValue = useCallback<UseFormValuesHook<V>['getInitialValue']>(<T> (path: string) => (
    resolve<T>(path, getInitialValues())
  ), [getInitialValues])

  const getValues = useCallback<UseFormValuesHook<V>['getValues']>(() => {
    return clone(valuesRef.current)
  }, [])

  const getValue = useCallback<UseFormValuesHook<V>['getValue']>(<T> (name: string, defaultValue?: T) => {
    const value = resolve<T>(name, getValues())
    return typeof value !== 'undefined'
      ? value
      : defaultValue
  }, [getValues])

  const initialize = useCallback<UseFormValuesHook<V>['setInitialValues']>((values, opts) => {
    const { forceUpdate = true } = opts ?? {}

    const prevData = clone(valuesRef.current ?? {} as Partial<V>)
    const data = clone(values)
    valuesRef.current = data
    initialValuesRef.current = data
    initializedRef.current = true

    if (mode === 'controlled' || forceUpdate) {
      setInitialValuesState(data)
      setValuesState(data)

      if (onValuesChange) {
        onValuesChange(data, prevData)
      }
    }
  }, [mode, onValuesChange])

  const removeValues = useCallback<UseFormValuesHook<V>['removeValues']>((paths, opts) => {
    const { forceUpdate } = opts ?? {}

    // fixme see how to keep errors and modifiedFields when an array field is moved to another index
    //  solution: handle array operations (append, prepend...) in reducer.
    const prevData = clone(valuesRef.current ?? {} as Partial<V>)
    let initialData: Partial<V> = clone(initialValuesRef.current ?? {} as Partial<V>)
    let data: Partial<V> = clone(valuesRef.current ?? {} as Partial<V>)

    // Remove from values and initial values.
    paths.forEach((path) => {
      if (typeof resolve(path, initialValuesRef) !== 'undefined') {
        initialData = build(path, undefined, initialData)
      }
      if (typeof resolve(path, data) !== 'undefined') {
        data = build(path, undefined, data)
      }
    })
    initialValuesRef.current = data
    valuesRef.current = data

    if (mode === 'controlled' || forceUpdate) {
      setInitialValuesState(initialData)
      setValuesState(data)

      if (onValuesChange) {
        onValuesChange(data, prevData)
      }
    }
  }, [mode, onValuesChange])

  const resetValues = useCallback<UseFormValuesHook<V>['resetValues']>((paths, opts) => {
    const { forceUpdate } = opts ?? {}

    const prevData = clone(valuesRef.current ?? {} as Partial<V>)
    const initialData: Partial<V> = clone(initialValuesRef.current ?? {} as Partial<V>)
    let data: Partial<V> = initialData

    if (paths) {
      data = clone(valuesRef.current ?? {} as Partial<V>)
      paths.forEach((path) => {
        const initialValue = resolve(path, initialData)
        data = build(path, initialValue, data)
      })
    }

    if (mode === 'controlled' || forceUpdate) {
      setValuesState(data)

      if (onValuesChange) {
        onValuesChange(data, prevData)
      }
    }
    valuesRef.current = data
  }, [mode, onValuesChange])

  const setValues = useCallback<UseFormValuesHook<V>['setValues']>((values, opts) => {
    const {
      forceUpdate,
      partial
    } = opts ?? {}

    const prevData = clone(valuesRef.current ?? {} as Partial<V>)

    let data: Partial<V> = partial
      ? clone(valuesRef.current ?? {} as Partial<V>)
      : {} as Partial<V>

    Object.entries(values).forEach(([path, value]) => {
      data = build(path, value, data)
    })
    valuesRef.current = data

    if (!initializedRef.current) {
      initialValuesRef.current = data
      initializedRef.current = true

      if (mode === 'controlled' || forceUpdate) {
        setInitialValuesState(data)
      }
    }

    if (mode === 'controlled' || forceUpdate) {
      setValuesState(data)

      if (onValuesChange) {
        onValuesChange(data, prevData)
      }
    }
  }, [mode, onValuesChange])

  useEffect(() => {
    // Set values using initial values when they are provided or if they changed.
    if (initialValues && (!initializedRef.current || reinitialize)) {
      initialize(initialValues)
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
    setValues,
    valuesRef,
    valuesState
  }
}

export default useFormValues
