/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, jest } from '@jest/globals'
import useForm from '../src/useForm'

describe('useForm()', () => {
  describe('with options', () => {
    describe('with clearAfterSubmit', () => {
      describe('with clearAfterSubmit = true', () => {
        it('should clear form after submit', async () => {
          const { result } = renderHook(() => {
            return useForm({
              clearAfterSubmit: true,
              initialValues: { username: 'test' },
              onSubmit: () => Promise.resolve(true)
            })
          })

          await act(async () => {
            await result.current.submit()
          })

          expect(result.current.values.username).toBeUndefined()
        })
      })

      describe('with clearAfterSubmit = false', () => {
        it('should not clear form after submit', async () => {
          const { result } = renderHook(() => {
            return useForm({
              clearAfterSubmit: false,
              initialValues: { username: 'test' },
              onSubmit: () => Promise.resolve(true)
            })
          })

          await act(async () => {
            await result.current.submit()
            expect(result.current.values.username).toBeDefined()
          })
        })
      })
    })

    describe('with disabled = true', () => {
      it('should set state.disabled = true', () => {
        const { result } = renderHook(() => useForm({
          disabled: true,
          initialValues: { username: undefined },
          onSubmit: () => Promise.resolve(true)
        }))

        expect(result.current.disabled).toBe(true)
      })
    })

    describe('with initialValues', () => {
      it('should return initialized form', () => {
        const initialValues = {
          username: undefined,
          password: undefined
        }

        const { result } = renderHook(() => useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        }))

        expect(result.current.initialValues).toBe(initialValues)
        expect(result.current.initialized).toBe(true)
      })
    })

    describe('with nullify = true', () => {
      it('should replace empty string with null', () => {
        const { result } = renderHook(() => {
          return useForm({
            initialValues: { username: undefined },
            nullify: true,
            onSubmit: () => Promise.resolve(true)
          })
        })

        act(() => {
          result.current.setValue('username', '')
        })

        expect(result.current.values.username).toBe(null)
      })
    })

    describe('with onSubmit = undefined', () => {
      it('should throw an error', () => {
        expect(() => {
          useForm({
            // @ts-expect-error onSubmit must be defined
            onSubmit: undefined
          })
        }).toThrow()
      })
    })

    describe('with onSubmitted = function', () => {
      it('should call onSubmitted() after submit', async () => {
        const onSubmitted = jest.fn()
        const { result } = renderHook(() => useForm({
          initialValues: { username: undefined },
          onSubmit: () => Promise.resolve(true),
          onSubmitted
        }))

        await act(async () => {
          await result.current.submit()
          expect(onSubmitted).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('with transform = function', () => {
      it('should apply transform when calling setValues()', () => {
        const { result } = renderHook(() => {
          return useForm({
            initialValues: { username: undefined },
            onSubmit: () => Promise.resolve(true),
            transform: (mutation) => {
              const result = { ...mutation }
              Object.entries(result).forEach(([name]) => {
                result[name] = 'transformed'
              })
              return result
            }
          })
        })

        act(() => {
          result.current.setValues({ username: 'test' })
        })

        expect(result.current.values.username).toBe('transformed')
      })
    })

    describe('with trimOnSubmit = true', () => {
      it('should remove extra spaces on string values', async () => {
        const { result } = renderHook(() => {
          return useForm({
            initialValues: { username: '  test  ' },
            trimOnSubmit: true,
            onSubmit: (values) => Promise.resolve(values)
          })
        })

        await act(async () => {
          await result.current.submit()
        })

        expect(result.current.submitResult).toBeDefined()
        expect(result.current.submitResult?.username).toBe('test')
      })
    })

    describe('with trimOnSubmit = true and nullify = true', () => {
      it('should trim and replace empty string with null', async () => {
        const { result } = renderHook(() => {
          return useForm({
            initialValues: { username: '  ' },
            nullify: true,
            trimOnSubmit: true,
            onSubmit: (values) => Promise.resolve(values)
          })
        })

        await act(async () => {
          await result.current.submit()
        })

        expect(result.current.submitResult).toBeDefined()
        expect(result.current.submitResult?.username).toBe(null)
      })
    })

    describe('with validateOnSubmit = false', () => {
      it('should not validate on submit', async () => {
        const initialValues = { username: 'jalik' }
        const validate = jest.fn(() => Promise.resolve(undefined))
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true),
            validate,
            validateOnSubmit: false
          })
        })

        await act(async () => {
          await result.current.submit()
        })

        expect(validate).not.toHaveBeenCalled()
        expect(result.current.submitted).toBe(true)
        expect(result.current.submitting).toBe(false)
        expect(result.current.submitError).toBeUndefined()
        expect(result.current.submitResult).toBe(true)
      })
    })
  })

  describe('clear()', () => {
    it('should clear form state', () => {
      const { result } = renderHook(() => {
        return useForm({
          initialValues: { username: 'jalik' },
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setValue('username', 'test')
        result.current.clear()
      })

      expect(result.current.initialized).toBe(true)
      expect(result.current.modified).toBe(false)
      expect(result.current.modifiedFields.username).toBeUndefined()
      expect(result.current.touched).toBe(false)
      expect(result.current.touchedFields.username).toBeUndefined()
      expect(result.current.values.username).toBeUndefined()
    })
  })

  describe('clearErrors()', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => {
        return useForm({
          initialValues: { username: undefined },
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setError('username', new Error('invalid'))
        result.current.clearErrors()
      })

      expect(result.current.errors.username).toBeUndefined()
    })
  })

  describe('clearTouchedFields()', () => {
    it('should clear all touched fields', () => {
      const { result } = renderHook(() => {
        return useForm({
          initialValues: { username: undefined },
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setTouchedField('username', true)
        result.current.clearTouchedFields()
      })

      expect(result.current.touched).toBe(false)
      expect(result.current.touchedFields.username).toBeUndefined()
    })
  })

  describe('getFieldProps(name)', () => {
    const initialValues = { username: 'jalik' }
    const { result } = renderHook(() => {
      return useForm({
        initialValues,
        onSubmit: () => Promise.resolve(true)
      })
    })

    it('should return field props', () => {
      const props = result.current.getFieldProps('username')
      expect(props).toBeDefined()
      expect(props.id).toBeDefined()
      expect(props.name).toBeDefined()
      expect(props.onBlur).toBeDefined()
      expect(props.onChange).toBeDefined()
      expect(props.value).toBe(initialValues.username)
    })

    describe('with passed props', () => {
      it('should return field props with passed props', () => {
        const passedProps = {
          required: true,
          id: 'randomId'
        }
        const props = result.current.getFieldProps('username', passedProps)
        expect(props).toBeDefined()
        expect(props.id).toBeDefined()
        expect(props.name).toBeDefined()
        expect(props.onBlur).toBeDefined()
        expect(props.onChange).toBeDefined()
        expect(props.value).toBe(initialValues.username)

        Object.entries(passedProps).forEach(([name, value]) => {
          expect(props[name]).toBe(value)
        })
      })
    })
  })

  describe('getInitialValue(name)', () => {
    it('should return initial value', () => {
      const initialValues = { username: 'jalik' }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })

      expect(result.current.getInitialValue('username')).toBe(initialValues.username)
    })
  })

  describe('getValue(name)', () => {
    it('should return field value', () => {
      const initialValues = { username: undefined }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setValue('username', 'jalik')
      })

      expect(result.current.getValue('username')).toBe('jalik')
    })
  })

  describe('handleSetValue(name, options)', () => {
    describe('without parser option', () => {
      it('should set field value when called', () => {
        const initialValues = { username: undefined }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true)
          })
        })
        act(() => {
          result.current.handleSetValue('username')('jalik')
        })
        expect(result.current.getValue('username')).toBe('jalik')
      })
    })

    describe('with parser option', () => {
      it('should set field value when called', () => {
        const initialValues = { username: undefined }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true)
          })
        })
        act(() => {
          result.current.handleSetValue('username', { parser: (value) => value + '1' })('jalik')
        })
        expect(result.current.getValue('username')).toBe('jalik1')
      })
    })
  })

  describe('load()', () => {
    it('should trigger load()', async () => {
      const initialValues = { username: 'jalik' }
      const load = async () => Promise.resolve(initialValues)

      const { result } = renderHook(() =>
        useForm({
          load,
          onSubmit: () => Promise.resolve(true)
        }))

      await act(async () => {
        // wait for load promise
      })

      expect(result.current.initialized).toBe(true)
      expect(result.current.initialValues.username).toBe(initialValues.username)
      expect(result.current.loading).toBe(false)
      expect(result.current.loadError).toBeUndefined()
    })

    describe('with error thrown during load', () => {
      it('should catch the error and set form.loadError', async () => {
        const load = async () => {
          throw new Error('unknown error')
        }
        const { result } = renderHook(() =>
          useForm({
            load,
            onSubmit: () => Promise.resolve(true)
          }))

        await act(async () => {
          // wait for load promise
        })

        expect(result.current.initialized).toBe(false)
        expect(result.current.loading).toBe(false)
        expect(result.current.loadError).toBeDefined()
      })
    })
  })

  describe('removeField(name)', () => {
    it('should remove field', () => {
      const initialValues = { username: 'jalik' }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setValue('username', 'test')
        result.current.setError('username', new Error('invalid'))
        result.current.removeFields(['username'])
      })

      expect(result.current.values.username).toBeUndefined()
      expect(result.current.errors.username).toBeUndefined()
      expect(result.current.modifiedFields.username).toBeUndefined()
      expect(result.current.touchedFields.username).toBeUndefined()
    })
  })

  describe('reset()', () => {
    it('should reset all fields', () => {
      const initialValues = { username: 'jalik' }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setValue('username', 'test')
        result.current.reset()
      })

      expect(result.current.modified).toBe(false)
      expect(result.current.modifiedFields.username).toBeUndefined()
      expect(result.current.touched).toBe(false)
      expect(result.current.touchedFields.username).toBeUndefined()
      expect(result.current.values.username).toBe(initialValues.username)
    })

    describe('with fields = string[]', () => {
      it('should reset given fields', () => {
        const initialValues = {
          username: 'jalik',
          password: undefined
        }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true)
          })
        })

        act(() => {
          result.current.setValues({
            username: 'test',
            password: 'secret'
          })
          result.current.reset(['password'])
        })

        expect(result.current.modifiedFields.username).toBe(true)
        expect(result.current.modifiedFields.password).toBeUndefined()
        expect(result.current.values.username).toBe('test')
        expect(result.current.values.password).toBe(initialValues.password)
      })
    })
  })

  describe('setErrors(errors)', () => {
    it('should set all fields errors', () => {
      const initialValues = { username: 'jalik' }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setErrors({ username: new Error('invalid') })
      })

      expect(result.current.errors.username).toBeDefined()
    })
  })

  describe('setTouchedField(field, touched)', () => {
    it('should set a single touched field', () => {
      const { result } = renderHook(() => {
        return useForm({
          initialValues: {
            username: undefined,
            password: undefined
          },
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setTouchedField('username', true)
      })

      expect(result.current.touched).toBe(true)
      expect(result.current.touchedFields.username).toBe(true)
      expect(result.current.touchedFields.password).toBeFalsy()
    })
  })

  describe('setTouchedFields(fields, options)', () => {
    it('should set all touched fields', () => {
      const { result } = renderHook(() => {
        return useForm({
          initialValues: {
            username: undefined,
            password: undefined
          },
          onSubmit: () => Promise.resolve(true)
        })
      })

      act(() => {
        result.current.setTouchedFields({
          username: true,
          password: true
        })
      })

      expect(result.current.touched).toBe(true)
      expect(result.current.touchedFields.username).toBe(true)
      expect(result.current.touchedFields.password).toBe(true)
    })

    describe('with only falsy values', () => {
      it('should not set form.touched to true', () => {
        const { result } = renderHook(() => {
          return useForm({
            initialValues: {
              username: undefined,
              password: undefined
            },
            onSubmit: () => Promise.resolve(true)
          })
        })

        act(() => {
          result.current.setTouchedFields({
            username: false,
            password: false
          })
        })

        expect(result.current.touched).toBe(false)
        expect(result.current.touchedFields.username).toBeFalsy()
        expect(result.current.touchedFields.password).toBeFalsy()
      })
    })
  })

  describe('setValues(values, options)', () => {
    describe('with options.partial = false', () => {
      it('should replace all values', () => {
        const initialValues = { username: undefined }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true)
          })
        })

        act(() => {
          result.current.setValues({ username: 'jalik' })
        })

        expect(result.current.values.username).toBe('jalik')
      })
    })

    describe('with options.partial = true', () => {
      it('should replace given values only', () => {
        const initialValues = {
          username: 'jalik',
          password: undefined
        }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true)
          })
        })

        act(() => {
          result.current.setValues({ password: 'secret' })
        })

        expect(result.current.values.password).toBe('secret')
        expect(result.current.values.username).toBeUndefined()
      })
    })

    describe('with state function (s) => newState', () => {
      it('should be called with currentState', () => {
        const initialValues = {
          count: 0
        }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true)
          })
        })

        act(() => {
          result.current.setValues((s) => ({
            ...s,
            count: s.count + 1
          }))
          result.current.setValues((s) => ({
            ...s,
            count: s.count + 1
          }))
        })

        expect(result.current.values.count).toBe(2)
      })
    })
  })

  describe('submit()', () => {
    const initialValues = { username: 'jalik' }

    it('should call options.onSubmit()', async () => {
      const onSubmit = jest.fn(() => Promise.resolve(true))
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit
        })
      })

      await act(async () => {
        await result.current.submit()
      })

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(result.current.submitted).toBe(true)
      expect(result.current.submitting).toBe(false)
      expect(result.current.submitError).toBeUndefined()
      expect(result.current.submitResult).toBe(true)
    })

    it('should not submit if validation failed', async () => {
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true),
          validate: async () => {
            return { username: new Error('invalid') }
          }
        })
      })

      await act(async () => {
        await result.current.submit()
      })

      expect(result.current.submitting).toBe(false)
      expect(result.current.submitted).toBe(false)
      expect(result.current.validated).toBe(false)
      expect(result.current.errors.username).toBeDefined()
    })

    describe('with error thrown during submit', () => {
      const onSubmit = async () => {
        throw new Error('unknown error')
      }

      it('should catch the error and set form.submitError', async () => {
        const initialValues = { username: 'jalik' }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit
          })
        })

        await act(async () => {
          await result.current.submit()
        })

        expect(result.current.submitResult).toBeUndefined()
        expect(result.current.submitting).toBe(false)
        expect(result.current.submitted).toBe(false)
        expect(result.current.submitError).toBeDefined()
      })

      it('should increment submitCount by 1', async () => {
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit
          })
        })

        await act(async () => {
          await result.current.submit()
        })

        expect(result.current.submitCount).toBe(1)
      })
    })
  })

  describe('validateField(name)', () => {
    it('should validate a single field', async () => {
      const initialValues = { username: undefined }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true),
          validateField: async (name, value) => {
            if (name === 'username' && value == null) {
              return new Error('invalid')
            }
          }
        })
      })

      await act(async () => {
        await result.current.validateField('username')
      })

      expect(result.current.errors.username).toBeDefined()
    })
  })

  describe('validate()', () => {
    it('should call options.validate()', async () => {
      const initialValues = { username: undefined }
      const validate = jest.fn(() => Promise.resolve({ username: new Error('invalid') }))
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true),
          validate
        })
      })

      await act(async () => {
        await result.current.validate()
      })

      expect(validate).toHaveBeenCalledTimes(1)
      expect(result.current.errors.username).toBeDefined()
      expect(result.current.validating).toBe(false)
      expect(result.current.validated).toBe(false)
      expect(result.current.validateError).toBeUndefined()
    })

    it('should catch error during validation and set form.validateError', async () => {
      const initialValues = { username: undefined }
      const validate = async () => {
        throw new Error('unknonw error')
      }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true),
          validate
        })
      })

      await act(async () => {
        await result.current.validate()
      })

      expect(result.current.validating).toBe(false)
      expect(result.current.validated).toBe(false)
      expect(result.current.validateError).toBeDefined()
    })

    it('should pass when no errors', async () => {
      const initialValues = { username: undefined }
      const validate = jest.fn(() => Promise.resolve(undefined))
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true),
          validate
        })
      })

      await act(async () => {
        await result.current.validate()
      })

      expect(validate).toHaveBeenCalledTimes(1)
      expect(result.current.errors.username).toBeUndefined()
      expect(result.current.validating).toBe(false)
      expect(result.current.validated).toBe(true)
      expect(result.current.validateError).toBeUndefined()
    })
  })

  describe('validateFields(fields)', () => {
    it('should validate given fields', async () => {
      const initialValues = { username: undefined }
      const { result } = renderHook(() => {
        return useForm({
          initialValues,
          onSubmit: () => Promise.resolve(true),
          validateField: async (name, value) => {
            if (name === 'username' && value == null) {
              return new Error('invalid')
            }
          }
        })
      })

      await act(async () => {
        await result.current.validateFields(['username'])
      })
      expect(result.current.errors.username).toBeDefined()
    })

    describe('with an error thrown during validation', () => {
      it('should catch the error and set form.validateError', async () => {
        const initialValues = { username: undefined }
        const { result } = renderHook(() => {
          return useForm({
            initialValues,
            onSubmit: () => Promise.resolve(true),
            validateField: async () => {
              throw new Error('unknown error')
            }
          })
        })

        await act(async () => {
          await result.current.validateFields(['username'])
        })
        expect(result.current.validateError).toBeDefined()
      })
    })
  })
})
