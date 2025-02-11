/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import useForm from '../../src/useForm'
import { FormMode } from '../../src'
import { filterErrors } from '../../src/useFormErrors'

function tests (mode: FormMode) {
  describe('without arguments', () => {
    it('should reset all values', () => {
      const initialValues = {
        a: 1,
        b: 2,
        c: 3
      }
      const hook = renderHook(() => useForm({
        mode,
        initialValues
      }))
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      act(() => hook.result.current.setValues({ b: null }))
      expect(hook.result.current.getValues()).not.toStrictEqual(initialValues)
      act(() => hook.result.current.reset())
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
    })

    it('should reset all errors', () => {
      const initialErrors = {
        a: 'invalid',
        b: 'invalid',
        c: 'invalid'
      }
      const hook = renderHook(() => useForm({
        mode,
        initialErrors
      }))
      expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
      expect(hook.result.current.errors).toStrictEqual(initialErrors)
      act(() => hook.result.current.setErrors({ b: null }, { forceUpdate: true }))
      expect(hook.result.current.getErrors()).not.toStrictEqual(initialErrors)
      expect(hook.result.current.errors).not.toStrictEqual(initialErrors)
      act(() => hook.result.current.reset())
      expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
      expect(hook.result.current.errors).toStrictEqual(initialErrors)
    })

    it('should reset all modified states', () => {
      const initialModified = {
        a: true,
        b: true,
        c: true
      }
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.getModified()).toStrictEqual(initialModified)
      expect(hook.result.current.modifiedFields).toStrictEqual(initialModified)
      act(() => hook.result.current.setValues({ b: null }, {
        forceUpdate: true,
        partial: false
      }))
      expect(hook.result.current.getModified()).not.toStrictEqual(initialModified)
      expect(hook.result.current.modifiedFields).not.toStrictEqual(initialModified)
      act(() => hook.result.current.reset())
      expect(hook.result.current.getModified()).toStrictEqual(initialModified)
      expect(hook.result.current.modifiedFields).toStrictEqual(initialModified)
    })

    it('should reset all touched states', () => {
      const initialTouched = {
        a: true,
        b: true,
        c: true
      }
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
      expect(hook.result.current.touchedFields).toStrictEqual(initialTouched)
      act(() => hook.result.current.setTouched({ b: false }, { forceUpdate: true }))
      expect(hook.result.current.getTouched()).not.toStrictEqual(initialTouched)
      expect(hook.result.current.touchedFields).not.toStrictEqual(initialTouched)
      act(() => hook.result.current.reset())
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
      expect(hook.result.current.touchedFields).toStrictEqual(initialTouched)
    })
  })

  describe('with paths', () => {
    it('should reset values of given paths', () => {
      const initialValues = {
        a: 1,
        b: 2,
        c: 3
      }
      const nextValues = { b: 0 }
      const hook = renderHook(() => useForm({
        mode,
        initialValues
      }))
      expect(hook.result.current.getValues()).toStrictEqual(initialValues)
      act(() => hook.result.current.setValues(nextValues))
      expect(hook.result.current.getValues()).toStrictEqual(nextValues)
      act(() => hook.result.current.reset(['a', 'c']))
      expect(hook.result.current.getValue('a')).toBe(initialValues.a)
      expect(hook.result.current.getValue('b')).toBe(nextValues.b)
      expect(hook.result.current.getValue('c')).toBe(initialValues.c)
    })

    it('should reset errors of given paths', () => {
      const initialErrors = {
        a: 'invalid',
        b: 'invalid',
        c: 'invalid'
      }
      const nextErrors = {
        a: undefined,
        b: undefined,
        c: undefined
      }
      const hook = renderHook(() => useForm({
        mode,
        initialErrors
      }))
      expect(hook.result.current.getErrors()).toStrictEqual(initialErrors)
      act(() => hook.result.current.setErrors(nextErrors))
      expect(hook.result.current.getErrors()).toStrictEqual(filterErrors(nextErrors))
      act(() => hook.result.current.reset(['a', 'c']))
      expect(hook.result.current.getError('a')).toBe(initialErrors.a)
      expect(hook.result.current.getError('b')).toBe(nextErrors.b)
      expect(hook.result.current.getError('c')).toBe(initialErrors.c)
    })

    it('should reset modified state of given paths', () => {
      const initialModified = {
        a: true,
        b: true,
        c: true
      }
      const nextModified = {
        a: false,
        b: false,
        c: false
      }
      const hook = renderHook(() => useForm({
        mode,
        initialModified
      }))
      expect(hook.result.current.getModified()).toStrictEqual(initialModified)
      act(() => hook.result.current.setValues(nextModified))
      expect(hook.result.current.isModified('a')).toBe(nextModified.a)
      expect(hook.result.current.isModified('b')).toBe(nextModified.b)
      expect(hook.result.current.isModified('c')).toBe(nextModified.c)
      act(() => hook.result.current.reset(['a', 'c']))
      expect(hook.result.current.isModified('a')).toBe(initialModified.a)
      expect(hook.result.current.isModified('b')).toBe(nextModified.b)
      expect(hook.result.current.isModified('c')).toBe(initialModified.c)
    })

    it('should reset touched state of given paths', () => {
      const initialTouched = {
        a: true,
        b: true,
        c: true
      }
      const nextTouched = {
        a: false,
        b: false,
        c: false
      }
      const hook = renderHook(() => useForm({
        mode,
        initialTouched
      }))
      expect(hook.result.current.getTouched()).toStrictEqual(initialTouched)
      act(() => hook.result.current.setTouched(nextTouched))
      expect(hook.result.current.isTouched('a')).toBe(nextTouched.a)
      expect(hook.result.current.isTouched('b')).toBe(nextTouched.b)
      expect(hook.result.current.isTouched('c')).toBe(nextTouched.c)
      act(() => hook.result.current.reset(['a', 'c']))
      expect(hook.result.current.isTouched('a')).toBe(initialTouched.a)
      expect(hook.result.current.isTouched('b')).toBe(nextTouched.b)
      expect(hook.result.current.isTouched('c')).toBe(initialTouched.c)
    })
  })
}

describe('useForm({ mode: "controlled" }).reset()', () => {
  tests('controlled')
})

describe('useForm({ mode: "uncontrolled" }).reset()', () => {
  tests('uncontrolled')
})
