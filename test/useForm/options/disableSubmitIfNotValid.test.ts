/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { UseFormOptions } from '../../../src/useForm'
import { FormMode } from '../../../src'

function tests (mode: FormMode) {
  const initialValues = { a: 1 }
  const formOptions: UseFormOptions<typeof initialValues, string, undefined> = {
    mode,
    initialValues,
    disableSubmitIfNotModified: false
  }

  describe('with disableSubmitIfNotValid = true', () => {
    describe('with invalid form', () => {
      it('should disable submit button', () => {
        const hook = renderHook(() => useForm({
          ...formOptions,
          disableSubmitIfNotValid: true,
          initialErrors: { a: 'invalid' }
        }))
        expect(hook.result.current.hasError).toBe(true)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(true)
      })
    })

    describe('with valid form', () => {
      it('should not disable submit button', () => {
        const hook = renderHook(() => useForm({
          ...formOptions,
          disableSubmitIfNotValid: true
        }))
        expect(hook.result.current.hasError).toBe(false)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(false)
      })
    })
  })

  describe('with disableSubmitIfNotValid = false', () => {
    describe('with invalid form', () => {
      it('should disable submit button', () => {
        const hook = renderHook(() => useForm({
          ...formOptions,
          disableSubmitIfNotValid: false,
          initialErrors: { a: 'invalid' }
        }))
        expect(hook.result.current.hasError).toBe(true)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(false)
      })
    })

    describe('with valid form', () => {
      it('should not disable submit button', () => {
        const hook = renderHook(() => useForm({
          ...formOptions,
          disableSubmitIfNotValid: false
        }))
        expect(hook.result.current.hasError).toBe(false)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(false)
      })
    })
  })
}

describe('useForm({ mode: "controlled", disableSubmitIfNotValid })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", disableSubmitIfNotValid })', () => {
  tests('experimental_uncontrolled')
})
