/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

const ERR_INVALID = 'invalid'
const ERR_UNEXPECTED = 'unexpected'

function tests (mode: FormMode) {
  const initialErrors = {
    a: ERR_INVALID,
    b: ERR_INVALID,
    c: ERR_INVALID
  }

  describe('without arguments', () => {
    it('should reset errors to their initial state', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialErrors
      }))
      expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
      act(() => hook.result.current.setError('a', ERR_UNEXPECTED))
      expect(hook.result.current.getError('a')).toBe(ERR_UNEXPECTED)
      act(() => hook.result.current.resetErrors())
      expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
    })
  })

  describe('with paths', () => {
    it('should reset errors of given fields', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialErrors
      }))
      expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
      act(() => hook.result.current.setError('a', ERR_UNEXPECTED))
      act(() => hook.result.current.setError('b', ERR_UNEXPECTED))
      act(() => hook.result.current.setError('c', ERR_UNEXPECTED))
      expect(hook.result.current.getError('a')).toBe(ERR_UNEXPECTED)
      expect(hook.result.current.getError('b')).toBe(ERR_UNEXPECTED)
      expect(hook.result.current.getError('c')).toBe(ERR_UNEXPECTED)
      act(() => hook.result.current.resetErrors(['a', 'c']))
      expect(hook.result.current.getError('a')).toBe(initialErrors.a)
      expect(hook.result.current.getError('b')).toBe(ERR_UNEXPECTED)
      expect(hook.result.current.getError('c')).toBe(initialErrors.c)
    })
  })
}

describe('useForm({ mode: "controlled" }).resetErrors()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).resetErrors()', () => {
  tests('uncontrolled')
})
