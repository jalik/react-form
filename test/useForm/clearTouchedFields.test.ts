/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should clear touched fields', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialTouched: { a: true }
    }))
    expect(hook.result.current.isTouched()).toBe(true)

    act(() => hook.result.current.clearTouchedFields())
    expect(hook.result.current.isTouched()).toBe(false)
  })
}

describe('useForm({ mode: "controlled" }).clearTouchedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clearTouchedFields()', () => {
  tests('experimental_uncontrolled')
})
