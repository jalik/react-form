/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  it('should set initial values', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    const initialValues = {
      a: 1,
      b: 2
    }
    expect(hook.result.current.getInitialValues()).toBe(undefined)
    expect(hook.result.current.getValues()).toStrictEqual({})
    expect(hook.result.current.initialized).toBe(false)
    act(() => hook.result.current.setInitialValues(initialValues))
    expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
    expect(hook.result.current.getValues()).toStrictEqual(initialValues)
    expect(hook.result.current.initialized).toBe(true)
  })

  it('should replace modified values', () => {
    const initialValues = {
      a: 1,
      b: 2
    }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))
    const values = {
      a: 3,
      b: 4
    }
    expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
    expect(hook.result.current.getValues()).toStrictEqual(initialValues)
    act(() => hook.result.current.setInitialValues(values))
    expect(hook.result.current.getInitialValues()).toStrictEqual(values)
    expect(hook.result.current.getValues()).toStrictEqual(values)
    expect(hook.result.current.initialized).toBe(true)
  })
}

describe('useForm({ mode : "controlled" }).setInitialValues()', () => {
  tests('controlled')
})

describe('useForm({ mode : "uncontrolled" }).setInitialValues()', () => {
  tests('experimental_uncontrolled')
})
