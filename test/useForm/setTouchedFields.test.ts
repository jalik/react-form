/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('with partial = false', () => {
    it('should set touched all fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: {
          a: false,
          b: true
        }
      }))
      expect(hook.result.current.isTouched()).toBe(true)
      expect(hook.result.current.isTouched('a')).toBe(false)
      expect(hook.result.current.isTouched('b')).toBe(true)
      act(() => hook.result.current.setTouchedFields({ a: true }, { partial: false }))
      expect(hook.result.current.isTouched()).toBe(true)
      expect(hook.result.current.isTouched('a')).toBe(true)
      expect(hook.result.current.isTouched('b')).toBe(false)
    })
  })

  describe('with partial = true', () => {
    it('should set touched fields of given paths only', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: {
          a: false,
          b: true
        }
      }))
      expect(hook.result.current.isTouched()).toBe(true)
      expect(hook.result.current.isTouched('a')).toBe(false)
      expect(hook.result.current.isTouched('b')).toBe(true)
      act(() => hook.result.current.setTouchedFields({ a: true }, { partial: true }))
      expect(hook.result.current.isTouched()).toBe(true)
      expect(hook.result.current.isTouched('a')).toBe(true)
      expect(hook.result.current.isTouched('b')).toBe(true)
    })
  })
}

describe('useForm({ mode: "controlled" }).setTouchedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setTouchedFields()', () => {
  tests('uncontrolled')
})
