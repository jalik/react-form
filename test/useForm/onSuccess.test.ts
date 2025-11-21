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
    it('should call onSuccess function', async () => {
      const onSuccess = vi.fn()
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: () => Promise.resolve({ success: true }),
        onSuccess
      }))
      await act(() => hook.result.current.submit())
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should call onSuccess function with result and values', async () => {
      let callbackArgs: unknown[] = []
      const onSuccess = vi.fn((...args) => {
        callbackArgs = args
      })
      const result = { success: true }
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: () => Promise.resolve(result),
        onSuccess
      }))
      await act(() => hook.result.current.submit())
      expect(callbackArgs.length).toBe(2)
      expect(callbackArgs[0]).toStrictEqual(result)
      expect(callbackArgs[1]).toStrictEqual(hook.result.current.getValues())
    })
  })

  describe('when submit failed', () => {
    it('should not call onSuccess function', async () => {
      const onSuccess = vi.fn()
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: () => Promise.reject(new Error('failed')),
        onSuccess
      }))
      await act(() => hook.result.current.submit())
      expect(onSuccess).toHaveBeenCalledTimes(0)
    })
  })
}

describe('useForm({ mode: "controlled", onError: function }).submit()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", onError: function }).submit()', () => {
  tests('uncontrolled')
})
