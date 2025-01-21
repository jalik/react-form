/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import React, { SyntheticEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import { UseFormHook } from './useForm'
import useFormContext from './useFormContext'
import { Values } from './useFormReducer'
import { resolve } from './utils'

export type ArrayItem<T> = {
  key: string | number;
  name: string,
  value: T;
}

/**
 * Returns fields synchronized with original array.
 */
function getFieldsFromArray<T> (getKey: (path: string) => string, path: string, array: T[], fields: ArrayItem<T>[]): ArrayItem<T>[] {
  return array.map((value, index) => {
    if (typeof fields[index] === 'undefined') {
      const name = `${path}[${index}]`
      return {
        key: getKey(name),
        name,
        value
      }
    }
    return {
      ...fields[index],
      value
    }
  })
}

export type UseFieldArrayOptions<T, V extends Values> = {
  context: UseFormHook<V, Error, any>
  defaultValue: T
  name: string
}

/**
 * Returns utils to manage an array of fields.
 */
function useFieldArray<T, V extends Values> (options: UseFieldArrayOptions<T, V>) {
  const {
    context,
    defaultValue,
    name
  } = options

  const form = useFormContext()

  const {
    key,
    getValue,
    setValues
  } = context ?? form

  const fieldsRef = useRef<ArrayItem<T>[]>([])

  const fields = useMemo(() => {
    const value = getValue<T[]>(name, [])
    return value ? getFieldsFromArray(key, name, value, fieldsRef.current) : []
  }, [getValue, key, name])

  /**
   * Adds values to the end of the array.
   */
  const append = useCallback((...values: T[]): void => {
    setValues((s) => {
      const value = resolve<T[]>(name, s) ?? []
      return { [name]: [...value, ...values] }
    }, {
      partial: true,
      forceUpdate: true
    })
  }, [name, setValues])

  /**
   * Inserts values at a given index.
   */
  const insert = useCallback((index: number, ...values: T[]): void => {
    setValues((s) => {
      const value = [...(resolve<T[]>(name, s) ?? [])]
      value.splice(index, 0, ...values)
      return { [name]: value }
    }, {
      partial: true,
      forceUpdate: true
    })
  }, [name, setValues])

  /**
   * Moves a value from an index to another index.
   */
  const move = useCallback((fromIndex: number, toIndex: number): void => {
    setValues((s) => {
      const value = [...(resolve<T[]>(name, s) ?? [])]
      const index = Math.min(Math.max(toIndex, 0), value.length)
      const [item] = value.splice(fromIndex, 1)
      value.splice(index, 0, item)
      return { [name]: value }
    }, {
      partial: true,
      forceUpdate: true
    })
  }, [name, setValues])

  /**
   * Adds values to the beginning of the array.
   */
  const prepend = useCallback((...values: T[]): void => {
    setValues((s) => {
      const value = resolve<T[]>(name, s) ?? []
      return { [name]: [...values, ...value] }
    }, {
      partial: true,
      forceUpdate: true
    })
  }, [name, setValues])

  /**
   * Removes values from the array by index.
   */
  const remove = useCallback((...indexes: number[]): void => {
    setValues((s) => {
      const value = [...(resolve<T[]>(name, s) ?? [])]
      const reversedIndexes = [...indexes].reverse()
      reversedIndexes.forEach((index) => {
        value.splice(index, 1)
      })
      return { [name]: value }
    }, {
      partial: true,
      forceUpdate: true
    })
  }, [name, setValues])

  /**
   * Swaps values from an index to another index.
   */
  const swap = useCallback((fromIndex: number, toIndex: number): void => {
    setValues((s) => {
      const value = resolve<T[]>(name, s) ?? []
      let a
      let b

      if (fromIndex < toIndex) {
        b = value.splice(toIndex, 1)[0]
        a = value.splice(fromIndex, 1)[0]
      } else {
        a = value.splice(fromIndex, 1)[0]
        b = value.splice(toIndex, 1)[0]
      }
      value.splice(fromIndex, 0, b)
      value.splice(toIndex, 0, a)
      return { [name]: value }
    }, {
      partial: true,
      forceUpdate: true
    })
  }, [name, setValues])

  /**
   * Handles event that appends a value.
   */
  const handleAppend = useCallback((event: SyntheticEvent | Event): void => {
    event.preventDefault()
    append(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
  }, [append, defaultValue])

  /**
   * Handles event that prepends a value.
   */
  const handlePrepend = useCallback((event: React.SyntheticEvent | Event): void => {
    event.preventDefault()
    prepend(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
  }, [prepend, defaultValue])

  /**
   * Handles event that removes a value at a given index.
   */
  const handleRemove = useCallback((index: number) => (event: React.SyntheticEvent | Event): void => {
    event.preventDefault()
    remove(index)
  }, [remove])

  useEffect(() => {
    const value = getValue<T[]>(name, [])
    fieldsRef.current = value ? getFieldsFromArray(key, name, value, fieldsRef.current) : []
  }, [getValue, key, name])

  return useMemo(() => ({
    append,
    fields,
    handleAppend,
    handlePrepend,
    handleRemove,
    insert,
    move,
    prepend,
    remove,
    swap
  }), [append, fields, handleAppend, handlePrepend, handleRemove, insert, move, prepend, remove, swap])
}

export default useFieldArray
