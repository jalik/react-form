/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function test (mode: FormMode) {
  it('should return true if the form was touched', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialTouched: { a: true }
    }))
    expect(hook.result.current.touched).toBe(true)
  })

  it('should return false if the form was not touched', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialTouched: { a: false }
    }))
    expect(hook.result.current.touched).toBe(false)
  })
}

describe('useForm({ mode : "controlled" }).touched', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).touched', () => {
  test('experimental_uncontrolled')
})
