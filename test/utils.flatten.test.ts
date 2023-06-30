/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { flatten } from '../src/utils'

describe('flatten(object)', () => {
  it('should return object value', () => {
    const obj = {
      a: { v: 1 },
      b: { v: 2 }
    }
    const result = flatten(obj)
    expect(result.a).toMatchObject(obj.a)
    expect(result.b).toMatchObject(obj.b)
  })

  it('should return attributes value', () => {
    const obj = {
      a: {
        b: 1,
        c: 2
      }
    }
    const result = flatten(obj)
    expect(result['a.b']).toBe(obj.a.b)
    expect(result['a.c']).toBe(obj.a.c)
  })

  it('should use dot notation by default', () => {
    const obj = { a: { b: { c: 1 } } }
    const result = { 'a.b.c': 1 }
    expect(flatten(obj)).toMatchObject(result)
  })

  it('should use brackets notation when space found', () => {
    const obj = { a: { 'b c': { d: 1 } } }
    const result = { 'a[b c].d': 1 }
    expect(flatten(obj)).toMatchObject(result)
  })

  it('should use brackets notation when dot found', () => {
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

  it('should not modify root paths', () => {
    const obj = {
      'a[b.c]': { d: 1 },
      'a[b c]': { d: 1 }
    }
    const result = {
      'a[b.c].d': 1,
      'a[b c].d': 1
    }
    expect(flatten(obj)).toMatchObject(result)
  })
})
