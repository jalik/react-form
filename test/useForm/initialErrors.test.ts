/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm, { FormMode } from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

function test (mode: FormMode) {
  it('should set initial errors using initialErrors', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialErrors: {
        a: 'invalid'
      },
      onSubmit () {
        return Promise.resolve(true)
      }
    }))
    expect(hook.result.current.errors).toStrictEqual({
      a: 'invalid'
    })
  })

  it('should set error to empty object if initialErrors is not provided', () => {
    const hook = renderHook(() => useForm({
      mode,
      onSubmit () {
        return Promise.resolve(true)
      }
    }))
    expect(hook.result.current.errors).toStrictEqual({})
  })

  it('should filters initialErrors to remove  null and undefined values', () => {
    const hook = renderHook(() =>
      useForm({
        mode,
        initialErrors: {
          a: 'invalid',
          b: 'invalid',
          c: undefined,
          d: null
        },
        onSubmit () {
          return Promise.resolve(true)
        }
      })
    )
    expect(hook.result.current.errors).toStrictEqual({
      a: 'invalid',
      b: 'invalid'
    })
  })
}

describe('useForm({ mode : "controlled", initialErrors })', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled", initialErrors })', () => {
  test('experimental_uncontrolled')
})
