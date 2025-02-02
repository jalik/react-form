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
  const checkedAttribute = mode === 'controlled' ? 'checked' : 'defaultChecked'
  const valueAttribute = mode === 'controlled' ? 'value' : 'defaultValue'

  describe('with input type="number"', () => {
    const initialValues = { a: 1 }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))

    describe('with custom props', () => {
      const customProps: ComponentProps<'input'> = { type: 'number' }
      const props = hook.result.current.getFieldProps('a', customProps)

      it('should set onBlur attribute', () => {
        expect(typeof props.onBlur === 'function').toBe(true)
      })

      it('should set onChange attribute', () => {
        expect(typeof props.onChange === 'function').toBe(true)
      })

      it('should pass given custom props', () => {
        expect(props.type).toBe(customProps.type)
      })

      it(`should set "${valueAttribute}" attribute as string`, () => {
        expect(props[valueAttribute]).toBe(String(initialValues.a))
      })
    })

    describe('with options.format = null', () => {
      const props = hook.result.current.getFieldProps('a', null, { format: null })

      it(`should not set "${valueAttribute}" attribute as string`, () => {
        expect(props[valueAttribute]).toBe(initialValues.a)
      })
    })

    describe('with options.format = function', () => {
      const format = (value: unknown) => ('_' + value)
      const props = hook.result.current.getFieldProps('a', null, { format })

      it(`should set "${valueAttribute}" attribute using format function`, () => {
        expect(props[valueAttribute]).toBe(format(initialValues.a))
      })
    })

    // todo test options.mode
    // todo test options.parser
  })

  describe('with input type="checkbox"', () => {
    const initialValues = { a: 1 }
    const hook = renderHook(() => useForm({
      mode,
      initialValues
    }))

    describe('with same value as initial value', () => {
      const customProps: ComponentProps<'input'> = {
        type: 'checkbox',
        value: initialValues.a
      }
      const props = hook.result.current.getFieldProps('a', customProps)

      it(`should set "${checkedAttribute}" attribute`, () => {
        expect(props[checkedAttribute]).toBe(true)
      })
    })

    describe('with different value as initial value', () => {
      const customProps: ComponentProps<'input'> = {
        type: 'checkbox',
        value: 0
      }
      const props = hook.result.current.getFieldProps('a', customProps)

      it(`should set "${checkedAttribute}" attribute`, () => {
        expect(props[checkedAttribute]).toBe(false)
      })
    })
  })
}

describe('useForm({ mode: "controlled" }).getFieldProps()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getFieldProps()', () => {
  tests('experimental_uncontrolled')
})
