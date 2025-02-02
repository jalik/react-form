/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src'

const TYPE_ERROR = 'invalid type'

async function validateField (path: string, value: unknown) {
  if (path === 'text') {
    if (value != null && typeof value !== 'string') {
      return TYPE_ERROR
    }
  } else if (path === 'number') {
    if (value != null && typeof value !== 'number') {
      return TYPE_ERROR
    }
  }
  return undefined
}

function tests (mode: FormMode) {
  it('should not set error if field is valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        number: 123,
        text: '123'
      },
      validateField
    }))
    expect(hook.result.current.getErrors()).toStrictEqual({})
    await act(() => hook.result.current.validateField('number'))
    expect(hook.result.current.getError('number')).toBe(undefined)
    expect(hook.result.current.getError('text')).toBe(undefined)
  })

  it('should set error if field is not valid', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        number: '123',
        text: 123
      },
      validateField
    }))
    expect(hook.result.current.getErrors()).toStrictEqual({})
    await act(() => hook.result.current.validateField('number'))
    expect(hook.result.current.getError('number')).toBeDefined()
    expect(hook.result.current.getError('text')).toBe(undefined)
  })
}

describe('useForm({ mode: "controlled" }).validateField()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).validateField()', () => {
  tests('experimental_uncontrolled')
})
