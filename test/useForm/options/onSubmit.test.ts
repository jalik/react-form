/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it, vi } from 'vitest'
import useForm from '../../../src/useForm'
import { act, renderHook } from '@testing-library/react'

describe('useForm({ onSubmit })', () => {
  describe('with undefined', () => {
    it('should not throw', () => {
      expect(() => {
        renderHook(() => useForm({}))
      }).not.toThrow()
    })
  })

  describe('with a function', () => {
    it('should call the function when submit() is called', async () => {
      const callback = vi.fn(() => Promise.resolve())
      const hook = renderHook(() => useForm({
        onSubmit: callback
      }))
      expect(callback).toHaveBeenCalledTimes(0)
      await act(() => hook.result.current.submit())
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
