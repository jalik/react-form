/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should insert items to a list', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 4, 5] },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.getValue('a')).toStrictEqual([1, 4, 5])
    act(() => hook.result.current.insertListItem('a', 1, 2, 3))
    expect(hook.result.current.getValue('a')).toStrictEqual([1, 2, 3, 4, 5])
  })

  it('should update errors state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 4, 5] },
      initialErrors: {
        'a[0]': 'invalid',
        'a[1]': 'invalid'
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.getError('a[0]')).toBe('invalid')
    expect(hook.result.current.getError('a[1]')).toBe('invalid')
    expect(hook.result.current.getError('a[2]')).toBe(undefined)
    act(() => hook.result.current.insertListItem('a', 1, 2, 3))
    expect(hook.result.current.getError('a[0]')).toBe('invalid')
    expect(hook.result.current.getError('a[1]')).toBe(undefined)
    expect(hook.result.current.getError('a[2]')).toBe(undefined)
    expect(hook.result.current.getError('a[3]')).toBe('invalid')
    expect(hook.result.current.getError('a[4]')).toBe(undefined)
  })

  it('should update modified state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 4, 5] },
      initialModified: {
        'a[0]': true,
        'a[1]': true
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(true)
    expect(hook.result.current.isModified('a[2]')).toBe(false)
    act(() => hook.result.current.insertListItem('a', 1, 2, 3))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(true)
    expect(hook.result.current.isModified('a[2]')).toBe(true)
    expect(hook.result.current.isModified('a[3]')).toBe(true)
    expect(hook.result.current.isModified('a[4]')).toBe(false)
  })

  it('should update touched state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 4, 5] },
      initialTouched: {
        'a[0]': true,
        'a[1]': true
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.isTouched('a[0]')).toBe(true)
    expect(hook.result.current.isTouched('a[1]')).toBe(true)
    expect(hook.result.current.isTouched('a[2]')).toBe(false)
    act(() => hook.result.current.insertListItem('a', 1, 2, 3))
    expect(hook.result.current.isTouched('a[0]')).toBe(true)
    expect(hook.result.current.isTouched('a[1]')).toBe(false)
    expect(hook.result.current.isTouched('a[2]')).toBe(false)
    expect(hook.result.current.isTouched('a[3]')).toBe(true)
    expect(hook.result.current.isTouched('a[4]')).toBe(false)
  })
}

describe('useForm({ mode: "controlled" }).insertListItem()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).insertListItem()', () => {
  tests('experimental_uncontrolled')
})
