/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should allow initialValues to be undefined', () => {
    const hook = renderHook(() => useForm({
      mode,
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.initialValues).toBe(undefined)
  })

  it('should set initial values', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: 2,
        c: null
      },
      onSubmit: () => Promise.resolve()
    }))
    expect(hook.result.current.getValue('a')).toBe(1)
    expect(hook.result.current.getValue('b')).toBe(2)
    expect(hook.result.current.getValue('c')).toBe(null)
  })
}

describe('useForm({ mode: "controlled", initialValues })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", initialValues })', () => {
  tests('experimental_uncontrolled')
})
