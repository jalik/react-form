/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('with partial = false', () => {
    it('should set modified all fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: {
          a: false,
          b: true
        }
      }))
      expect(hook.result.current.isModified()).toBe(true)
      expect(hook.result.current.isModified('a')).toBe(false)
      expect(hook.result.current.isModified('b')).toBe(true)
      act(() => hook.result.current.setModifiedFields({ a: true }, { partial: false }))
      expect(hook.result.current.isModified()).toBe(true)
      expect(hook.result.current.isModified('a')).toBe(true)
      expect(hook.result.current.isModified('b')).toBe(false)
    })
  })

  describe('with partial = true', () => {
    it('should set modified fields of given paths only', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: {
          a: false,
          b: true
        }
      }))
      expect(hook.result.current.isModified()).toBe(true)
      expect(hook.result.current.isModified('a')).toBe(false)
      expect(hook.result.current.isModified('b')).toBe(true)
      act(() => hook.result.current.setModifiedFields({ a: true }, { partial: true }))
      expect(hook.result.current.isModified()).toBe(true)
      expect(hook.result.current.isModified('a')).toBe(true)
      expect(hook.result.current.isModified('b')).toBe(true)
    })
  })
}

describe('useForm({ mode: "controlled" }).setModifiedFields()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setModifiedFields()', () => {
  tests('uncontrolled')
})
