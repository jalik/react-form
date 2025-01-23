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
    expect(hook.result.current.getInitialValues()).toBe(undefined)
    expect(hook.result.current.getValues()).toStrictEqual({})

    act(() => hook.result.current.setInitialValues({
      a: 1,
      b: 2
    }))
    expect(hook.result.current.getInitialValues()).toStrictEqual({
      a: 1,
      b: 2
    })
    expect(hook.result.current.getValues()).toStrictEqual({
      a: 1,
      b: 2
    })
    expect(hook.result.current.initialized).toBe(true)
  })

  it('should replace modified values', () => {
    const hook = renderHook(() => useForm({
      mode
    }))

    act(() => hook.result.current.setValues({
      a: 1,
      b: 2
    }))
    act(() => hook.result.current.setInitialValues({
      a: 3,
      b: 4
    }))
    expect(hook.result.current.getInitialValues()).toStrictEqual({
      a: 3,
      b: 4
    })
    expect(hook.result.current.getValues()).toStrictEqual({
      a: 3,
      b: 4
    })
  })
}

describe('useForm({ mode : "controlled" }).setInitialValues()', () => {
  tests('controlled')
})

describe('useForm({ mode : "uncontrolled" }).setInitialValues()', () => {
  tests('experimental_uncontrolled')
})
