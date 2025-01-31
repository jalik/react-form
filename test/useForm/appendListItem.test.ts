/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  it('should append items to a list', () => {
    const hook = renderHook(() => useForm({
      mode,
      initialValues: { a: [1] }
    }))
    expect(hook.result.current.getValue('a')).toStrictEqual([1])
    act(() => hook.result.current.appendListItem('a', 2, 3))
    expect(hook.result.current.getValue('a')).toStrictEqual([1, 2, 3])
  })
}

describe('useForm({ mode: "controlled" }).appendListItem()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).appendListItem()', () => {
  tests('experimental_uncontrolled')
})
