/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { Errors, FormMode } from '../../src'

async function validate (): Promise<Errors> {
  throw new Error('Unknown error')
}

function tests (mode: FormMode) {
  const initialValues = {
    a: 1,
    b: 2
  }
  it('should contain the error thrown during validation', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      validate
    }))
    expect(hook.result.current.validateError).toBeUndefined()
    await act(() => hook.result.current.validate())
    expect(hook.result.current.validateError).toBeDefined()
  })
}

describe('useForm({ mode: "controlled" }).validateError', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).validateError', () => {
  tests('uncontrolled')
})
