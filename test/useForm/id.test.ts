/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function test (mode: FormMode) {
  it('should return a generated ID', () => {
    const initialValues = { a: 1 }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))
    expect(hook.result.current.id).toBeDefined()
  })
}

describe('useForm({ mode : "controlled" }).identifier', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).identifier', () => {
  test('uncontrolled')
})
