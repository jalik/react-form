/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    const initialTouched = {
      a: true,
      b: false
    }

    it('should return touched fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
    })
  })
}

describe('useForm({ mode: "controlled" }).getTouched()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getTouched()', () => {
  tests('experimental_uncontrolled')
})
