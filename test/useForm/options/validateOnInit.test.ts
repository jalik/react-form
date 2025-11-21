/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useForm from '../../../src/useForm'
import { FormMode } from '../../../src'

const TYPE_ERROR = 'invalid type'

async function validate (values: Record<string, unknown>) {
  const errors: Record<string, string> = {}

  if (values.text != null && typeof values.text !== 'string') {
    errors.text = TYPE_ERROR
  }
  if (values.number != null && typeof values.number !== 'number') {
    errors.number = TYPE_ERROR
  }
  return errors
}

function tests (mode: FormMode) {
  const initialValues = {
    number: '123',
    text: 123
  }

  describe('with validateOnInit = true', () => {
    it('should validate when initialized', async () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        validate,
        validateOnInit: true
      }))

      await waitFor(() => {
        expect(hook.result.current.getError('number')).toBeDefined()
        expect(hook.result.current.getError('text')).toBeDefined()
      })
    })
  })

  describe('with validateOnInit = false', () => {
    it('should not validate when initialized', async () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues,
        validate,
        validateOnInit: false
      }))

      await waitFor(() => {
        expect(hook.result.current.getError('number')).toBeUndefined()
        expect(hook.result.current.getError('text')).toBeUndefined()
      })
    })
  })
}

describe('useForm({ mode: "controlled", validateOnInit })', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled", validateOnInit })', () => {
  tests('uncontrolled')
})
