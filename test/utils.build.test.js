/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Karl STEIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { build } from '../src/utils';

describe('build(path, value, context)', () => {
  // Object mutation.

  it('should not mutate the original object', () => {
    const date = new Date();
    const originalObj = {
      array: [],
      date,
      object: { bool: false },
    };
    build('array[1]', 42, originalObj);
    build('object', null, originalObj);
    expect(originalObj)
      .toMatchObject({
        array: [],
        date,
        object: { bool: false },
      });
  });

  // Building root attribute.

  describe('build("array", [], {})', () => {
    it('should return { array: [] }', () => {
      expect(build('array', [], {}))
        .toMatchObject({ array: [] });
    });
  });

  describe('build("bool", true, {})', () => {
    it('should return { bool: true }', () => {
      expect(build('bool', true, {}))
        .toMatchObject({ bool: true });
    });
  });

  describe('build("number", 42, {})', () => {
    it('should return { number: 42 }', () => {
      expect(build('number', 42, {}))
        .toMatchObject({ number: 42 });
    });
  });

  describe('build("object", {}, {})', () => {
    it('should return { object: {} }', () => {
      expect(build('object', {}, {}))
        .toMatchObject({ object: {} });
    });
  });

  describe('build("string", "text", {})', () => {
    it('should return { string: "text" }', () => {
      expect(build('string', 'text', {}))
        .toMatchObject({ string: 'text' });
    });
  });

  // Building nested object attribute.

  describe('build("object.object", {}, {})', () => {
    it('should return { object: { object: {} } }', () => {
      expect(build('object.object', {}, {}))
        .toMatchObject({ object: { object: {} } });
    });
  });

  describe('build("object[object]", {}, {})', () => {
    it('should return { object: { object: {} } }', () => {
      expect(build('object[object]', {}, {}))
        .toMatchObject({ object: { object: {} } });
    });
  });

  describe('build("object.array", [], {})', () => {
    it('should return { object: { array: [] } }', () => {
      expect(build('object.array', [], {}))
        .toMatchObject({ object: { array: [] } });
    });
  });

  describe('build("object[array]", [], {})', () => {
    it('should return { object: { array: [] } }', () => {
      expect(build('object[array]', [], {}))
        .toMatchObject({ object: { array: [] } });
    });
  });

  describe('build("object.array[0]", 42, {})', () => {
    it('should return { object: { array: [42] } }', () => {
      expect(build('object.array[0]', 42, {}))
        .toMatchObject({ object: { array: [42] } });
    });
  });

  // Building nested array attribute.

  describe('build("array[]", null, {})', () => {
    it('should throw a SyntaxError', () => {
      expect(() => build('array[]', null, {}))
        .toThrow(SyntaxError);
    });
  });

  describe('build("array[0]", 42, {})', () => {
    it('should return { array: [42] }', () => {
      expect(build('array[0]', 42, {}))
        .toMatchObject({ array: [42] });
    });
  });

  describe('build("array[1].string", "text", {})', () => {
    it('should return { array: [undefined, { string: "text" }] }', () => {
      expect(build('array[1].string', 'text', {}))
        .toMatchObject({ array: [undefined, { string: 'text' }] });
    });
  });

  describe('build("array[1][string]", "text", {})', () => {
    it('should return { array: [undefined, { string: "text" }] }', () => {
      expect(build('array[1][string]', 'text', {}))
        .toMatchObject({ array: [undefined, { string: 'text' }] });
    });
  });

  describe('build("array[1].array[0]", "42", {})', () => {
    it('should return { array: [undefined, { array: [42] }] }', () => {
      expect(build('array[1].array[0]', 42, {}))
        .toMatchObject({ array: [undefined, { array: [42] }] });
    });
  });

  describe('build("array[1][array][0]", "42", {})', () => {
    it('should return { array: [undefined, { array: [42] }] }', () => {
      expect(build('array[1][array][0]', 42, {}))
        .toMatchObject({ array: [undefined, { array: [42] }] });
    });
  });

  // Building deep nested value.

  describe('build("object.array[0][array][1].object[number]", 42, {})', () => {
    it('should return deep nested object', () => {
      expect(build('object.array[0][array][1].object[number]', 42, {}))
        .toMatchObject({ object: { array: [{ array: [undefined, { object: { number: 42 } }] }] } });
    });
  });
});
