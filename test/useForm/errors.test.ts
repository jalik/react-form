/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function test (mode: FormMode) {
  it('should return all errors', () => {
    const initialErrors = {
      a: 'invalid',
      b: 'required'
    }
    const hook = renderHook(() => useForm({
      mode,
      initialErrors
    }))
    expect(hook.result.current.errors).toStrictEqual(initialErrors)
  })
}

describe('useForm({ mode : "controlled" }).errors', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).errors', () => {
  test('experimental_uncontrolled')
})
