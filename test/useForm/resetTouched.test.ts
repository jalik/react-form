/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  const initialTouched = {
    a: true,
    b: true,
    c: false
  }

  describe('without arguments', () => {
    it('should reset touched fields to their initial state', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
      act(() => hook.result.current.setTouched({ a: !initialTouched.a }))
      expect(hook.result.current.isTouched('a')).toBe(!initialTouched.a)
      act(() => hook.result.current.resetTouched())
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
    })
  })

  describe('with paths', () => {
    it('should reset touched state of given fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
      act(() => hook.result.current.setTouched({
        a: !initialTouched.a,
        b: !initialTouched.b,
        c: !initialTouched.c
      }))
      expect(hook.result.current.isTouched('a')).toBe(!initialTouched.a)
      expect(hook.result.current.isTouched('b')).toBe(!initialTouched.b)
      expect(hook.result.current.isTouched('c')).toBe(!initialTouched.c)
      act(() => hook.result.current.resetTouched(['a', 'c']))
      expect(hook.result.current.isTouched('a')).toBe(initialTouched.a)
      expect(hook.result.current.isTouched('b')).toBe(!initialTouched.b)
      expect(hook.result.current.isTouched('c')).toBe(initialTouched.c)
    })
  })
}

describe('useForm({ mode: "controlled" }).resetTouched()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).resetTouched()', () => {
  tests('uncontrolled')
})
