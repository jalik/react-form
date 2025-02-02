/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src'

function test (mode: FormMode) {
  describe('without arguments', () => {
    it('should clear all errors', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialErrors: {
          a: 'invalid',
          b: 'invalid'
        }
      }))
      expect(hook.result.current.getError('a')).toBe('invalid')
      expect(hook.result.current.getError('b')).toBe('invalid')
      act(() => hook.result.current.clearErrors())
      expect(hook.result.current.errors).toStrictEqual({})
    })
  })

  describe('with paths', () => {
    it('should clear given errors', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialErrors: {
          a: 'invalid',
          b: 'invalid',
          c: 'invalid'
        }
      }))
      expect(hook.result.current.getError('a')).toBe('invalid')
      expect(hook.result.current.getError('b')).toBe('invalid')
      expect(hook.result.current.getError('c')).toBe('invalid')
      act(() => hook.result.current.clearErrors(['a', 'c']))
      expect(hook.result.current.getError('a')).toBe(undefined)
      expect(hook.result.current.getError('b')).toBe('invalid')
      expect(hook.result.current.getError('c')).toBe(undefined)
    })
  })
}

describe('useForm({ mode : "controlled" }).clearErrors()', () => {
  test('controlled')
})

describe('useForm({ mode : "uncontrolled" }).clearErrors()', () => {
  test('experimental_uncontrolled')
})
