/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../../src/useForm'
import { FormMode } from '../../../src'

function tests (mode: FormMode) {
  const initialValues = {
    a: 1,
    b: 2
  }
  const nextValues = {
    a: 10,
    b: 20
  }

  describe('with afterSubmit = null or undefined', () => {
    it('should not change values or initial values after submit', async () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: async () => ({ success: true }),
        afterSubmit: null
      }))
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      await act(() => hook.result.current.setValues(nextValues))
      await act(() => hook.result.current.submit())
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(nextValues)
    })
  })

  describe('with afterSubmit = "clear"', () => {
    it('should clear values after submit', async () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: async () => ({ success: true }),
        afterSubmit: 'clear'
      }))
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      await act(() => hook.result.current.setValues(nextValues))
      await act(() => hook.result.current.submit())
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual({})
    })
  })

  describe('with afterSubmit = "initialize"', () => {
    it('should replace initial values after submit', async () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: async () => ({ success: true }),
        afterSubmit: 'initialize'
      }))
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      await act(() => hook.result.current.setValues(nextValues))
      await act(() => hook.result.current.submit())
      expect(hook.result.current.getInitialValues()).toStrictEqual(nextValues)
      expect(hook.result.current.getValues()).toStrictEqual(nextValues)
    })
  })

  describe('with afterSubmit = "reset"', () => {
    it('should reset values after submit', async () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        onSubmit: async () => ({ success: true }),
        afterSubmit: 'reset'
      }))
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      await act(() => hook.result.current.setValues(nextValues))
      await act(() => hook.result.current.submit())
      expect(hook.result.current.getInitialValues()).toStrictEqual(initialValues)
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
    })
  })
}

describe('useForm({ mode: "controlled", afterSubmit })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", afterSubmit })', () => {
  tests('uncontrolled')
})
