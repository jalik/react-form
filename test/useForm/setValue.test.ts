/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

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
}

describe('useForm({ mode: "controlled" }).setValue()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValue()', () => {
  tests('experimental_uncontrolled')
})
