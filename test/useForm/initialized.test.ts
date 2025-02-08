/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function test (mode: FormMode) {
  it('should return true if initial values are defined', () => {
    const initialValues = { a: 1 }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))
    expect(hook.result.current.initialized).toBe(true)
    expect(hook.result.current.getInitialValues()).toBeDefined()
  })

  it('should return false if initial values are undefined', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.initialized).toBe(false)
    expect(hook.result.current.getInitialValues()).toBe(undefined)
  })
}

describe('useForm({ mode : "controlled" }).initialized', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).initialized', () => {
  test('uncontrolled')
})
