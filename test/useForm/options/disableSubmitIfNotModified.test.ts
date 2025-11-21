/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import useForm from '../../../src/useForm'
import { FormMode } from '../../../src'

function tests (mode: FormMode) {
  const initialValues = { a: 1 }

  describe('with disableSubmitIfNotModified = true', () => {
    describe('with form not modified', () => {
      it('should disable submit button', () => {
        const hook = renderHook(() => useForm({
          mode,
          initialValues,
          disableSubmitIfNotModified: true,
          forceUpdateOnStatusChange: true
        }))
        expect(hook.result.current.isModified()).toBe(false)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(true)
      })
    })

    describe('with form modified', () => {
      it('should not disable submit button', () => {
        const hook = renderHook(() => useForm({
          mode,
          initialValues,
          initialModified: { a: true },
          disableSubmitIfNotModified: true
        }))
        expect(hook.result.current.isModified()).toBe(true)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(false)
      })
    })
  })

  describe('with disableSubmitIfNotModified = false', () => {
    describe('with form not modified', () => {
      it('should disable submit button', () => {
        const hook = renderHook(() => useForm({
          mode,
          initialValues,
          disableSubmitIfNotModified: false
        }))
        expect(hook.result.current.isModified()).toBe(false)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(false)
      })
    })

    describe('with form modified', () => {
      it('should not disable submit button', () => {
        const hook = renderHook(() => useForm({
          mode,
          initialValues,
          initialModified: { a: true },
          disableSubmitIfNotModified: false
        }))
        expect(hook.result.current.isModified()).toBe(true)
        expect(hook.result.current.getButtonProps({ type: 'submit' }).disabled).toBe(false)
      })
    })
  })
}

describe('useForm({ mode: "controlled", disableSubmitIfNotModified })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", disableSubmitIfNotModified })', () => {
  tests('uncontrolled')
})
