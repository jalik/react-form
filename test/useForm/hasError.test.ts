/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src/useFormState'

function test (mode: FormMode) {
  it('should return true if there are errors', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialErrors: {
        a: 'invalid',
        b: 'invalid'
      }
    }))
    expect(hook.result.current.hasError).toBe(true)
  })

  it('should return false if there are no errors', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialErrors: {
        a: null,
        b: undefined,
        c: false
      }
    }))
    expect(hook.result.current.hasError).toBe(false)
  })
}

describe('useForm({ mode : "controlled" }).hasError', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).hasError', () => {
  test('experimental_uncontrolled')
})
