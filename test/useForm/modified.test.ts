/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm, { FormMode } from '../../src/useForm'

function test (mode: FormMode) {
  it('should return true if the form was modified', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialModified: { a: true }
    }))
    expect(hook.result.current.modified).toBe(true)
  })

  it('should return false if the form was not modified', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialModified: { a: false }
    }))
    expect(hook.result.current.modified).toBe(false)
  })
}

describe('useForm({ mode : "controlled" }).modified', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).modified', () => {
  test('experimental_uncontrolled')
})
