/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../../src/useForm'
import { FormMode } from '../../../src/useFormState'

function tests (mode: FormMode) {
  describe('with values', () => {
    const initialTouched = {
      a: true,
      b: false
    }

    it('should set initial touched fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
    })

    it('should set mark form as touched', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.isTouched()).toBe(true)
    })
  })
}

describe('useForm({ mode: "controlled", initialTouched })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", initialTouched })', () => {
  tests('experimental_uncontrolled')
})
