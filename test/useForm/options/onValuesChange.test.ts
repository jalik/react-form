/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it, jest } from '@jest/globals'
import useForm from '../../../src/useForm'
import { act, renderHook } from '@testing-library/react'

describe('useForm({ onValuesChange })', () => {
  describe('with undefined', () => {
    it('should not throw', () => {
      expect(() => {
        renderHook(() => useForm({}))
      }).not.toThrow()
    })
  })

  describe('with a function', () => {
    it('should call the function on values change', () => {
      const callback = jest.fn()
      const hook = renderHook(() => useForm({
        onValuesChange: callback
      }))
      expect(callback).toHaveBeenCalledTimes(0)
      act(() => hook.result.current.setValue('test', true))
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
