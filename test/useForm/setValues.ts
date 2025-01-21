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
        onSubmit: () => Promise.resolve()
      }))
      expect(hook.result.current.getValue('a')).toBe(undefined)
      expect(hook.result.current.getValue('b')).toBe(undefined)

      act(() => hook.result.current.setValues({
        a: 1,
        b: 2
      }, { partial: false }))

      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(2)
    })
  })

  describe('with partial = true', () => {
    it('should set values of given paths only', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {
          a: 0,
          b: 0
        },
        onSubmit: () => Promise.resolve()
      }))
      expect(hook.result.current.getValue('a')).toBe(0)
      expect(hook.result.current.getValue('b')).toBe(0)

      act(() => hook.result.current.setValues({ a: 1 }, { partial: true }))

      expect(hook.result.current.getValue('a')).toBe(1)
      expect(hook.result.current.getValue('b')).toBe(0)
    })
  })
}

describe('useForm({ mode: "controlled" }).setValues()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setValues()', () => {
  tests('experimental_uncontrolled')
})
