/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { SyntheticEvent, useCallback, useMemo, useRef } from 'react'
import { UseFormHook } from './useForm'
import useFormContext from './useFormContext'
import { Values } from './useFormReducer'

export type ArrayItem<T> = {
  key: string | number;
  name: string,
  value: T;
}

export type UseFieldArrayOptions<T, V extends Values> = {
  context: UseFormHook<V, Error, any>;
  defaultValue: T;
  name: string;
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
    appendListItem,
    insertListItem,
    moveListItem,
    prependListItem,
    removeListItem,
    replaceListItem,
    swapListItem,
    values
  } = context ?? form

  const fieldsRef = useRef<ArrayItem<T>[]>([])

  const fields = useMemo<ArrayItem<T>[]>(() => {
    if (values != null) {
      const value = getValue<T[]>(name, [])
      // fixme in controlled mode, when adding item, fields is not updated
      fieldsRef.current = value ? getFieldsFromArray(key, name, value, fieldsRef.current) : []
    }
    return fieldsRef.current ?? []
  }, [getValue, key, name, values])

  const append = useCallback((...items: T[]) => {
    appendListItem(name, ...items)
  }, [appendListItem, name])

  const insert = useCallback((index: number, ...items: T[]) => {
    insertListItem(name, index, ...items)
  }, [insertListItem, name])

  const move = useCallback((fromIndex: number, toIndex: number) => {
    moveListItem(name, fromIndex, toIndex)
  }, [moveListItem, name])

  const prepend = useCallback((...items: T[]) => {
    prependListItem(name, ...items)
  }, [prependListItem, name])

  const replace = useCallback((index: number, item: T) => {
    replaceListItem(name, index, item)
  }, [replaceListItem, name])

  const remove = useCallback((...indices: number[]) => {
    removeListItem(name, ...indices)
  }, [removeListItem, name])

  const swap = useCallback((fromIndex: number, toIndex: number) => {
    swapListItem(name, fromIndex, toIndex)
  }, [swapListItem, name])

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
  const handlePrepend = useCallback((event: SyntheticEvent | Event): void => {
    event.preventDefault()
    prepend(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
  }, [prepend, defaultValue])

  /**
   * Handles event that removes a value at a given index.
   */
  const handleRemove = useCallback((index: number) => (event: SyntheticEvent | Event): void => {
    event.preventDefault()
    removeListItem(name, index)
  }, [name, removeListItem])

  return {
    append,
    fields,
    handleAppend,
    handlePrepend,
    handleRemove,
    insert,
    move,
    prepend,
    remove,
    replace,
    swap
  }
}

export default useFieldArray
