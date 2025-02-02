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
    it('should clear all values', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 1,
          b: 2
        }
      }))
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
      act(() => hook.result.current.clear())
      expect(hook.result.current.getValues()).toStrictEqual({})
    })
  })

  describe('with paths', () => {
    it('should clear values of given paths', () => {
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
      act(() => hook.result.current.clear(['a', 'c']))
      expect(hook.result.current.getValue('a')).toBe(null)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(null)
    })
  })

  // todo check that errors are cleared
  // todo check that modified states are cleared
  // todo check that touched states are cleared
}

describe('useForm({ mode: "controlled" }).clear()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clear()', () => {
  tests('experimental_uncontrolled')
})
