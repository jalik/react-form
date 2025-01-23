/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should clear all values', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialModified: { a: true }
    }))
    expect(hook.result.current.isModified()).toBe(true)

    act(() => hook.result.current.clear())
    expect(hook.result.current.isModified()).toBe(false)
  })
}

describe('useForm({ mode: "controlled" }).clear()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clear()', () => {
  tests('experimental_uncontrolled')
})
