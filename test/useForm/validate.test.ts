/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm, { FormMode } from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'

const TYPE_ERROR = 'invalid type'

async function validate (values: Record<string, unknown>) {
  const errors: Record<string, string> = {}

  if (values.text != null && typeof values.text !== 'string') {
    errors.text = TYPE_ERROR
  }
  if (values.number != null && typeof values.number !== 'string') {
    errors.number = TYPE_ERROR
  }
  return errors
}

function tests (mode: FormMode) {
  it('should set validated = true when form is valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { text: '123' },
      validate
    }))
    expect(hook.result.current.validated).toBe(false)
    await act(() => hook.result.current.validate())
    expect(hook.result.current.validated).toBe(true)
  })

  it('should set validated = false when form is not valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { text: 123 },
      validate
    }))
    expect(hook.result.current.validated).toBe(false)
    await act(() => hook.result.current.validate())
    expect(hook.result.current.validated).toBe(false)
  })

  it('should set errors when form is not valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        text: 123,
        number: '123'
      },
      validate
    }))
    expect(hook.result.current.getError('text')).toBeUndefined()
    await act(() => hook.result.current.validate())
    expect(hook.result.current.getError('text')).toBe(TYPE_ERROR)
  })
}

describe('useForm({ mode: "controlled" }).validate()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).validate()', () => {
  tests('experimental_uncontrolled')
})
