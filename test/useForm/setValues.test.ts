/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  describe('with partial = false', () => {
    it('should set all values', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 0,
          c: 0
        }
      }))
      const values = {
        a: 1,
        b: 2
      }
      expect(hook.result.current.getValue('a')).toBe(0)
      expect(hook.result.current.getValue('b')).toBe(undefined)
      expect(hook.result.current.getValue('c')).toBe(0)
      act(() => hook.result.current.setValues(values, { partial: false }))
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(undefined)
    })
  })

  describe('with partial = true', () => {
    it('should set values of given paths only', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 0,
          b: 0,
          c: 0
        }
      }))
      const values = {
        a: 1,
        b: 2
      }
      expect(hook.result.current.getValue('a')).toBe(0)
      expect(hook.result.current.getValue('b')).toBe(0)
      expect(hook.result.current.getValue('c')).toBe(0)
      act(() => hook.result.current.setValues(values, { partial: true }))
      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
      expect(hook.result.current.getValue('c')).toBe(0)
    })
  })

  it('should not set field as touched when value changes', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: 'test' }
    }))
    expect(hook.result.current.isTouched('a')).toBe(false)
    expect(hook.result.current.isTouched()).toBe(false)
    act(() => hook.result.current.setValue('a', 'modified'))
    expect(hook.result.current.isTouched('a')).toBe(false)
    expect(hook.result.current.isTouched()).toBe(false)
  })
}

describe('useForm({ mode: "controlled" }).setValues()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValues()', () => {
  tests('experimental_uncontrolled')
})
