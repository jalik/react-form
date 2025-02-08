/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    it('should return true if the form was touched', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: { a: true }
      }))
      expect(hook.result.current.isTouched()).toBe(true)
    })

    it('should return false if the form was not touched', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: { a: false }
      }))
      expect(hook.result.current.isTouched()).toBe(false)
    })
  })

  describe('with path', () => {
    it('should return true if the field was touched', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: { a: true }
      }))
      expect(hook.result.current.isTouched('a')).toBe(true)
    })

    it('should return false if the form was not touched', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched: {
          a: true,
          b: false
        }
      }))
      expect(hook.result.current.isTouched('b')).toBe(false)
    })
  })
}

describe('useForm({ mode: "controlled" }).isTouched()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).isTouched()', () => {
  tests('uncontrolled')
})
