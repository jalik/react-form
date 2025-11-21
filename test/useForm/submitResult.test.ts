/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src'

async function onSubmit (values: Record<string, unknown>) {
  return {
    success: true,
    values
  }
}

function tests (mode: FormMode) {
  const initialValues = {
    a: 1,
    b: 2
  }
  it('should contain the result returned by onSubmit()', async () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      onSubmit
    }))
    expect(hook.result.current.submitResult).toBeUndefined()
    await act(() => hook.result.current.submit())
    expect(hook.result.current.submitResult).toBeDefined()
    expect(hook.result.current.submitResult?.success).toBeDefined()
  })
}

describe('useForm({ mode: "controlled" }).submitResult', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).submitResult', () => {
  tests('uncontrolled')
})
