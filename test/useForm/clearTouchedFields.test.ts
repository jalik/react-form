/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    it('should clear all touched fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: { a: true }
      }))
      expect(hook.result.current.isTouched('a')).toBe(true)
      act(() => hook.result.current.clearTouchedFields())
      expect(hook.result.current.isTouched('a')).toBe(false)
    })
  })

  describe('with paths', () => {
    it('should clear touched fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: {
          a: true,
          b: true,
          c: true
        }
      }))
      expect(hook.result.current.isTouched('a')).toBe(true)
      expect(hook.result.current.isTouched('b')).toBe(true)
      act(() => hook.result.current.clearTouchedFields(['a', 'c']))
      expect(hook.result.current.isTouched('a')).toBe(false)
      expect(hook.result.current.isTouched('b')).toBe(true)
      expect(hook.result.current.isTouched('c')).toBe(false)
    })
  })
}

describe('useForm({ mode: "controlled" }).clearTouchedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clearTouchedFields()', () => {
  tests('uncontrolled')
})
