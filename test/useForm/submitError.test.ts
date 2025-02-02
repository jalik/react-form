/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src'

async function onSubmit () {
  throw new Error('Unknown error')
}

function tests (mode: FormMode) {
  const initialValues = {
    a: 1,
    b: 2
  }
  it('should contain the error thrown during submission', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      onSubmit
    }))
    expect(hook.result.current.submitError).toBeUndefined()
    await act(() => hook.result.current.submit())
    expect(hook.result.current.submitError).toBeDefined()
  })
}

describe('useForm({ mode: "controlled" }).submitError', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).submitError', () => {
  tests('experimental_uncontrolled')
})
