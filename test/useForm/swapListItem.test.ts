/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  it('should swap items in a list', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 2, 3] }
    }))
    expect(hook.result.current.getValue('a')).toStrictEqual([1, 2, 3])
    act(() => hook.result.current.swapListItem('a', 0, 2))
    expect(hook.result.current.getValue('a')).toStrictEqual([3, 2, 1])
  })

  it('should update errors state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 2, 3] },
      initialErrors: {
        'a[0]': 'invalid',
        'a[1]': 'invalid'
      }
    }))
    expect(hook.result.current.getError('a[0]')).toBe('invalid')
    expect(hook.result.current.getError('a[1]')).toBe('invalid')
    expect(hook.result.current.getError('a[2]')).toBe(undefined)
    act(() => hook.result.current.swapListItem('a', 0, 2))
    expect(hook.result.current.getError('a[0]')).toBe(undefined)
    expect(hook.result.current.getError('a[1]')).toBe('invalid')
    expect(hook.result.current.getError('a[2]')).toBe('invalid')
  })

  it('should update modified state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 2, 3] },
      initialModified: {
        'a[0]': true,
        'a[1]': true
      }
    }))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(true)
    expect(hook.result.current.isModified('a[2]')).toBe(false)
    act(() => hook.result.current.swapListItem('a', 0, 2))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(true)
    expect(hook.result.current.isModified('a[2]')).toBe(true)
  })

  it('should update touched state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 2, 3] },
      initialTouched: {
        'a[0]': true,
        'a[1]': true
      }
    }))
    expect(hook.result.current.isTouched('a[0]')).toBe(true)
    expect(hook.result.current.isTouched('a[1]')).toBe(true)
    expect(hook.result.current.isTouched('a[2]')).toBe(false)
    act(() => hook.result.current.swapListItem('a', 0, 2))
    expect(hook.result.current.isTouched('a[0]')).toBe(false)
    expect(hook.result.current.isTouched('a[1]')).toBe(true)
    expect(hook.result.current.isTouched('a[2]')).toBe(true)
  })
}

describe('useForm({ mode: "controlled" }).swapListItem()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).swapListItem()', () => {
  tests('uncontrolled')
})
