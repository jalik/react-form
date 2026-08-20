/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode, Values } from '../../src'

function tests (mode: FormMode) {
  it('should set validated state', () => {
    const hook = renderHook(() => useForm<Values, string>({
      mode
    }))
    expect(hook.result.current.validated).toBe(false)
    act(() => hook.result.current.setValidated(true))
    expect(hook.result.current.validated).toBe(true)
  })
}

describe('useForm({ mode: "controlled" }).setValidated()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValidated()', () => {
  tests('uncontrolled')
})
