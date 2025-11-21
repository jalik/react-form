/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function test (mode: FormMode) {
  it('should return modified fields if the form was modified', () => {
    const initialModified = { a: true }
    const hook = renderHook(() => useForm({
      mode,
      initialModified
    }))
    expect(hook.result.current.modifiedFields).toStrictEqual(initialModified)
  })

  it('should return empty object if the form was not modified', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    expect(hook.result.current.modifiedFields).toStrictEqual({})
  })
}

describe('useForm({ mode : "controlled" }).modifiedFields', () => {
  test('controlled')
})

describe('useForm({ mode: "uncontrolled" }).modifiedFields', () => {
  test('uncontrolled')
})
