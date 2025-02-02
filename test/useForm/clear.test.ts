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
      act(() => hook.result.current.clear())
      expect(hook.result.current.getErrors()).toStrictEqual({})
    })

    it('should clear all modified states', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: {
          a: true,
          b: true
        }
      }))
      expect(hook.result.current.isModified('a')).toBe(true)
      expect(hook.result.current.isModified('b')).toBe(true)
      act(() => hook.result.current.clear())
      expect(hook.result.current.getModified()).toStrictEqual({})
    })

    it('should clear all touched states', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: {
          a: true,
          b: true
        }
      }))
      expect(hook.result.current.isTouched('a')).toBe(true)
      expect(hook.result.current.isTouched('b')).toBe(true)
      act(() => hook.result.current.clear())
      expect(hook.result.current.getTouched()).toStrictEqual({})
    })

    it('should not clear initial values', () => {
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
      expect(hook.result.current.getValue('a')).toBe(undefined)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(undefined)
    })

    it('should clear errors of given paths', () => {
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
      act(() => hook.result.current.clear(['a', 'c']))
      expect(hook.result.current.getErrors()).toStrictEqual({ b: 'invalid' })
    })

    it('should clear modified states of given paths', () => {
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
      expect(hook.result.current.isModified('c')).toBe(true)
      act(() => hook.result.current.clear(['a', 'c']))
      expect(hook.result.current.isModified('a')).toBe(false)
      expect(hook.result.current.isModified('b')).toBe(true)
      expect(hook.result.current.isModified('c')).toBe(false)
    })

    it('should clear touched states of given paths', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: {
          a: true,
          b: true,
          c: true
        }
      }))
      expect(hook.result.current.isTouched('a')).toBe(true)
      expect(hook.result.current.isTouched('b')).toBe(true)
      expect(hook.result.current.isTouched('c')).toBe(true)
      act(() => hook.result.current.clear(['a', 'c']))
      expect(hook.result.current.isTouched('a')).toBe(false)
      expect(hook.result.current.isTouched('b')).toBe(true)
      expect(hook.result.current.isTouched('c')).toBe(false)
    })

    it('should not clear initial values of given paths', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 1,
          b: 2
        }
      }))
      expect(hook.result.current.getInitialValue('a')).toBe(1)
      expect(hook.result.current.getInitialValue('b')).toBe(2)
      act(() => hook.result.current.clear(['a', 'b']))
      expect(hook.result.current.getInitialValue('a')).toBe(1)
      expect(hook.result.current.getInitialValue('b')).toBe(2)
    })
  })
}

describe('useForm({ mode: "controlled" }).clear()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).clear()', () => {
  tests('experimental_uncontrolled')
})
