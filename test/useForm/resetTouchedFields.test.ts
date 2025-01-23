/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should reset touched fields to their initial state', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialTouched: { a: true }
    }))
    expect(hook.result.current.isTouched()).toBe(true)
    act(() => hook.result.current.setTouchedFields({ a: false }))
    expect(hook.result.current.isTouched('a')).toBe(false)
    act(() => hook.result.current.resetTouched())
    expect(hook.result.current.isTouched('a')).toBe(true)
  })
}

describe('useForm({ mode: "controlled" }).resetTouchedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).resetTouchedFields()', () => {
  tests('experimental_uncontrolled')
})
