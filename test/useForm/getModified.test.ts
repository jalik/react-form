/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src/useFormState'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    const initialModified = {
      a: true,
      b: false
    }

    it('should return modified fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.getModified()).toStrictEqual(initialModified)
    })
  })
}

describe('useForm({ mode: "controlled" }).getModified()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getModified()', () => {
  tests('experimental_uncontrolled')
})
