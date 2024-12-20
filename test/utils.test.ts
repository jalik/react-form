/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import {
  getCheckedValues,
  getFieldId,
  getSelectedValues,
  inputValue,
  isMultipleFieldElement,
  parseInputValue,
  randomKey
} from '../src/utils'

describe('getFieldId(name, value)', () => {
  it('should return a generated field using name and value', () => {
    const result = getFieldId('test', '0000000000')
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('getCheckedValues(element)', () => {
  describe('with element in form', () => {
    it('should return checked values', () => {
      const form = document.createElement('form')

      const input = document.createElement('input')
      input.checked = true
      input.name = 'test'
      input.type = 'checkbox'
      input.value = '1'
      form.append(input)

      const input2 = document.createElement('input')
      input2.name = 'test'
      input2.type = 'checkbox'
      input2.value = '2'
      form.append(input2)

      expect(getCheckedValues(input)).toStrictEqual([input.value])
    })
  })

  describe('with element not inside a form', () => {
    it('should return empty array', () => {
      const input = document.createElement('input')
      input.checked = true
      input.name = 'test'
      input.type = 'checkbox'

      expect(getCheckedValues(input)).toStrictEqual([])
    })
  })
})

describe('getSelectedValues(element)', () => {
  it('should return selected values', () => {
    const form = document.createElement('form')

    const select = document.createElement('select')
    select.name = 'test'
    select.multiple = true
    form.append(select)

    const option = document.createElement('option')
    option.value = '1'
    option.selected = true
    select.append(option)

    const option2 = document.createElement('option')
    option2.value = '2'
    select.append(option2)

    expect(getSelectedValues(select)).toStrictEqual([option.value])
  })
})

describe('inputValue(value)', () => {
  describe('with a null value', () => {
    it('should return an empty string', () => {
      expect(inputValue(null)).toBe('')
    })
  })

  describe('with a non-null value', () => {
    it('should return the original value', () => {
      expect(inputValue('test')).toBe('test')
      expect(inputValue(1337)).toBe(1337)
      expect(inputValue(true)).toBe(true)
    })
  })
})

describe('isMultipleFieldElement(element)', () => {
  describe('with element in a form', () => {
    describe('with a single checkbox input', () => {
      const form = document.createElement('form')
      const element = document.createElement('input')
      element.name = 'test'
      element.type = 'checkbox'
      form.append(element)

      it('should return false', () => {
        expect(isMultipleFieldElement(element)).toBe(false)
        expect(isMultipleFieldElement(form.elements.namedItem(element.name))).toBe(false)
      })
    })

    describe('with a multiple checkbox input', () => {
      const form = document.createElement('form')
      const element = document.createElement('input')
      element.name = 'test'
      element.type = 'checkbox'
      form.append(element)

      const element2 = document.createElement('input')
      element2.name = 'test'
      element2.type = 'checkbox'
      form.append(element2)

      it('should return true', () => {
        expect(isMultipleFieldElement(element)).toBe(true)
        expect(isMultipleFieldElement(form.elements.namedItem(element.name))).toBe(true)
      })
    })

    describe('with a single file input', () => {
      const form = document.createElement('form')
      const element = document.createElement('input')
      element.name = 'test'
      element.type = 'file'
      form.append(element)

      it('should return false', () => {
        expect(isMultipleFieldElement(element)).toBe(false)
        expect(isMultipleFieldElement(form.elements.namedItem(element.name))).toBe(false)
      })
    })

    describe('with a multiple file input', () => {
      const form = document.createElement('form')
      const element = document.createElement('input')
      element.name = 'test'
      element.type = 'file'
      form.append(element)

      const element2 = document.createElement('input')
      element2.name = 'test'
      element2.type = 'file'
      form.append(element2)

      it('should return true', () => {
        expect(isMultipleFieldElement(element)).toBe(true)
        expect(isMultipleFieldElement(form.elements.namedItem(element.name))).toBe(true)
      })
    })

    describe('with a single select', () => {
      const form = document.createElement('form')
      const element = document.createElement('select')
      element.name = 'test'
      element.multiple = false
      form.append(element)

      it('should return false', () => {
        expect(isMultipleFieldElement(element)).toBe(false)
        expect(isMultipleFieldElement(form.elements.namedItem(element.name))).toBe(false)
      })
    })

    describe('with a multiple select', () => {
      const form = document.createElement('form')
      const element = document.createElement('select')
      element.name = 'test'
      element.multiple = true
      form.append(element)

      it('should return true', () => {
        expect(isMultipleFieldElement(element)).toBe(true)
        expect(isMultipleFieldElement(form.elements.namedItem(element.name))).toBe(true)
      })
    })
  })

  describe('with element not in a form', () => {
    const element = document.createElement('select')
    element.name = 'test'
    element.multiple = true

    it('should return false', () => {
      expect(isMultipleFieldElement(element)).toBe(false)
    })
  })
})

describe('parseInputValue(input)', () => {
  describe('with number input', () => {
    it('should return a number', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = '100'
      expect(parseInputValue(input)).toBe(Number(input.value))
      input.value = '100.10'
      expect(parseInputValue(input)).toBe(Number(input.value))
    })
  })

  describe('with range input', () => {
    it('should return a number', () => {
      const input = document.createElement('input')
      input.type = 'range'
      input.value = '100'
      expect(parseInputValue(input)).toBe(Number(input.value))
      input.value = '100.10'
      expect(parseInputValue(input)).toBe(Number(input.value))
    })
  })

  describe('with text input', () => {
    it('should return a string', () => {
      const input = document.createElement('input')
      input.type = 'text'
      input.value = '100'
      const result = parseInputValue(input)
      expect(result).toBe(input.value)
      expect(typeof result).toBe('string')
    })
  })

  describe('with empty number input', () => {
    it('should return an empty string', () => {
      const input = document.createElement('input')
      input.type = 'number'
      input.value = ''
      expect(parseInputValue(input)).toBe('')
    })
  })

  describe('with select', () => {
    it('should return a string', () => {
      const select = document.createElement('select')
      select.value = '100'
      const result = parseInputValue(select)
      expect(result).toBe(select.value)
      expect(typeof result).toBe('string')
    })
  })

  describe('with textarea', () => {
    it('should return a string', () => {
      const textarea = document.createElement('textarea')
      textarea.value = '100'
      const result = parseInputValue(textarea)
      expect(result).toBe(textarea.value)
      expect(typeof result).toBe('string')
    })
  })
})

describe('randomKey()', () => {
  it('should return a random string', () => {
    const result = randomKey()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
