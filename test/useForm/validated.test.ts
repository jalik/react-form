/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src/useFormState'

const TYPE_ERROR = 'invalid type'

async function validate (values: Record<string, unknown>) {
  const errors: Record<string, string> = {}

  if (values.text != null && typeof values.text !== 'string') {
    errors.text = TYPE_ERROR
  }
  if (values.number != null && typeof values.number !== 'number') {
    errors.number = TYPE_ERROR
  }
  return errors
}

function tests (mode: FormMode) {
  it('should return true if form is valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        number: 123,
        text: '123'
      },
      validate
    }))
    expect(hook.result.current.validated).toBe(false)
    await act(() => hook.result.current.validate())
    expect(hook.result.current.validated).toBe(true)
  })

  it('should return false if form is not valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        number: '123',
        text: 123
      },
      validate
    }))
    expect(hook.result.current.validated).toBe(false)
    await act(() => hook.result.current.validate())
    expect(hook.result.current.validated).toBe(false)
  })
}

describe('useForm({ mode: "controlled" }).validated', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).validated', () => {
  tests('experimental_uncontrolled')
})
