/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src'

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
  it('should not set errors if form is valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        number: 123,
        text: '123'
      },
      validate
    }))
    expect(hook.result.current.getErrors()).toStrictEqual({})
    await act(() => hook.result.current.validate())
    expect(hook.result.current.getError('number')).toBe(undefined)
    expect(hook.result.current.getError('text')).toBe(undefined)
  })

  it('should set errors if form is not valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        number: '123',
        text: 123
      },
      validate
    }))
    expect(hook.result.current.getErrors()).toStrictEqual({})
    await act(() => hook.result.current.validate())
    expect(hook.result.current.getError('number')).toBeDefined()
    expect(hook.result.current.getError('text')).toBeDefined()
  })
}

describe('useForm({ mode: "controlled" }).validate()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).validate()', () => {
  tests('experimental_uncontrolled')
})
