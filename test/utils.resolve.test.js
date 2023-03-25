/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import {
  describe,
  expect,
  it,
} from '@jest/globals';
import { resolve } from '../src/utils';

describe('resolve(path, context)', () => {
  const context = {
    array: [
      42,
      {
        array: [],
        string: 'text',
      },
    ],
    bool: true,
    date: new Date(),
    number: 1,
    object: {
      array: [{ array: [null, { object: { field: null } }] }],
      object: {},
    },
    string: 'text',
  };

  // Undefined or null context.

  describe('resolve("", null)', () => {
    it('should return null', () => {
      expect(resolve('', null))
        .toBeNull();
    });
  });

  describe('resolve("", undefined)', () => {
    it('should return undefined', () => {
      expect(resolve('', undefined))
        .toBeUndefined();
    });
  });

  // Invalid path.

  describe('resolve(null, context)', () => {
    it('should throw an error', () => {
      expect(() => resolve(null, context))
        .toThrow();
    });
  });

  describe('resolve(undefined, context)', () => {
    it('should throw an error', () => {
      expect(() => resolve(undefined, context))
        .toThrow();
    });
  });

  describe('resolve("object .array", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('object .array', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("object.", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('object.', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("object. array", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('object. array', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("array [0]", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('array [0]', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("array[ 0]", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('array[ 0]', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("array[0 ]", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('array[0 ]', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("array[0", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('array[0', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("array0]", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('array0]', context))
        .toThrow(SyntaxError);
    });
  });

  // Resolving root attribute.

  describe('resolve("", context)', () => {
    it('should return context', () => {
      expect(resolve('', context))
        .toBe(context);
    });
  });

  describe('resolve("undefined", context)', () => {
    it('should return undefined', () => {
      expect(resolve('undefined', context))
        .toBeUndefined();
    });
  });

  describe('resolve("undefined.undefined", context)', () => {
    it('should return undefined', () => {
      expect(resolve('undefined.undefined', context))
        .toBeUndefined();
    });
  });

  describe('resolve("array", context)', () => {
    it('should return the array value', () => {
      expect(resolve('array', context))
        .toBe(context.array);
    });
  });

  describe('resolve("bool", context)', () => {
    it('should return the boolean value', () => {
      expect(resolve('bool', context))
        .toBe(context.bool);
    });
  });

  describe('resolve("date", context)', () => {
    it('should return the date value', () => {
      expect(resolve('date', context))
        .toBe(context.date);
    });
  });

  describe('resolve("number", context)', () => {
    it('should return the number value', () => {
      expect(resolve('number', context))
        .toBe(context.number);
    });
  });

  describe('resolve("object", context)', () => {
    it('should return the object value', () => {
      expect(resolve('object', context))
        .toMatchObject(context.object);
    });
  });

  describe('resolve("string", context)', () => {
    it('should return the string value', () => {
      expect(resolve('string', context))
        .toBe(context.string);
    });
  });

  // Resolving nested object attribute.

  describe('resolve("object.object", context)', () => {
    it('should return the attribute of the nested object', () => {
      expect(resolve('object.object', context))
        .toMatchObject(context.object.object);
    });
  });

  describe('resolve("object[object]", context)', () => {
    it('should return the attribute of the nested object', () => {
      expect(resolve('object[object]', context))
        .toMatchObject(context.object.object);
    });
  });

  describe('resolve("object.array", context)', () => {
    it('should return the array of the nested object', () => {
      expect(resolve('object.array', context))
        .toBe(context.object.array);
    });
  });

  describe('resolve("object[array]", context)', () => {
    it('should return the array of the nested object', () => {
      expect(resolve('object[array]', context))
        .toBe(context.object.array);
    });
  });

  describe('resolve("object.array[0]", context)', () => {
    it('should return the value of the nested array index', () => {
      expect(resolve('object.array[0]', context))
        .toBe(context.object.array[0]);
    });
  });

  // Resolving nested array index.

  describe('resolve("array[]", context)', () => {
    it('should throw a SyntaxError', () => {
      expect(() => resolve('array[]', context))
        .toThrow(SyntaxError);
    });
  });

  describe('resolve("array[0]", context)', () => {
    it('should return the value of the array at index 0', () => {
      expect(resolve('array[0]', context))
        .toBe(context.array[0]);
    });
  });

  describe('resolve("array[1].string", context)', () => {
    it('should return the value of the nested object attribute', () => {
      expect(resolve('array[1].string', context))
        .toBe(context.array[1].string);
    });
  });

  describe('resolve("array[1][string]", context)', () => {
    it('should return the value of the nested object attribute', () => {
      expect(resolve('array[1][string]', context))
        .toBe(context.array[1].string);
    });
  });

  describe('resolve("array[1].array[0]", context)', () => {
    it('should return the value of the nested array index', () => {
      expect(resolve('array[1].array[0]', context))
        .toBe(context.array[1].array[0]);
    });
  });

  describe('resolve("array[1][array][0]", context)', () => {
    it('should return the value of the nested array index', () => {
      expect(resolve('array[1][array][0]', context))
        .toBe(context.array[1].array[0]);
    });
  });

  // Resolving deep nested value.

  describe('resolve("object.array[0][array][1].object[field]", context)', () => {
    it('should return deep nested value', () => {
      expect(resolve('object.array[0][array][1].object[field]', context))
        .toBe(context.object.array[0].array[1].object.field);
    });
  });
});
