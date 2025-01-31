/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src/useFormState'

function tests (mode: FormMode) {
  const initialErrors = {
    a: 'invalid',
    b: 'required'
  }

  it('should return all errors', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialErrors
    }))
    expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
  })
}

describe('useForm({ mode: "controlled" }).getErrors()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getErrors()', () => {
  tests('experimental_uncontrolled')
})
