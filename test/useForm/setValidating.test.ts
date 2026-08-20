/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode, Values } from '../../src'

function tests (mode: FormMode) {
  it('should set validating state', () => {
    const hook = renderHook(() => useForm<Values, string>({
      mode
    }))
    expect(hook.result.current.validating).toBe(false)
    act(() => hook.result.current.setValidating(true))
    expect(hook.result.current.validating).toBe(true)
  })
}

describe('useForm({ mode: "controlled" }).setValidating()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValidating()', () => {
  tests('uncontrolled')
})
