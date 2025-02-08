/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import { FormMode } from '../../../src/useFormState'

function test (mode: FormMode) {
  describe('with values', () => {
    const initialErrors = {
      a: 'invalid',
      b: 'invalid'
    }

    it('should set initial errors', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialErrors
      }))
      expect(hook.result.current.errors).toStrictEqual(initialErrors)
    })

    it('should filters errors to remove null and undefined values', () => {
      const hook = renderHook(() =>
        useForm({
          mode,
          initialErrors: {
            ...initialErrors,
            c: undefined,
            d: null
          }
        })
      )
      expect(hook.result.current.errors).toStrictEqual(initialErrors)
    })
  })

  describe('without values', () => {
    it('should set errors to empty object', () => {
      const hook = renderHook(() => useForm({
        mode
      }))
      expect(hook.result.current.errors).toStrictEqual({})
    })
  })
}

describe('useForm({ mode : "controlled", initialErrors })', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled", initialErrors })', () => {
  test('uncontrolled')
})
