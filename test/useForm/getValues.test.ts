/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  it('should return values if set', () => {
    const initialValues = {
      a: 1,
      b: null
    }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))
    expect(hook.result.current.getValues()).toStrictEqual(initialValues)
  })

  it('should return empty object if not set', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.getValues()).toStrictEqual({})
  })
}

describe('useForm({ mode: "controlled" }).getValues()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getValues()', () => {
  tests('uncontrolled')
})
