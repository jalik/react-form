/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it, vi } from 'vitest'
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
  it('should call onSubmit function', async () => {
    const callback = vi.fn(onSubmit)
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      onSubmit: callback
    }))
    await act(() => hook.result.current.submit())
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should pass values to onSubmit function', async () => {
    let v: Record<string, unknown> | undefined
    const callback = vi.fn(async (values: Record<string, unknown>) => {
      v = values
      return onSubmit(values)
    })
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      onSubmit: callback
    }))
    await act(() => hook.result.current.submit())
    expect(v).toStrictEqual(initialValues)
  })
}

describe('useForm({ mode: "controlled" }).submit()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).submit()', () => {
  tests('uncontrolled')
})
