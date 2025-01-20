/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm, { FormMode } from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'

function test (mode: FormMode) {
  describe('with partial = false', () => {
    it('should replace all errors', () => {
      const hook = renderHook(() => useForm<any, string>({
        mode,
        onSubmit () {
          return Promise.resolve(true)
        }
      }))
      act(() => hook.result.current.setErrors({
        a: 'required',
        b: 'required'
      }, { partial: false }))
      expect(hook.result.current.errors).toStrictEqual({
        a: 'required',
        b: 'required'
      })
    })
  })

  describe('with partial = true', () => {
    it('should replace given errors only', () => {
      const hook = renderHook(() => useForm<any, string>({
        mode,
        initialErrors: {
          a: 'invalid'
        },
        onSubmit () {
          return Promise.resolve(true)
        }
      }))
      act(() => hook.result.current.setErrors({
        b: 'required',
        c: 'required'
      }, { partial: true }))
      expect(hook.result.current.errors).toStrictEqual({
        a: 'invalid',
        b: 'required',
        c: 'required'
      })
    })

    it('should delete errors with null or undefined value', () => {
      const hook = renderHook(() => useForm<any, string>({
        mode,
        initialErrors: {
          a: 'invalid',
          b: 'invalid',
          c: 'invalid'
        },
        onSubmit () {
          return Promise.resolve(true)
        }
      }))
      act(() => hook.result.current.setErrors({
        b: null,
        c: undefined
      }, { partial: true }))
      expect(hook.result.current.errors).toStrictEqual({
        a: 'invalid'
      })
    })
  })
}

describe('useForm({ mode : "controlled" }).setErrors()', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).setErrors()', () => {
  test('experimental_uncontrolled')
})
