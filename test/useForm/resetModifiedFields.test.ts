/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  const initialModified = {
    a: true,
    b: true,
    c: false
  }

  describe('without arguments', () => {
    it('should reset modified fields to their initial state', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.getModifiedFields()).toStrictEqual(initialModified)
      act(() => hook.result.current.setModifiedFields({ a: !initialModified.a }))
      expect(hook.result.current.isModified('a')).toBe(!initialModified.a)
      act(() => hook.result.current.resetModifiedFields())
      expect(hook.result.current.getModifiedFields()).toStrictEqual(initialModified)
    })
  })

  describe('with paths', () => {
    it('should reset modified state of given fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.getModifiedFields()).toStrictEqual(initialModified)
      act(() => hook.result.current.setModifiedFields({
        a: !initialModified.a,
        b: !initialModified.b,
        c: !initialModified.c
      }))
      expect(hook.result.current.isModified('a')).toBe(!initialModified.a)
      expect(hook.result.current.isModified('b')).toBe(!initialModified.b)
      expect(hook.result.current.isModified('c')).toBe(!initialModified.c)
      act(() => hook.result.current.resetModifiedFields(['a', 'c']))
      expect(hook.result.current.isModified('a')).toBe(initialModified.a)
      expect(hook.result.current.isModified('b')).toBe(!initialModified.b)
      expect(hook.result.current.isModified('c')).toBe(initialModified.c)
    })
  })
}

describe('useForm({ mode: "controlled" }).resetModifiedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).resetModifiedFields()', () => {
  tests('uncontrolled')
})
