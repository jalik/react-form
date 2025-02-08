/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { ComponentProps } from 'react'
import { FormMode } from '../../src'

function tests (mode: FormMode) {
  const checkedAttribute = mode === 'controlled' ? 'checked' : 'defaultChecked'
  const valueAttribute = mode === 'controlled' ? 'value' : 'defaultValue'
  const invertedValueAttribute = mode === 'controlled' ? 'defaultValue' : 'value'

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

      it(`should not modify "${valueAttribute}"`, () => {
        expect(props[valueAttribute]).toBe(initialValues.a)
      })
    })

    describe('with options.format = function', () => {
      const format = (value: unknown) => ('_' + value)
      const props = hook.result.current.getFieldProps('a', null, { format })

      it(`should set "${valueAttribute}" with formatted value`, () => {
        expect(props[valueAttribute]).toBe(format(initialValues.a))
      })
    })

    describe('with options.parser = function', () => {
      const parser = Number

      it('should use parser function to transform value when onChange() is called', () => {
        const initialValues = { a: 1 }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', null, { parser })
        act(() => props.onChange('1337'))
        expect(hook.result.current.getValue('a')).toBe(parser('1337'))
      })

      describe('with input type="checkbox"', () => {
        it(`should set ${checkedAttribute}="true" when parsed input value = form value`, () => {
          const props = hook.result.current.getFieldProps('a', {
            type: 'checkbox',
            [valueAttribute]: String(initialValues.a)
          }, { parser })
          expect(props[checkedAttribute]).toBe(true)
        })

        it(`should set ${checkedAttribute}="false" when parsed input value != form value`, () => {
          const props = hook.result.current.getFieldProps('a', {
            type: 'checkbox',
            [valueAttribute]: String(Math.random())
          }, { parser })
          expect(props[checkedAttribute]).toBe(false)
        })
      })

      describe('with input type="radio"', () => {
        it(`should set ${checkedAttribute}="true" when parsed input value = form value`, () => {
          const props = hook.result.current.getFieldProps('a', {
            type: 'radio',
            [valueAttribute]: String(initialValues.a)
          }, { parser })
          expect(props[checkedAttribute]).toBe(true)
        })

        it(`should set ${checkedAttribute}="false" when parsed input value != form value`, () => {
          const props = hook.result.current.getFieldProps('a', {
            type: 'radio',
            [valueAttribute]: String(Math.random())
          }, { parser })
          expect(props[checkedAttribute]).toBe(false)
        })
      })
    })

    // todo test options.mode
  })

  describe('with input type="checkbox"', () => {
    describe('without input value', () => {
      describe('with form value = true', () => {
        const initialValues = { a: true }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', { type: 'checkbox' })
        it(`should set "${checkedAttribute}"="true"`, () => {
          expect(props[checkedAttribute]).toBe(true)
        })
      })

      describe('with form value = false', () => {
        const initialValues = { a: false }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', { type: 'checkbox' })
        it(`should set "${checkedAttribute}"="false"`, () => {
          expect(props[checkedAttribute]).toBe(false)
        })
      })

      describe('with form value = null or undefined', () => {
        const initialValues = {
          a: null,
          b: undefined
        }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const aProps = hook.result.current.getFieldProps('a', { type: 'checkbox' })
        const bProps = hook.result.current.getFieldProps('b', { type: 'checkbox' })

        it(`should set "${checkedAttribute}"="false"`, () => {
          expect(aProps[checkedAttribute]).toBe(false)
          expect(bProps[checkedAttribute]).toBe(false)
        })
      })
    })

    describe('with input value', () => {
      describe('with form value matching input value', () => {
        const initialValues = { a: '1' }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', {
          type: 'checkbox',
          [valueAttribute]: '1'
        })

        it(`should set "${checkedAttribute}" = true`, () => {
          expect(props[checkedAttribute]).toBe(true)
        })
      })

      describe('with form value not matching input value', () => {
        const initialValues = { a: '2' }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', {
          type: 'checkbox',
          [valueAttribute]: '1'
        })
        it(`should set "${checkedAttribute}" = false`, () => {
          expect(props[checkedAttribute]).toBe(false)
        })
      })
    })
  })

  describe('with input type="radio"', () => {
    it(`should not set ${valueAttribute} with form value`, () => {
      const initialValues = { a: 1 }
      const hook = renderHook(() => useForm({
        mode,
        initialValues
      }))
      const props = hook.result.current.getFieldProps('a', {
        type: 'radio',
        [valueAttribute]: '2'
      })
      expect(props[valueAttribute]).toBe('2')
    })

    describe('without input value', () => {
      describe('with form value = undefined', () => {
        const initialValues = { a: null }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', { type: 'radio' })
        it(`should set "${checkedAttribute}" = false`, () => {
          expect(props[checkedAttribute]).toBe(false)
        })
      })
    })

    describe('with input value', () => {
      describe('with form value matching input value', () => {
        const initialValues = { a: '1' }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', {
          type: 'radio',
          [valueAttribute]: '1'
        })
        it(`should set "${checkedAttribute}" = true`, () => {
          expect(props[checkedAttribute]).toBe(true)
        })
      })

      describe('with form value not matching input value', () => {
        const initialValues = { a: '2' }
        const hook = renderHook(() => useForm({
          mode,
          initialValues
        }))
        const props = hook.result.current.getFieldProps('a', {
          type: 'radio',
          [valueAttribute]: '1'
        })
        it(`should set "${checkedAttribute}" = false`, () => {
          expect(props[checkedAttribute]).toBe(false)
        })
      })
    })
  })

  describe('with form disabled = true', () => {
    it('should be disabled', () => {
      const hook = renderHook(() => useForm({
        mode,
        disabled: true
      }))
      const props = hook.result.current.getFieldProps('test')
      expect(props.disabled).toBe(true)
    })
  })

  describe('with form disabled = false', () => {
    it('should not be disabled', () => {
      const hook = renderHook(() => useForm({
        mode,
        initialValues: {},
        disabled: false
      }))
      const props = hook.result.current.getFieldProps('test')
      expect(props.disabled).toBeFalsy()
    })
  })

  describe(`with "${valueAttribute}" defined`, () => {
    describe('with type != "checkbox" and "radio"', () => {
      it(`should use form value and ignore "${valueAttribute}"`, () => {
        const hook = renderHook(() => useForm({
          initialValues: { a: '1' },
          mode
        }))
        const customProps = { [valueAttribute]: '2' }
        const props = hook.result.current.getFieldProps('a', customProps)
        expect(props[valueAttribute]).toBe(hook.result.current.getValue('a'))
      })
    })
  })

  describe('with both "value" and "defaultValue" defined', () => {
    const hook = renderHook(() => useForm({
      initialValues: { a: '1' },
      mode
    }))
    const customProps = {
      defaultValue: '2',
      value: '1'
    }

    it(`should not set "${invertedValueAttribute}"`, () => {
      const props = hook.result.current.getFieldProps('a', customProps)
      expect(props[invertedValueAttribute]).toBeUndefined()
    })

    describe('with type="checkbox"', () => {
      it(`should set "${valueAttribute}" using "${valueAttribute}"`, () => {
        const props = hook.result.current.getFieldProps('a', {
          ...customProps,
          type: 'checkbox'
        })
        expect(props[valueAttribute]).toBe(customProps[valueAttribute])
      })
    })

    describe('with type="radio"', () => {
      it(`should set "${valueAttribute}" using "${valueAttribute}"`, () => {
        const props = hook.result.current.getFieldProps('a', {
          ...customProps,
          type: 'radio'
        })
        expect(props[valueAttribute]).toBe(customProps[valueAttribute])
      })
    })
  })

  describe(`with "${valueAttribute}" not defined and "${invertedValueAttribute}" defined`, () => {
    describe(`with "${invertedValueAttribute}" != null`, () => {
      const hook = renderHook(() => useForm({
        initialValues: { a: '1' },
        mode
      }))

      describe('with type="checkbox"', () => {
        it(`should set "${valueAttribute}" using "${invertedValueAttribute}"`, () => {
          const customProps = {
            [invertedValueAttribute]: '2',
            type: 'checkbox'
          }
          const props = hook.result.current.getFieldProps('a', customProps)
          expect(props[valueAttribute]).toBe(customProps[invertedValueAttribute])
        })
      })

      describe('with type="radio"', () => {
        it(`should set "${valueAttribute}" using "${invertedValueAttribute}"`, () => {
          const customProps = {
            [invertedValueAttribute]: '2',
            type: 'radio'
          }
          const props = hook.result.current.getFieldProps('a', customProps)
          expect(props[valueAttribute]).toBe(customProps[invertedValueAttribute])
        })
      })
    })

    describe(`with "${invertedValueAttribute}" == null`, () => {
      const hook = renderHook(() => useForm({
        initialValues: { a: null },
        mode
      }))

      describe(`with "${invertedValueAttribute}" matching form value`, () => {
        describe('with type="checkbox"', () => {
          it(`should set "${invertedValueAttribute}"="true"`, () => {
            const customProps = {
              [invertedValueAttribute]: null,
              type: 'checkbox'
            }
            const props = hook.result.current.getFieldProps('a', customProps)
            expect(props[checkedAttribute]).toBe(true)
          })
        })

        describe('with type="radio"', () => {
          it(`should use "${invertedValueAttribute}"="true"`, () => {
            const customProps = {
              [invertedValueAttribute]: null,
              type: 'radio'
            }
            const props = hook.result.current.getFieldProps('a', customProps)
            expect(props[checkedAttribute]).toBe(true)
          })
        })
      })
    })
  })
}

describe('useForm({ mode: "controlled" }).getFieldProps()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).getFieldProps()', () => {
  tests('uncontrolled')
})
