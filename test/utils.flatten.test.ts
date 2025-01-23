/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { flatten } from '../src/utils'

describe('flatten(object)', () => {
  it('should return object values', () => {
    const obj = {
      a: { v: 1 },
      b: { v: 2 }
    }
    const result = flatten(obj)
    expect(result.a).toMatchObject(obj.a)
    expect(result.b).toMatchObject(obj.b)
  })

  it('should return array values', () => {
    const obj = { a: [1, 2] }
    const result = flatten(obj)
    expect(result['a[0]']).toBe(obj.a[0])
    expect(result['a[1]']).toBe(obj.a[1])
  })

  it('should return nested object values', () => {
    const obj = { a: { b: { c: 1 } } }
    const result = flatten(obj)
    expect(result['a.b']).toMatchObject(obj.a.b)
    expect(result['a.b.c']).toBe(obj.a.b.c)
  })

  it('should return nested array values', () => {
    const obj = { a: { b: [1, 2] } }
    const result = flatten(obj)
    expect(result['a.b[0]']).toBe(obj.a.b[0])
    expect(result['a.b[1]']).toBe(obj.a.b[1])
  })

  it('should return array values nested in array', () => {
    const obj = { a: [[1], [2]] }
    const result = flatten(obj)
    expect(result.a).toStrictEqual(obj.a)
    expect(result['a[0]']).toStrictEqual(obj.a[0])
    expect(result['a[0][0]']).toBe(obj.a[0][0])
    expect(result['a[1][0]']).toBe(obj.a[1][0])
  })

  it('should return object values nested in array', () => {
    const obj = { a: [{ b: 1 }] }
    const result = flatten(obj)
    expect(result['a[0].b']).toBe(obj.a[0].b)
  })

  it('should use dot notation by default', () => {
    const obj = { a: { b: { c: 1 } } }
    const result = { 'a.b.c': 1 }
    expect(flatten(obj)).toMatchObject(result)
  })

  it('should use brackets notation when space found in key', () => {
    const obj = { a: { 'b c': { d: 1 } } }
    const result = { 'a[b c].d': 1 }
    expect(flatten(obj)).toMatchObject(result)
  })

  it('should use brackets notation when dot found in key', () => {
    const obj = {
      a: { 'b.c': { d: 1 } },
      e: { 'f.g': 1 }
    }
    const result = {
      'a[b.c].d': 1,
      'e[f.g]': 1
    }
    expect(flatten(obj)).toMatchObject(result)
  })

  it('should not modify root paths when preserveKeys = true', () => {
    const obj = {
      'a[b.c]': { d: 1 },
      'a[b c]': { d: 1 }
    }
    const result = {
      'a[b.c].d': 1,
      'a[b c].d': 1
    }
    expect(flatten(obj, null, true)).toMatchObject(result)
  })
})
