/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    it('should reset all values', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 1,
          b: 2,
          c: 3
        }
      }))
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(3)
      act(() => hook.result.current.setValues({ b: 0 }))
      act(() => hook.result.current.reset())
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(3)
    })
  })

  describe('with paths', () => {
    it('should reset values of given paths only', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 1,
          b: 2,
          c: 3
        }
      }))
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(3)
      act(() => hook.result.current.setValues({ b: 0 }))
      act(() => hook.result.current.reset(['a', 'c']))
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(0)
      expect(hook.result.current.getValue('c')).toBe(3)
    })
  })
}

describe('useForm({ mode: "controlled" }).reset()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).reset()', () => {
  tests('experimental_uncontrolled')
})
