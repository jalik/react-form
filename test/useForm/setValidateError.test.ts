/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode, Values } from '../../src'

function tests (mode: FormMode) {
  it('should set validate error', () => {
    const hook = renderHook(() => useForm<Values, string>({
      mode
    }))
    const error = new Error("Invalid")
    expect(hook.result.current.validateError).toBe(undefined)
    act(() => hook.result.current.setValidateError(error))
    expect(hook.result.current.validateError).toBe(error)
  })
}

describe('useForm({ mode: "controlled" }).setValidateError()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValidateError()', () => {
  tests('uncontrolled')
})
