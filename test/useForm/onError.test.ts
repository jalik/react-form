/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  const initialValues = {
    a: 1,
    b: 2
  }
  describe('when submit is successful', () => {
    it('should not call onError function', async () => {
      const onError = vi.fn()
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: () => Promise.resolve({ success: true }),
        onError
      }))
      await act(() => hook.result.current.submit())
      expect(onError).toHaveBeenCalledTimes(0)
    })
  })

  describe('when submit failed', () => {
    it('should call onError function', async () => {
      const onError = vi.fn()
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: () => Promise.reject(new Error('failed')),
        onError
      }))
      await act(() => hook.result.current.submit())
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('should call onError function with error', async () => {
      let callbackArgs: unknown[] = []
      const onError = vi.fn((...args) => {
        callbackArgs = args
      })
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: () => Promise.reject(new Error('failed')),
        onError
      }))
      await act(() => hook.result.current.submit())
      expect(callbackArgs.length).toBe(1)
      expect(callbackArgs[0]).toBeInstanceOf(Error)
    })
  })
}

describe('useForm({ mode: "controlled", onSuccess: function }).submit()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", onSuccess: function }).submit()', () => {
  tests('uncontrolled')
})
