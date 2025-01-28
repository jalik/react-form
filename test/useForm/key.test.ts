/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should not return null or undefined if the field is not declared', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.key('a')).toBeDefined()
  })

  it('should return a unique key', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.key('a') !== hook.result.current.key('b')).toBe(true)
  })

  it('should return the same value for a field if the field value has not changed', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    const key = hook.result.current.key('a')
    expect(hook.result.current.key('a') === key).toBe(true)
    expect(hook.result.current.key('a') === key).toBe(true)
  })

  it('should return a different value for a field if the field value has changed', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    const key = hook.result.current.key('a')
    act(() => hook.result.current.setValue('a', 'modified', { forceUpdate: true }))
    expect(hook.result.current.key('a') !== key).toBe(mode === 'experimental_uncontrolled')
  })
}

describe('useForm({ mode: "controlled" }).key()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).key()', () => {
  tests('experimental_uncontrolled')
})
