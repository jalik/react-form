/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  it('should set field value', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.getValue('a')).toBe(undefined)
    act(() => hook.result.current.setValue('a', 1))
    expect(hook.result.current.getValue('a')).toBe(1)
    act(() => hook.result.current.setValue('a', null))
    expect(hook.result.current.getValue('a')).toBe(null)
    act(() => hook.result.current.setValue('a', undefined))
    expect(hook.result.current.getValue('a')).toBe(undefined)
  })

  it('should set value of a nested field', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: { b: [1] } }
    }))
    expect(hook.result.current.getValue('a.b[0]')).toBe(1)
    act(() => hook.result.current.setValue('a.b[0]', 2))
    expect(hook.result.current.getValue('a.b[0]')).toBe(2)
  })
}

describe('useForm({ mode: "controlled" }).setValue()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValue()', () => {
  tests('uncontrolled')
})
