/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { build } from '../src/utils'

describe('build(path, value, context)', () => {
  describe('with invalid path', () => {
    const context = {
      my: { test: false },
      list: [1, 2]
    }

    it('should throw an error', () => {
      expect(() => {
        build('my. test', true, context)
      }).toThrow()

      expect(() => {
        build('my .test', true, context)
      }).toThrow()

      expect(() => {
        build('my.', true, context)
      }).toThrow()

      expect(() => {
        build('list0]', 3, context)
      }).toThrow()

      expect(() => {
        build('list[0', 3, context)
      }).toThrow()
    })
  })

  describe('with path containing space', () => {
    it('should not throw an error', () => {
      const context = { my: { 'test 1': null } }
      expect(() => {
        build('my[test 1]', true, context)
      }).not.toThrow()
    })

    it('should set value', () => {
      const context = { my: { 'test 1': null } }
      const result = build('my[test 1]', true, context)
      expect(result).toStrictEqual({ my: { 'test 1': true } })
    })
  })

  describe('with undefined context', () => {
    it('should return an object', () => {
      expect(build('user.address', 'Tahiti', undefined))
        .toStrictEqual({ user: { address: 'Tahiti' } })
    })
  })

  describe('with undefined context attribute', () => {
    it('should return an object', () => {
      const result = build('user.address', 'Tahiti', { user: { address: undefined } })
      expect(result).toStrictEqual({ user: { address: 'Tahiti' } })

      expect(build('[user].address', 'Tahiti', { user: undefined }))
        .toStrictEqual({ user: { address: 'Tahiti' } })

      expect(build('[user].address', 'Tahiti', { user: { address: undefined } }))
        .toStrictEqual({ user: { address: 'Tahiti' } })
    })
  })

  describe('with syntaxChecked = true', () => {
    it('should ignore syntax', () => {
      const result = build('user.address', 'Tahiti', { user: { address: undefined } }, true)
      expect(result).toStrictEqual({ user: { address: 'Tahiti' } })
    })
  })

  // Object mutation.

  it('should not mutate the original object', () => {
    const date = new Date()
    const originalObj = {
      array: [],
      date,
      object: { bool: false }
    }
    build('array[1]', 42, originalObj)
    build('object', null, originalObj)
    expect(originalObj)
      .toMatchObject({
        array: [],
        date,
        object: { bool: false }
      })
  })

  // Building root attribute.

  describe('build("array", [], {})', () => {
    it('should return { array: [] }', () => {
      expect(build('array', [], {}))
        .toMatchObject({ array: [] })
    })
  })

  describe('build("bool", true, {})', () => {
    it('should return { bool: true }', () => {
      expect(build('bool', true, {}))
        .toMatchObject({ bool: true })
    })
  })

  describe('build("number", 42, {})', () => {
    it('should return { number: 42 }', () => {
      expect(build('number', 42, {}))
        .toMatchObject({ number: 42 })
    })
  })

  describe('build("object", {}, {})', () => {
    it('should return { object: {} }', () => {
      expect(build('object', {}, {}))
        .toMatchObject({ object: {} })
    })
  })

  describe('build("string", "text", {})', () => {
    it('should return { string: "text" }', () => {
      expect(build('string', 'text', {}))
        .toMatchObject({ string: 'text' })
    })
  })

  // Building nested object attribute.

  describe('build("object.object", {}, {})', () => {
    it('should return { object: { object: {} } }', () => {
      expect(build('object.object', {}, {}))
        .toMatchObject({ object: { object: {} } })
    })
  })

  describe('build("object[object]", {}, {})', () => {
    it('should return { object: { object: {} } }', () => {
      expect(build('object[object]', {}, {}))
        .toMatchObject({ object: { object: {} } })
    })
  })

  describe('build("object.array", [], {})', () => {
    it('should return { object: { array: [] } }', () => {
      expect(build('object.array', [], {}))
        .toMatchObject({ object: { array: [] } })
    })
  })

  describe('build("object[array]", [], {})', () => {
    it('should return { object: { array: [] } }', () => {
      expect(build('object[array]', [], {}))
        .toMatchObject({ object: { array: [] } })
    })
  })

  describe('build("object.array[0]", 42, {})', () => {
    it('should return { object: { array: [42] } }', () => {
      expect(build('object.array[0]', 42, {}))
        .toMatchObject({ object: { array: [42] } })
    })
  })

  // Building nested array attribute.

  describe('build("array[]", null, {})', () => {
    it('should throw a SyntaxError', () => {
      expect(() => build('array[]', null, {}))
        .toThrow(SyntaxError)
    })
  })

  describe('build("array[0]", 42, {})', () => {
    it('should return { array: [42] }', () => {
      expect(build('array[0]', 42, {}))
        .toMatchObject({ array: [42] })
    })
  })

  describe('build("array[1].string", "text", {})', () => {
    it('should return { array: [undefined, { string: "text" }] }', () => {
      expect(build('array[1].string', 'text', {}))
        .toMatchObject({ array: [undefined, { string: 'text' }] })
    })
  })

  describe('build("array[1][string]", "text", {})', () => {
    it('should return { array: [undefined, { string: "text" }] }', () => {
      expect(build('array[1][string]', 'text', {}))
        .toMatchObject({ array: [undefined, { string: 'text' }] })
    })
  })

  describe('build("array[1].array[0]", "42", {})', () => {
    it('should return { array: [undefined, { array: [42] }] }', () => {
      expect(build('array[1].array[0]', 42, {}))
        .toMatchObject({ array: [undefined, { array: [42] }] })
    })
  })

  describe('build("array[1][array][0]", "42", {})', () => {
    it('should return { array: [undefined, { array: [42] }] }', () => {
      expect(build('array[1][array][0]', 42, {}))
        .toMatchObject({ array: [undefined, { array: [42] }] })
    })
  })

  // Building deep nested value.

  describe('build("object.array[0][array][1].object[number]", 42, {})', () => {
    it('should return deep nested object', () => {
      expect(build('object.array[0][array][1].object[number]', 42, {}))
        .toMatchObject({ object: { array: [{ array: [undefined, { object: { number: 42 } }] }] } })
    })
  })
})
