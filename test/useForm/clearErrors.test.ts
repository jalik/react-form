/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm, { FormMode } from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'

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
          b: 'invalid'
        }
      }))
      act(() => hook.result.current.clearErrors())
      expect(hook.result.current.errors).toStrictEqual({})
    })
  })
}

describe('useForm({ mode : "controlled" }).clearErrors()', () => {
  test('controlled')
})

describe('useForm({ mode : "uncontrolled" }).clearErrors()', () => {
  test('experimental_uncontrolled')
})
