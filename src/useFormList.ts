/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { UseFormErrorsHook } from './useFormErrors'
import { UseFormStatusHook } from './useFormStatus'
import { UseFormValuesHook } from './useFormValues'
import { FieldPath, UseFormStateHook, Values } from './useFormState'
import { useCallback } from 'react'
import { movePathIndices, swapPathIndices, updatePathIndices } from './utils'

export type UseFormListOptions<V extends Values, E, R> = {
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
   * The form values hook.
   */
  formValues: UseFormValuesHook<V>;
}

export type UseFormListHook<V extends Values> = {
  /**
   * Appends one or more items to a list.
   * @param path
   * @param items
   */
  appendListItem<E = unknown> (path: FieldPath<V>, ...items: E[]): void;
  /**
   * Inserts one or more items in a list.
   * @param path
   * @param index
   * @param items
   */
  insertListItem<E = unknown> (path: FieldPath<V>, index: number, ...items: E[]): void;
  /**
   * Moves an item in a list.
   * @param path
   * @param fromIndex
   * @param toIndex
   */
  moveListItem (path: FieldPath<V>, fromIndex: number, toIndex: number): void;
  /**
   * Inserts one or more items to the beginning of a list.
   * @param path
   * @param items
   */
  prependListItem<E = unknown> (path: FieldPath<V>, ...items: E[]): void;
  /**
   * Removes one or more items from a list using their indices.
   * @param path
   * @param indices
   */
  removeListItem (path: FieldPath<V>, ...indices: number[]): void;
  /**
   * Replaces an item in a list.
   * @param path
   * @param index
   * @param item
   */
  replaceListItem<E = unknown> (path: FieldPath<V>, index: number, item: E): void;
  /**
   * Swaps two items in a list.
   * @param path
   * @param fromIndex
   * @param toIndex
   */
  swapListItem (path: FieldPath<V>, fromIndex: number, toIndex: number): void;
}

function useFormList<V extends Values, E, R> (options: UseFormListOptions<V, E, R>): UseFormListHook<V> {
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
    setTouched
  } = formStatus

  const {
    getValue,
    setValue
  } = formValues

  const appendListItem = useCallback<UseFormListHook<V>['appendListItem']>(<T> (path: FieldPath<V>, ...items: T[]) => {
    if (items.length > 0) {
      // mark array as modified
      setModified({ [path]: true })

      const list = [...(getValue<T[]>(path) ?? []), ...items]
      // fixme todo optimize to avoid rerender
      setValue(path, list, {
        forceUpdate: true,
        updateErrors: false,
        updateModified: false
      })
    }
  }, [getValue, setModified, setValue])

  const insertListItem = useCallback<UseFormListHook<V>['insertListItem']>(<T> (path: FieldPath<V>, index: number, ...items: T[]) => {
    if (items.length > 0) {
      setModified({
        ...updatePathIndices(getModified(), path, index, items.length),
        ...Object.fromEntries(
          items.map((_, i) => ([`${path}[${index + i}]`, true]))
        ),
        // mark array as modified
        [path]: true
      })
      setTouched(updatePathIndices(getTouched(), path, index, items.length))
      setErrors(updatePathIndices(getErrors(), path, index, items.length))

      const list = [...(getValue<unknown[]>(path) ?? [])]
      list.splice(index, 0, ...items)
      // fixme todo optimize to avoid rerender
      setValue(path, list, {
        forceUpdate: true,
        updateErrors: false,
        updateModified: false
      })
    }
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const moveListItem = useCallback<UseFormListHook<V>['moveListItem']>((path, fromIndex, toIndex) => {
    const minIndex = Math.min(fromIndex, toIndex)
    const maxIndex = Math.max(fromIndex, toIndex)
    const modified = movePathIndices(getModified(), path, fromIndex, toIndex)

    for (let i = minIndex; i < maxIndex; i++) {
      modified[`${path}[${i}]`] = true
    }
    // mark array as modified
    modified[path] = true

    setModified(modified)
    setTouched(movePathIndices(getTouched(), path, fromIndex, toIndex))
    setErrors(movePathIndices(getErrors(), path, fromIndex, toIndex))

    const list = [...(getValue<unknown[]>(path) ?? [])]
    const index = Math.min(Math.max(toIndex, 0), list.length)
    const [item] = list.splice(fromIndex, 1)
    list.splice(index, 0, item)
    // fixme todo optimize to avoid rerender
    setValue(path, list, {
      forceUpdate: true,
      updateErrors: false,
      updateModified: false
    })
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const prependListItem = useCallback<UseFormListHook<V>['prependListItem']>(<T> (path: FieldPath<V>, ...items: T[]) => {
    if (items.length > 0) {
      setModified({
        ...updatePathIndices(getModified(), path, 0, items.length),
        ...Object.fromEntries(
          items.map((_, i) => ([`${path}[${i}]`, true]))
        ),
        // mark array as modified
        [path]: true
      })
      setTouched(updatePathIndices(getTouched(), path, 0, items.length))
      setErrors(updatePathIndices(getErrors(), path, 0, items.length))

      const list = [...items, ...(getValue<T[]>(path) ?? [])]
      // fixme todo optimize to avoid rerender
      setValue(path, list, {
        forceUpdate: true,
        updateErrors: false,
        updateModified: false
      })
    }
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const removeListItem = useCallback<UseFormListHook<V>['removeListItem']>((path, ...indices) => {
    if (indices.length > 0) {
      const reversedIndices = [...indices].reverse()

      let errors = { ...getErrors() }
      let modified = { ...getModified() }
      let touched = { ...getTouched() }

      for (let i = 0; i < reversedIndices.length; i++) {
        const index = reversedIndices[i]
        errors = updatePathIndices(errors, path, index, -1)
        modified = updatePathIndices(modified, path, index, -1)
        touched = updatePathIndices(touched, path, index, -1)
      }

      // mark array as modified
      modified[path] = true

      setModified(modified)
      setTouched(touched)
      setErrors(errors)

      const list = [...(getValue<unknown[]>(path) ?? [])]
      for (let i = 0; i < reversedIndices.length; i++) {
        const index = reversedIndices[i]
        list.splice(index, 1)
      }
      // fixme todo optimize to avoid rerender
      setValue(path, list, {
        forceUpdate: true,
        updateErrors: false,
        updateModified: false
      })
    }
  }, [getErrors, getModified, getTouched, getValue, setErrors, setModified, setTouched, setValue])

  const replaceListItem = useCallback<UseFormListHook<V>['replaceListItem']>(<T> (path: FieldPath<V>, index: number, item: T) => {
    const fieldPath = `${path}[${index}]`

    setModified({
      [fieldPath]: true,
      // mark array as modified
      [path]: true
    }, { partial: true })

    clearErrors([fieldPath])

    const list = [...(getValue<unknown[]>(path) ?? [])]
    list[index] = item
    // fixme todo optimize to avoid rerender
    setValue(path, list, {
      forceUpdate: true,
      updateErrors: false,
      updateModified: false
    })
  }, [clearErrors, getValue, setModified, setValue])

  const swapListItem = useCallback<UseFormListHook<V>['swapListItem']>((path, fromIndex, toIndex) => {
    setModified({
      ...swapPathIndices(getModified(), path, fromIndex, toIndex),
      [`${path}[${fromIndex}]`]: true,
      [`${path}[${toIndex}]`]: true,
      // mark array as modified
      [path]: true
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
    // fixme todo optimize to avoid rerender
    setValue(path, list, {
      forceUpdate: true,
      updateErrors: false,
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
