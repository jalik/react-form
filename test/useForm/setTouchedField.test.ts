/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  it('should set touched field value', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialTouched: {
        a: false,
        b: false
      }
    }))
    expect(hook.result.current.isTouched()).toBe(false)
    expect(hook.result.current.isTouched('a')).toBe(false)
    expect(hook.result.current.isTouched('b')).toBe(false)
    act(() => hook.result.current.setTouchedField('b', true))
    expect(hook.result.current.isTouched()).toBe(true)
    expect(hook.result.current.isTouched('a')).toBe(false)
    expect(hook.result.current.isTouched('b')).toBe(true)
  })
}

describe('useForm({ mode: "controlled" }).setTouchedField()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setTouchedField()', () => {
  tests('uncontrolled')
})
