/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

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
    it('should clear values of given paths only', () => {
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

  it('should not modify initial values', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: {
        a: 1,
        b: 2
      }
    }))
    expect(hook.result.current.getInitialValue('a')).toBe(1)
    expect(hook.result.current.getInitialValue('b')).toBe(2)
    act(() => hook.result.current.clear())
    expect(hook.result.current.getInitialValue('a')).toBe(1)
    expect(hook.result.current.getInitialValue('b')).toBe(2)
  })
}

describe('useForm({ mode: "controlled" }).clearValues()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clearValues()', () => {
  tests('experimental_uncontrolled')
})
