/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('with paths', () => {
    it('should remove values of given paths only', () => {
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
      act(() => hook.result.current.removeFields(['a', 'c']))
      expect(hook.result.current.getValue('a')).toBe(undefined)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(undefined)
    })

    it('should remove initial values of given paths only', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 1,
          b: 2,
          c: 3
        }
      }))
      expect(hook.result.current.getInitialValue('a')).toBe(1)
      expect(hook.result.current.getInitialValue('b')).toBe(2)
      expect(hook.result.current.getInitialValue('c')).toBe(3)
      act(() => hook.result.current.removeFields(['a', 'c']))
      expect(hook.result.current.getInitialValue('a')).toBe(undefined)
      expect(hook.result.current.getInitialValue('b')).toBe(2)
      expect(hook.result.current.getInitialValue('c')).toBe(undefined)
    })
  })
}

describe('useForm({ mode: "controlled" }).removeValues()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).removeValues()', () => {
  tests('uncontrolled')
})
