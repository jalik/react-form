/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm, { FormMode } from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'

function test (mode: FormMode) {
  it('should clear errors', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialErrors: {
        a: 'invalid',
        b: 'invalid'
      },
      onSubmit () {
        return Promise.resolve(true)
      }
    }))
    act(() => hook.result.current.clearErrors())
    expect(hook.result.current.errors).toStrictEqual({})
  })
}

describe('useForm({ mode : "controlled" }).clearErrors()', () => {
  test('controlled')
})

describe('useForm({ mode : "uncontrolled" }).clearErrors()', () => {
  test('experimental_uncontrolled')
})
