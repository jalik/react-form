/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { UseFormHook } from './useForm'
import useFormContext from './useFormContext'
import { Values } from './useFormReducer'
import { randomKey } from './utils'

export interface ArrayItem<T> {
  key: string | number;
  value: T;
}

/**
 * Returns an array item with key and value.
 */
function createItem<T> (value: T): ArrayItem<T> {
  return {
    key: randomKey(),
    value
  }
}

/**
 * Returns fields synchronized with original array.
 */
function synchronizeItems<T> (array: T[], fields: ArrayItem<T>[]): ArrayItem<T>[] {
  return array.map((value, index) => {
    if (typeof fields[index] === 'undefined') {
      return createItem(value)
    }
    return {
      ...fields[index],
      value
    }
  })
}

export interface UseFieldArrayOptions<T, V extends Values> {
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
    getValue,
    setValue
  } = context || form

  const fields = useRef<ArrayItem<T>[]>([])

  const updateValue = useCallback(() => {
    setValue(name, fields.current.map((el) => el.value))
  }, [name, setValue])

  /**
   * Adds values to the end of the array.
   */
  const append = useCallback((...values: T[]): void => {
    fields.current.push(...values.map(createItem))
    updateValue()
  }, [updateValue])

  /**
   * Inserts values at a given index.
   */
  const insert = useCallback((index: number, ...values: T[]): void => {
    fields.current.splice(index, 0, ...values.map(createItem))
    updateValue()
  }, [updateValue])

  /**
   * Moves a value from an index to another index.
   */
  const move = useCallback((fromIndex: number, toIndex: number): void => {
    const index = Math.min(Math.max(toIndex, 0), fields.current.length)
    const [item] = fields.current.splice(fromIndex, 1)
    fields.current.splice(index, 0, item)
    updateValue()
  }, [updateValue])

  /**
   * Adds values to the beginning of the array.
   */
  const prepend = useCallback((...values: T[]): void => {
    fields.current.unshift(...values.map(createItem))
    updateValue()
  }, [updateValue])

  /**
   * Removes values from the array by index.
   */
  const remove = useCallback((...indexes: number[]): void => {
    [...indexes].reverse().forEach((index) => {
      fields.current.splice(index, 1)
    })
    updateValue()
  }, [updateValue])

  /**
   * Swaps values from an index to another index.
   */
  const swap = useCallback((fromIndex: number, toIndex: number): void => {
    let a
    let b

    if (fromIndex < toIndex) {
      b = fields.current.splice(toIndex, 1)[0]
      a = fields.current.splice(fromIndex, 1)[0]
    } else {
      a = fields.current.splice(fromIndex, 1)[0]
      b = fields.current.splice(toIndex, 1)[0]
    }
    fields.current.splice(fromIndex, 0, b)
    fields.current.splice(toIndex, 0, a)
    updateValue()
  }, [updateValue])

  /**
   * Handles event that appends a value.
   */
  const handleAppend = useCallback((event: React.SyntheticEvent): void => {
    event.preventDefault()
    append(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
  }, [append, defaultValue])

  /**
   * Handles event that prepends a value.
   */
  const handlePrepend = useCallback((event: React.SyntheticEvent): void => {
    event.preventDefault()
    prepend(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
  }, [prepend, defaultValue])

  /**
   * Handles event that removes a value at a given index.
   */
  const handleRemove = useCallback((index: number) => (event: React.SyntheticEvent): void => {
    event.preventDefault()
    remove(index)
  }, [remove])

  useEffect(() => {
    const value = getValue<T[]>(name, [])
    fields.current = value ? synchronizeItems(value, fields.current) : []
  }, [getValue, name])

  return useMemo(() => ({
    append,
    fields: fields.current,
    handleAppend,
    handlePrepend,
    handleRemove,
    insert,
    move,
    prepend,
    remove,
    swap
  }), [append, handleAppend, handlePrepend, handleRemove, insert, move, prepend, remove, swap])
}

export default useFieldArray
