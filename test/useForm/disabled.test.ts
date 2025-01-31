/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function test (mode: FormMode) {
  const initialValues = { a: 1 }
  it('should return true if options.disabled = true', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      disabled: true
    }))
    expect(hook.result.current.disabled).toBe(true)
  })

  it('should return true if options.disabled = false', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      disabled: false
    }))
    expect(hook.result.current.disabled).toBe(false)
  })

  it('should return true if form is not initialized', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.disabled).toBe(true)
  })

  // todo test disabled when submitting
}

describe('useForm({ mode : "controlled" }).disabled', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).disabled', () => {
  test('experimental_uncontrolled')
})
