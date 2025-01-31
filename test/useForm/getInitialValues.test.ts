/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src/useFormState'

function tests (mode: FormMode) {
  it('should return initial values if set', () => {
    const initialValues = {
      a: 1,
      b: null
    }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))
    expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
  })

  it('should return undefined if not set', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.getInitialValues()).toBe(undefined)
  })
}

describe('useForm({ mode: "controlled" }).getInitialValues()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getInitialValues()', () => {
  tests('experimental_uncontrolled')
})
