/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import useForm from '../../src/useForm'
import { describe, expect, it } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { FormMode } from '../../src'

async function load (): Promise<any> {
  throw new Error('Unknown error')
}

function tests (mode: FormMode) {
  it('should contain the error thrown during loading', async () => {
    const hook = renderHook(() => useForm({
      mode,
      load
    }))
    expect(hook.result.current.loadError).toBeUndefined()
    // await act(() => hook.result.current.load())
    await waitFor(() => {
      expect(hook.result.current.loadError).toBeDefined()
    })
  })
}

describe('useForm({ mode: "controlled" }).loadError', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).loadError', () => {
  tests('uncontrolled')
})
