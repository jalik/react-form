/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import { flatten } from '../src/utils'

describe('flatten(object)', () => {
  it('should return a flat object', () => {
    {
      // case 1
      const obj = flatten({
        a: {
          test: 1,
          nested: { yes: true }
        },
        b: 2
      })
      const result = {
        'a.test': 1,
        'a.nested.yes': true,
        b: 2
      }
      expect(obj).toMatchObject(result)
    }
    {
      // case 2
      const obj = flatten({
        a: {
          list: [1, 2, 3]
        }
      })
      const result = {
        'a.list': [1, 2, 3]
      }
      expect(obj).toMatchObject(result)
    }
  })
})
