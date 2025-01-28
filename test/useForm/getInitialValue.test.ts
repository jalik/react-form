/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should return initial value if set', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: null
      }
    }))
    expect(hook.result.current.getInitialValue('a')).toBe(1)
    expect(hook.result.current.getInitialValue('b')).toBe(null)
  })

  it('should return undefined if not set', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: null
      }
    }))
    expect(hook.result.current.getInitialValue('c')).toBe(undefined)
  })

  it('should return default value if set and initial value is missing', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: null
      }
    }))
    expect(hook.result.current.getInitialValue('c', 2)).toBe(2)
  })
}

describe('useForm({ mode: "controlled" }).getInitialValue()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getInitialValue()', () => {
  tests('experimental_uncontrolled')
})
