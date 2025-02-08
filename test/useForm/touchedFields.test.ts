/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function test (mode: FormMode) {
  it('should return touched fields if the form was touched', () => {
    const initialTouched = { a: true }
    const hook = renderHook(() => useForm({
      mode,
      initialTouched
    }))
    expect(hook.result.current.touchedFields).toStrictEqual(initialTouched)
  })

  it('should return empty object if the form was not touched', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.touchedFields).toStrictEqual({})
  })
}

describe('useForm({ mode : "controlled" }).touchedFields', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).touchedFields', () => {
  test('uncontrolled')
})
