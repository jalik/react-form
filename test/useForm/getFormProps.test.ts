/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { ComponentProps } from 'react'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  describe('without custom props', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    const props = hook.result.current.getFormProps()

    it('should set onReset attribute', () => {
      expect(typeof props.onReset === 'function').toBe(true)
    })

    it('should set onSubmit attribute', () => {
      expect(typeof props.onSubmit === 'function').toBe(true)
    })
  })

  describe('with custom props', () => {
    const hook = renderHook(() => useForm({
      mode
    }))
    const customProps: ComponentProps<'form'> = { className: 'test' }
    const props = hook.result.current.getFormProps(customProps)

    it('should set onReset attribute', () => {
      expect(typeof props.onReset === 'function').toBe(true)
    })

    it('should set onSubmit attribute', () => {
      expect(typeof props.onSubmit === 'function').toBe(true)
    })

    it('should return passed custom props', () => {
      expect(props.className).toBe(customProps.className)
    })
  })
}

describe('useForm({ mode: "controlled" }).getFormProps()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getFormProps()', () => {
  tests('uncontrolled')
})
