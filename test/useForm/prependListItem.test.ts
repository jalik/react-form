/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should prepend items to a list', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1] }
    }))
    expect(hook.result.current.getValue('a')).toStrictEqual([1])
    act(() => hook.result.current.prependListItem('a', -1, 0))
    expect(hook.result.current.getValue('a')).toStrictEqual([-1, 0, 1])
  })

  it('should update errors state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1] },
      initialErrors: {
        'a[0]': 'invalid'
      }
    }))
    expect(hook.result.current.getError('a[0]')).toBe('invalid')
    act(() => hook.result.current.prependListItem('a', -1, 0))
    expect(hook.result.current.getError('a[0]')).toBe(undefined)
    expect(hook.result.current.getError('a[1]')).toBe(undefined)
    expect(hook.result.current.getError('a[2]')).toBe('invalid')
  })

  it('should update modified state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1] },
      initialModified: {
        'a[0]': true
      }
    }))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    act(() => hook.result.current.prependListItem('a', -1, 0))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(true)
    expect(hook.result.current.isModified('a[2]')).toBe(true)
  })

  it('should update touched state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1] },
      initialTouched: {
        'a[0]': true
      }
    }))
    expect(hook.result.current.isTouched('a[0]')).toBe(true)
    act(() => hook.result.current.prependListItem('a', -1, 0))
    expect(hook.result.current.isTouched('a[0]')).toBe(false)
    expect(hook.result.current.isTouched('a[1]')).toBe(false)
    expect(hook.result.current.isTouched('a[2]')).toBe(true)
  })
}

describe('useForm({ mode: "controlled" }).prependListItem()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).prependListItem()', () => {
  tests('experimental_uncontrolled')
})
