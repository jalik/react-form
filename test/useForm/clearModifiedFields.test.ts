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
    it('should clear all modified fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: { a: true }
      }))
      expect(hook.result.current.isModified('a')).toBe(true)
      act(() => hook.result.current.clearModifiedFields())
      expect(hook.result.current.isModified('a')).toBe(false)
    })
  })

  describe('with paths', () => {
    it('should clear specific modified fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: {
          a: true,
          b: true,
          c: true
        }
      }))
      expect(hook.result.current.isModified('a')).toBe(true)
      expect(hook.result.current.isModified('b')).toBe(true)
      act(() => hook.result.current.clearModifiedFields(['a', 'c']))
      expect(hook.result.current.isModified('a')).toBe(false)
      expect(hook.result.current.isModified('b')).toBe(true)
      expect(hook.result.current.isModified('c')).toBe(false)
    })
  })
}

describe('useForm({ mode: "controlled" }).clearModifiedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clearModifiedFields()', () => {
  tests('uncontrolled')
})
