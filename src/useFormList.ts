/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { UseFormErrorsHook } from './useFormErrors'
import { UseFormStatusHook } from './useFormStatus'
import { UseFormValuesHook } from './useFormValues'
import { Values } from './useFormReducer'
import { useCallback } from 'react'
import { movePathIndices, swapPathIndices, updatePathIndices } from './utils'

export type UseFormListOptions<V extends Values, E> = {
  formErrors: UseFormErrorsHook<V, E>;
  formStatus: UseFormStatusHook;
  formValues: UseFormValuesHook<V>;
}

export type UseFormListHook = {
  /**
   * Appends one or more items to a list.
   * @param path
   * @param items
   */
  appendListItem<E = unknown> (path: string, ...items: E[]): void;
  /**
   * Inserts one or more items in a list.
   * @param path
   * @param index
   * @param items
   */
  insertListItem<E = unknown> (path: string, index: number, ...items: E[]): void;
  /**
   * Moves an item in a list.
   * @param path
   * @param fromIndex
   * @param toIndex
   */
  moveListItem (path: string, fromIndex: number, toIndex: number): void;
  /**
   * Inserts one or more items to the beginning of a list.
   * @param path
   * @param items
   */
  prependListItem<E = unknown> (path: string, ...items: E[]): void;
  /**
   * Removes one or more items from a list using their indices.
   * @param path
   * @param indices
   */
  removeListItem (path: string, ...indices: number[]): void;
  /**
   * Replaces an item in a list.
   * @param path
   * @param index
   * @param item
   */
  replaceListItem<E = unknown> (path: string, index: number, item: E): void;
  /**
   * Swaps two items in a list.
   * @param path
   * @param fromIndex
   * @param toIndex
   */
  swapListItem (path: string, fromIndex: number, toIndex: number): void;
}

function useFormList<V extends Values, E> (options: UseFormListOptions<V, E>): UseFormListHook {
  const {
    formErrors,
    formStatus,
    formValues
  } = options

  const {
    clearErrors,
    getErrors,
    setErrors
  } = formErrors

  const {
    getModified,
    getTouched,
    setModified,
    setModifiedField,
    setTouched
  } = formStatus

  const {
    getValue,
    setValue
  } = formValues

  const appendListItem = useCallback<UseFormListHook['appendListItem']>(<T> (path: string, ...items: T[]) => {
    if (items.length > 0) {
      const list = [...(getValue<T[]>(path) ?? []), ...items]
      setValue(path, list, {
        forceUpdate: true,
        updateModified: false
      })
    }
  }, [getValue, setValue])

  const insertListItem = useCallback<UseFormListHook['insertListItem']>(<T> (path: string, index: number, ...items: T[]) => {
    if (items.length > 0) {
      setModified({
        ...updatePathIndices(getModified(), path, index, items.length),
        ...Object.fromEntries(
          items.map((_, i) => ([`${path}[${index + i}]`, true]))
        )
      })
      setTouched(updatePathIndices(getTouched(), path, index, items.length))
      setErrors(updatePathIndices(getErrors(), path, index, items.length))

      const list = [...(getValue<unknown[]>(path) ?? [])]
      list.splice(index, 0, ...items)
      setValue(path, list, {
        forceUpdate: true,
        updateModified: false
      })
    }
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const moveListItem = useCallback<UseFormListHook['moveListItem']>((path, fromIndex, toIndex) => {
    const minIndex = Math.min(fromIndex, toIndex)
    const maxIndex = Math.max(fromIndex, toIndex)
    const modified = movePathIndices(getModified(), path, fromIndex, toIndex)
    for (let i = minIndex; i < maxIndex; i++) {
      modified[`${path}[${i}]`] = true
    }
    setModified(modified)
    setTouched(movePathIndices(getTouched(), path, fromIndex, toIndex))
    setErrors(movePathIndices(getErrors(), path, fromIndex, toIndex))

    const list = [...(getValue<unknown[]>(path) ?? [])]
    const index = Math.min(Math.max(toIndex, 0), list.length)
    const [item] = list.splice(fromIndex, 1)
    list.splice(index, 0, item)
    setValue(path, list, {
      forceUpdate: true,
      updateModified: false
    })
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const prependListItem = useCallback<UseFormListHook['prependListItem']>(<T> (path: string, ...items: T[]) => {
    if (items.length > 0) {
      setModified({
        ...updatePathIndices(getModified(), path, 0, items.length),
        ...Object.fromEntries(
          items.map((_, i) => ([`${path}[${i}]`, true]))
        )
      })
      setTouched(updatePathIndices(getTouched(), path, 0, items.length))
      setErrors(updatePathIndices(getErrors(), path, 0, items.length))

      const list = [...items, ...(getValue<T[]>(path) ?? [])]
      setValue(path, list, {
        forceUpdate: true,
        updateModified: false
      })
    }
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const removeListItem = useCallback<UseFormListHook['removeListItem']>((path, ...indices) => {
    if (indices.length > 0) {
      const reversedIndices = [...indices].reverse()

      let errors = { ...getErrors() }
      let modified = { ...getModified() }
      let touched = { ...getTouched() }

      reversedIndices.forEach((index) => {
        errors = updatePathIndices(errors, path, index, -1)
        modified = updatePathIndices(modified, path, index, -1)
        touched = updatePathIndices(touched, path, index, -1)
      })
      setModified(modified)
      setTouched(touched)
      setErrors(errors)

      const list = [...(getValue<unknown[]>(path) ?? [])]
      reversedIndices.forEach((index) => {
        list.splice(index, 1)
      })
      setValue(path, list, {
        forceUpdate: true,
        updateModified: false
      })
    }
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const replaceListItem = useCallback<UseFormListHook['replaceListItem']>(<T> (path: string, index: number, item: T) => {
    const fieldPath = `${path}[${index}]`
    setModifiedField(fieldPath, true)
    clearErrors([fieldPath])

    const list = [...(getValue<unknown[]>(path) ?? [])]
    list[index] = item
    setValue(path, list, {
      forceUpdate: true,
      updateModified: false
    })
  }, [clearErrors, getValue, setModifiedField, setValue])

  const swapListItem = useCallback<UseFormListHook['swapListItem']>((path, fromIndex, toIndex) => {
    setModified({
      ...swapPathIndices(getModified(), path, fromIndex, toIndex),
      [`${path}[${fromIndex}]`]: true,
      [`${path}[${toIndex}]`]: true
    })
    setTouched(swapPathIndices(getTouched(), path, fromIndex, toIndex))
    setErrors(swapPathIndices(getErrors(), path, fromIndex, toIndex))

    const list = [...(getValue<unknown[]>(path) ?? [])]
    let a
    let b

    if (fromIndex < toIndex) {
      b = list.splice(toIndex, 1)[0]
      a = list.splice(fromIndex, 1)[0]
    } else {
      a = list.splice(fromIndex, 1)[0]
      b = list.splice(toIndex, 1)[0]
    }
    list.splice(fromIndex, 0, b)
    list.splice(toIndex, 0, a)
    setValue(path, list, {
      forceUpdate: true,
      updateModified: false
    })
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  return {
    appendListItem,
    insertListItem,
    moveListItem,
    prependListItem,
    removeListItem,
    replaceListItem,
    swapListItem
  }
}

export default useFormList
