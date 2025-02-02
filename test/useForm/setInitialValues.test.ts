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
    const initialValues = {
      a: 100,
      b: 200
    }

    it('should set initial values', () => {
      const hook = renderHook(() => useForm({
        mode
      }))
      expect(hook.result.current.getInitialValues()).toBe(undefined)
      expect(hook.result.current.getValues()).toStrictEqual({})
      expect(hook.result.current.initialized).toBe(false)
      act(() => hook.result.current.setInitialValues(initialValues))
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      expect(hook.result.current.initialized).toBe(true)
    })

    it('should replace modified values', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues
      }))
      const values = {
        a: 3,
        b: 4
      }
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      act(() => hook.result.current.setInitialValues(values))
      expect(hook.result.current.getInitialValues()).toStrictEqual(values)
      expect(hook.result.current.getValues()).toStrictEqual(values)
      expect(hook.result.current.initialized).toBe(true)
    })

    it('should clear all errors', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialErrors: {
          a: 'invalid',
          b: 'invalid'
        },
        initialValues: {
          a: 1,
          b: 2
        }
      }))
      expect(hook.result.current.getError('a')).toBeTruthy()
      expect(hook.result.current.getError('b')).toBeTruthy()
      act(() => hook.result.current.setInitialValues(initialValues))
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
      act(() => hook.result.current.setInitialValues(initialValues))
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
      act(() => hook.result.current.setInitialValues(initialValues))
      expect(hook.result.current.getTouched()).toStrictEqual({})
    })
  })
}

describe('useForm({ mode : "controlled" }).setInitialValues()', () => {
  tests('controlled')
})

describe('useForm({ mode : "uncontrolled" }).setInitialValues()', () => {
  tests('experimental_uncontrolled')
})
