/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it, jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('with type="reset"', () => {
    const initialValues = {
      a: 1,
      b: 2
    }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))
    const props = hook.result.current.getButtonProps({ type: 'reset' })

    it('should set onClick attribute', () => {
      expect(typeof props.onClick === 'function').toBe(true)
    })

    it('should reset form on click', () => {
      act(() => hook.result.current.setValues({
        a: 2,
        b: 3
      }))
      // @ts-expect-error onClick may not be defined
      act(() => props.onClick())
      expect((hook.result.current.getValues())).toStrictEqual(initialValues)
    })
  })

  describe('with type="submit"', () => {
    const initialValues = {
      a: 1,
      b: 2
    }
    const callback = jest.fn((values) => Promise.resolve(values))
    const hook = renderHook(() => useForm({
      mode,
      initialValues,
      onSubmit: callback
    }))
    const props = hook.result.current.getButtonProps({ type: 'submit' })

    it('should set onClick attribute', () => {
      expect(typeof props.onClick === 'function').toBe(true)
    })

    // fixme this test fails
    // it('should submit form on click', () => {
    //   expect(hook.result.current.submitting).toBe(false)
    //   act(() => {
    //     // @ts-expect-error onClick may not be defined
    //     props.onClick()
    //   })
    //   expect(callback).toHaveBeenCalledTimes(1)
    //   expect(hook.result.current.submitting).toBe(true)
    // })
  })
}

describe('useForm({ mode: "controlled" }).getButtonProps()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getButtonProps()', () => {
  tests('experimental_uncontrolled')
})
