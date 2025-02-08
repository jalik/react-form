/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode, Values } from '../../src'

function tests (mode: FormMode) {
  it('should set field error', () => {
    const hook = renderHook(() => useForm<Values, string>({
      mode
    }))
    expect(hook.result.current.getError('a')).toBe(undefined)
    act(() => hook.result.current.setError('a', 'required'))
    expect(hook.result.current.getError('a')).toBe('required')
    act(() => hook.result.current.setError('a', undefined))
    expect(hook.result.current.getError('a')).toBe(undefined)
  })
}

describe('useForm({ mode: "controlled" }).setError()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setError()', () => {
  tests('uncontrolled')
})
