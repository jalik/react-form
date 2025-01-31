/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src/useFormState'

function tests (mode: FormMode) {
  it('should return value if set', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: null
      }
    }))
    expect(hook.result.current.getValue('a')).toBe(1)
    expect(hook.result.current.getValue('b')).toBe(null)
  })

  it('should return undefined if not set', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: null
      }
    }))
    expect(hook.result.current.getValue('c')).toBe(undefined)
  })

  it('should return default value if set and value is missing', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: null
      }
    }))
    expect(hook.result.current.getValue('c', 2)).toBe(2)
  })
}

describe('useForm({ mode: "controlled" }).getValue()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getValue()', () => {
  tests('experimental_uncontrolled')
})
