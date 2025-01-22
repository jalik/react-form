/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should replace an item in a list', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1] },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.getValue('a')).toStrictEqual([1])
    act(() => hook.result.current.appendListItem('a', 2))
    expect(hook.result.current.getValue('a')).toStrictEqual([1, 2])
  })

  it('should update errors state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 0, 1] },
      initialErrors: {
        'a[0]': 'invalid',
        'a[2]': 'invalid'
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.getError('a[0]')).toBe('invalid')
    expect(hook.result.current.getError('a[1]')).toBe(undefined)
    expect(hook.result.current.getError('a[2]')).toBe('invalid')
    act(() => hook.result.current.replaceListItem('a', 2, 0))
    expect(hook.result.current.getError('a[0]')).toBe('invalid')
    expect(hook.result.current.getError('a[1]')).toBe(undefined)
    expect(hook.result.current.getError('a[2]')).toBe(undefined)
  })

  it('should update modified state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 0, 0] },
      initialModified: {
        'a[0]': true
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(false)
    expect(hook.result.current.isModified('a[2]')).toBe(false)
    act(() => hook.result.current.replaceListItem('a', 1, 1))
    expect(hook.result.current.isModified('a[0]')).toBe(true)
    expect(hook.result.current.isModified('a[1]')).toBe(true)
    expect(hook.result.current.isModified('a[2]')).toBe(false)
  })

  it('should update touched state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1, 0, 0] },
      initialTouched: {
        'a[0]': true
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.isTouched('a[0]')).toBe(true)
    expect(hook.result.current.isTouched('a[1]')).toBe(false)
    expect(hook.result.current.isTouched('a[2]')).toBe(false)
    act(() => hook.result.current.replaceListItem('a', 1, 1))
    expect(hook.result.current.isTouched('a[0]')).toBe(true)
    expect(hook.result.current.isTouched('a[1]')).toBe(false)
    expect(hook.result.current.isTouched('a[2]')).toBe(false)
  })
}

describe('useForm({ mode: "controlled" }).replaceListItem()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).replaceListItem()', () => {
  tests('experimental_uncontrolled')
})
