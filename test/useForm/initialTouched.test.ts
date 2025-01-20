/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should set initial touched fields', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialTouched: {
        a: true,
        b: false
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.isTouched('a')).toBe(true)
    expect(hook.result.current.isTouched('b')).toBe(false)
    expect(hook.result.current.isTouched()).toBe(true)
  })

  it('should set field as touched when value changes', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: 'test' },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.isTouched('a')).toBe(false)
    expect(hook.result.current.isTouched()).toBe(false)

    act(() => hook.result.current.setValue('a', 'modified'))
    expect(hook.result.current.isTouched('a')).toBe(true)
    expect(hook.result.current.isTouched()).toBe(true)
  })
}

describe('useForm({ mode: "controlled", initialTouched })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", initialTouched })', () => {
  tests('experimental_uncontrolled')
})
