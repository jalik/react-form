/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    it('should return true if the form was modified', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: { a: true }
      }))
      expect(hook.result.current.isModified()).toBe(true)
    })

    it('should return false if the form was not modified', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: { a: false }
      }))
      expect(hook.result.current.isModified()).toBe(false)
    })
  })

  describe('with path', () => {
    it('should return true if the field was modified', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: { a: true }
      }))
      expect(hook.result.current.isModified('a')).toBe(true)
    })

    it('should return false if the form was not modified', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified: {
          a: true,
          b: false
        }
      }))
      expect(hook.result.current.isModified('b')).toBe(false)
    })
  })
}

describe('useForm({ mode: "controlled" }).isModified()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).isModified()', () => {
  tests('experimental_uncontrolled')
})
