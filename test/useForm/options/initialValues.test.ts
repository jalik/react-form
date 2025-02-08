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
    const initialValues = {
      a: 1,
      b: 2,
      c: null
    }

    it('should set initial values', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues
      }))
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
    })
  })

  describe('without values', () => {
    it('should allow to be undefined', () => {
      const hook = renderHook(() => useForm({
        mode
      }))
      expect(hook.result.current.getInitialValues()).toBe(undefined)
    })
  })
}

describe('useForm({ mode: "controlled", initialValues })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", initialValues })', () => {
  tests('uncontrolled')
})
