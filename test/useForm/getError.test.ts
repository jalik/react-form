/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  const initialErrors = {
    a: 'invalid',
    b: 'required'
  }

  it('should return field error', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialErrors
    }))
    expect(hook.result.current.getError('a')).toBe(initialErrors.a)
    expect(hook.result.current.getError('b')).toBe(initialErrors.b)
  })
}

describe('useForm({ mode: "controlled" }).getError()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getError()', () => {
  tests('uncontrolled')
})
