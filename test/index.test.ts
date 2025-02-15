/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import * as index from '../src/index'

describe('index', () => {
  it('should export components', () => {
    expect(index.Button).toBeDefined()
    expect(index.Field).toBeDefined()
    expect(index.FieldError).toBeDefined()
    expect(index.Form).toBeDefined()
  })

  it('should export contexts', () => {
    expect(index.FormContext).toBeDefined()
  })

  it('should export hooks', () => {
    expect(index.useFieldArray).toBeDefined()
    expect(index.useForm).toBeDefined()
    expect(index.useFormContext).toBeDefined()
  })

  it('should export functions', () => {
    expect(index.build).toBeDefined()
    expect(index.flatten).toBeDefined()
    expect(index.hasDefinedValues).toBeDefined()
    expect(index.hasTrueValues).toBeDefined()
    expect(index.reconstruct).toBeDefined()
    expect(index.resolve).toBeDefined()

    expect(index.getFieldId).toBeDefined()
    expect(index.inputValue).toBeDefined()
    expect(index.randomKey).toBeDefined()

    expect(index.getIndexFromPath).toBeDefined()
    expect(index.movePathIndices).toBeDefined()
    expect(index.swapPathIndices).toBeDefined()
    expect(index.updatePathIndices).toBeDefined()
  })
})
