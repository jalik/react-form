/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import useForm from '../src/useForm'
import useFieldArray from '../src/useFieldArray'
import { act, renderHook } from '@testing-library/react'

type Item = {
  id: number
}
type ItemsForm = {
  items: Item[]
}

describe('useFieldArray()', () => {
  it('should synchronize fields when value changes', () => {
    const initialValues: ItemsForm = {
      items: [{ id: 1 }]
    }
    const { result: form } = renderHook(() => {
      return useForm({
        initialValues,
        onSubmit: () => Promise.resolve(true)
      })
    })

    act(() => {
      form.current.setValue('items', [{ id: 2 }])
    })

    expect(form.current.values.items).toStrictEqual([{ id: 2 }])
  })

  it('should return stable fields', () => {
    const initialValues: ItemsForm = {
      items: [{ id: 1 }, { id: 2 }]
    }
    const { result: form } = renderHook(() => {
      return useForm({
        initialValues,
        onSubmit: () => Promise.resolve(true)
      })
    })
    const { result: array } = renderHook(() => {
      return useFieldArray<Partial<Item>, ItemsForm>({
        name: 'items',
        context: form.current,
        defaultValue: {}
      })
    })

    expect(array.current.fields).toBeInstanceOf(Array)
    expect(array.current.fields.length).toBe(initialValues.items.length)
    expect(typeof array.current.fields[0].key).toBe('string')
    expect(array.current.fields[0].name).toBe('items[0]')
    expect(array.current.fields[0].value).toStrictEqual(initialValues.items[0])
  })

  describe('append(...values)', () => {
    it('should append defaultValue to array', () => {
      const initialValues: ItemsForm = {
        items: []
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: {}
        })
      })

      act(() => {
        array.current.append({ id: 1 }, { id: 2 })
        array.current.append({ id: 3 })
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ])
    })
  })

  describe('handleAppend()', () => {
    it('should append values to array', () => {
      const initialValues: ItemsForm = {
        items: []
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        let count = 0
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: () => {
            count += 1
            return { id: count }
          }
        })
      })

      act(() => {
        array.current.handleAppend(new MouseEvent('click'))
        array.current.handleAppend(new MouseEvent('click'))
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 1 },
        { id: 2 }
      ])
    })
  })

  describe('handlePrepend()', () => {
    it('should prepend defaultValue to array', () => {
      const initialValues: ItemsForm = {
        items: []
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        let count = 0
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: () => {
            count += 1
            return { id: count }
          }
        })
      })

      act(() => {
        array.current.handlePrepend(new MouseEvent('click'))
        array.current.handlePrepend(new MouseEvent('click'))
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 2 },
        { id: 1 }
      ])
    })
  })

  describe('handleRemove()', () => {
    it('should remove value by index from array', () => {
      const initialValues: ItemsForm = {
        items: [
          { id: 1 },
          { id: 2 },
          { id: 3 }
        ]
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: { id: null }
        })
      })

      act(() => {
        array.current.handleRemove(0)(new MouseEvent('click'))
        array.current.handleRemove(1)(new MouseEvent('click'))
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 2 }
      ])
    })
  })

  describe('insert(index, ...values)', () => {
    it('should insert values at an index in the array', () => {
      const initialValues: ItemsForm = {
        items: [
          { id: 1 },
          { id: 2 }
        ]
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: {}
        })
      })

      act(() => {
        array.current.insert(1, { id: 3 }, { id: 4 })
        array.current.insert(1, { id: 5 })
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 1 },
        { id: 5 },
        { id: 3 },
        { id: 4 },
        { id: 2 }
      ])
    })
  })

  describe('move(from, to)', () => {
    it('should move value from an index to another', () => {
      const initialValues: ItemsForm = {
        items: [
          { id: 1 },
          { id: 2 },
          { id: 3 }
        ]
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: { id: null }
        })
      })

      act(() => {
        array.current.move(0, 2)
        array.current.move(2, 1)
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 2 },
        { id: 1 },
        { id: 3 }
      ])
    })
  })

  describe('prepend(...values)', () => {
    it('should prepend values to array', () => {
      const initialValues: ItemsForm = {
        items: []
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: {}
        })
      })

      act(() => {
        array.current.prepend({ id: 1 }, { id: 2 })
        array.current.prepend({ id: 3 })
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 3 },
        { id: 1 },
        { id: 2 }
      ])
    })
  })

  describe('remove(...indexes)', () => {
    it('should remove values at indexes in the array', () => {
      const initialValues: ItemsForm = {
        items: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 }
        ]
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: { id: null }
        })
      })

      act(() => {
        array.current.remove(1, 3)
        array.current.remove(0)
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 3 }
      ])
    })
  })

  describe('swap(from, to)', () => {
    it('should swap values from an index to another', () => {
      const initialValues: ItemsForm = {
        items: [
          { id: 1 },
          { id: 2 },
          { id: 3 }
        ]
      }
      const { result: form } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })
      const { result: array } = renderHook(() => {
        return useFieldArray({
          name: 'items',
          context: form.current,
          defaultValue: { id: null }
        })
      })

      act(() => {
        array.current.swap(0, 2)
        array.current.swap(2, 1)
      })

      expect(form.current.values.items).toStrictEqual([
        { id: 3 },
        { id: 1 },
        { id: 2 }
      ])
    })
  })
})
