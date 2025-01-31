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
    const initialModified = {
      a: true,
      b: false
    }

    it('should set initial modified fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.getModified()).toStrictEqual(initialModified)
    })

    it('should set mark form as modified', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.isModified()).toBe(true)
    })
  })
}

describe('useForm({ mode: "controlled", initialModified })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", initialModified })', () => {
  tests('experimental_uncontrolled')
})
