/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import deepExtend from '@jalik/deep-extend'
import { FieldElement } from './useForm'

import { PathsAndValues } from './useFormState'

/**
 * Returns the copy of an object built from the path with the assigned value.
 */
export function build<T> (
  path: string,
  value: any,
  context: any,
  syntaxChecked = false
): T {
  // Return value when resolve has reach the deepest level in context path.
  // ex: "object.array[0]" => "array[0]" => "[0]" => ""
  if (path === '') {
    return value
  }
  const bracketIndex = path.indexOf('[')
  const bracketEnd = path.indexOf(']')
  const dotIndex = path.indexOf('.')

  let ctx = context

  // Do not check syntax errors if already done.
  if (!syntaxChecked) {
    // Check for extra space.
    if (path.indexOf(' .') !== -1 || path.indexOf('. ') !== -1) {
      throw new SyntaxError(`path "${path}" is not valid`)
    }
    // Check if key is not defined (ex: []).
    if (path.indexOf('[]') !== -1) {
      throw new SyntaxError(`missing array index or object attribute in "${path}"`)
    }
    // Check for missing object attribute (ex: "attr.").
    if (dotIndex + 1 === path.length) {
      throw new SyntaxError(`missing object attribute in "${path}"`)
    }

    const closingBrackets = path.split(']').length
    const openingBrackets = path.split('[').length

    // Check for missing opening bracket (ex: "users0]").
    if (openingBrackets < closingBrackets) {
      throw new SyntaxError(`missing opening bracket "[" in "${path}"`)
    }
    // Check for missing closing bracket (ex: "users[0").
    if (closingBrackets < openingBrackets) {
      throw new SyntaxError(`missing closing bracket "]" in "${path}"`)
    }

    // Use a copy of the object to not mutate the original.
    // This is done only once in the first call of the recursive function.
    if (typeof context === 'object' && context !== null) {
      ctx = clone(context)
    }
  }

  if (dotIndex !== -1 && (bracketIndex === -1 || dotIndex < bracketIndex)) {
    // Resolve dot "." path.
    // ex: "object.field" => field: "object", subPath: "field"
    const field: string = path.substring(0, dotIndex)

    // Create object if it does not exist.
    if (typeof ctx === 'undefined' || ctx == null) {
      ctx = { [field]: {} }
    } else if (typeof ctx[field] === 'undefined' || ctx[field] == null) {
      ctx[field] = {}
    }
    ctx[field] = build(path.substring(dotIndex + 1), value, ctx[field], true)
  } else if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
    // Resolve brackets "[?]" path.
    // ex: "[0].field" => field: "[0]", subPath: "field"
    // ex: "[a].field" => field: "[a]", subPath: "field"
    if (bracketIndex === 0) {
      // Extract key.
      let key: number | string = path.substring(bracketIndex + 1, bracketEnd)

      // Parse key value if it's a number.
      if (/^[0-9]+$/.test(key)) {
        key = parseInt(key, 10)

        // Create array if it does not exist.
        if (ctx == null) {
          ctx = []
        }
      } else if (ctx == null) {
        ctx = {}
      }
      // Resolve "field" instead of ".field" if array is followed by a dot.
      let subPath

      if (path.substring(bracketEnd + 1, bracketEnd + 2) === '.') {
        subPath = path.substring(bracketEnd + 2)

        // Create object if it does not exist.
        if (ctx[key] == null) {
          ctx[key] = {}
        }
      } else {
        subPath = path.substring(bracketEnd + 1)
      }
      ctx[key] = build(subPath, value, ctx[key], true)
    } else {
      // ex: "array[0].field" => field: "array", subPath: "[0].field"
      const field = path.substring(0, bracketIndex)
      ctx[field] = build(path.substring(bracketIndex), value, ctx[field], true)
    }
  } else if (typeof value === 'undefined') {
    // Remove attribute, instead of using undefined.
    delete ctx[path]
  } else {
    // Set root attribute.
    // ex: "field"
    ctx[path] = value
  }
  return ctx
}

/**
 * Builds an object using paths and values.
 * @param paths
 */
export function reconstruct<T> (paths: PathsAndValues<any>): T | null {
  let result: T | null = null
  const keys = Object.keys(paths)

  for (let i = 0; i < keys.length; i++) {
    const path = keys[i]
    const value = paths[path]
    result = build(path, value, result ?? paths)
  }
  return result
}

/**
 * Returns a deeply cloned object.
 */
export function clone<T> (object: T): T {
  if (object instanceof Array) {
    return deepExtend([], object)
  } else {
    return deepExtend({}, object)
  }
}

/**
 * Returns a flat object.
 * @example { a: { test: 1 }, b: 2 } => { "a.test": 1, b: 2 }
 * @param object
 * @param path
 * @param preserveKeys
 */
export function flatten (object: Record<string, any>, path?: string | null, preserveKeys = false): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const isArray = object instanceof Array
  const keys = Object.keys(object)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = object[key]

    // Add brackets around key if it includes space or dot.
    const currentKey = isArray || ((key.includes(' ') || key.includes('.')) && !preserveKeys)
      ? `[${key}]`
      : key

    // Get current path from parent path and current key.
    const currentPath = path != null
      ? (currentKey.startsWith('[') ? `${path}${currentKey}` : `${path}.${currentKey}`)
      : currentKey

    result[currentPath] = value

    if (value != null && typeof value === 'object') {
      const branches = flatten(value, currentPath)
      const branchesKeys = Object.keys(branches)

      for (let j = 0; j < branchesKeys.length; j++) {
        const k = branchesKeys[j]
        result[k] = branches[k]
      }
    }
  }
  return result
}

/**
 * Returns checked values from an input element.
 */
export function getCheckedValues (element: HTMLInputElement): string[] {
  const values = []
  const { form } = element

  if (form) {
    for (let i = 0; i < form.length; i++) {
      const item = form.elements[i]
      if (item instanceof HTMLInputElement && item.name === element.name && item.checked) {
        values.push(item.value)
      }
    }
  }
  return values
}

/**
 * Returns a field ID using a name and form ID.
 */
export function getFieldId (name: string, formId: string): string {
  return `F${formId}_${name}`.replace(/[^a-zA-Z0-9_-]+/g, '_')
}

/**
 * Returns parsed field value.
 * @param field
 * @param options
 */
export function getFieldValue (field: FieldElement, options?: {
  parser?: (value: string, target?: HTMLElement) => any
}) {
  const { parser } = options || {}
  let value

  // Parses value using a custom parser or using the native parser (smart typing).
  const parsedValue = typeof parser === 'function'
    ? parser(field.value, field)
    : parseInputValue(field)

  const el = field.form?.elements.namedItem(field.name)

  // Handles array value (checkboxes, select-multiple).
  if (el && isMultipleFieldElement(el)) {
    if (field instanceof HTMLInputElement) {
      value = getCheckedValues(field)
    } else if (field instanceof HTMLSelectElement) {
      value = getSelectedValues(field)
    }

    if (value) {
      // Parse all checked/selected values.
      value = value.map((v) => typeof parser === 'function' ? parser(v, field) : v)
    }
  } else if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    if (field.value === '') {
      // Checkbox has no value defined, so we use the checked state instead.
      value = field.checked
    } else if (typeof parsedValue === 'boolean') {
      // Checkbox has a boolean value.
      value = field.checked ? parsedValue : !parsedValue
    } else {
      // Checkbox value other than boolean.
      value = field.checked ? parsedValue : undefined
    }
  } else {
    value = parsedValue
  }
  return value
}

/**
 * Returns the index of an object path.
 * @param key
 */
export function getIndexFromPath (key: string): number | null {
  const match = key.match(/\[(\d+)]$/)

  if (match && match[1] != null) {
    return parseInt(match[1], 10)
  }
  return null
}

/**
 * Returns selected values from a select element.
 */
export function getSelectedValues (element: HTMLSelectElement): string[] {
  const values = []
  const { options } = element

  for (let i = 0; i < options.length; i++) {
    if (options[i].selected) {
      values.push(options[i].value)
    }
  }
  return values
}

/**
 * Checks if an object contains attributes with values different of null and undefined.
 * @param obj
 */
export function hasDefinedValues (obj: Record<string, unknown>): boolean {
  return Object.values(obj)
    .filter((value) => value != null).length > 0
}

/**
 * Checks if an object contains true values.
 * @param obj
 */
export function hasTrueValues (obj: Record<string, boolean>): boolean {
  return Object.values(obj)
    .filter((value) => value).length > 0
}

/**
 * Returns an empty string when value is null.
 */
export function inputValue<T> (value?: T): string | T {
  return value == null ? '' : value
}

export function isMultipleFieldElement (element: unknown): boolean {
  let count = 0
  const inputTypes = ['checkbox', 'file']

  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
    if (element.form && element.name != null) {
      for (let i = 0; i < element.form.elements.length; i++) {
        const elm: any = element.form.elements[i]

        if (elm instanceof HTMLSelectElement &&
          elm.name === element.name &&
          elm.multiple) {
          return true
        }

        if ((elm instanceof HTMLInputElement &&
          elm.name === element.name &&
          elm.type === element.type &&
          inputTypes.includes(elm.type))) {
          count++

          if (count > 1) {
            return true
          }
        }
      }
    }
  } else if (element instanceof RadioNodeList) {
    let name = null
    for (let i = 0; i < element.length; i++) {
      const elm = element[i]

      if (elm instanceof HTMLInputElement && inputTypes.includes(elm.type)) {
        if (!name) {
          name = elm.name
        }
        if (elm.name === name) {
          count++

          if (count > 1) {
            return true
          }
        }
      }
    }
  }
  return false
}

/**
 * Returns the parsed value of a field based on its type.
 */
export function parseInputValue (input: HTMLElement): string | number | undefined {
  if (input instanceof HTMLInputElement) {
    const {
      type,
      value
    } = input

    if (value != null && value.length > 0) {
      if (type === 'number' || type === 'range') {
        const num = parseFloat(value)

        if (!Number.isNaN(num)) {
          return num
        }
      }
    }
    return value
  } else if (input instanceof HTMLSelectElement) {
    const { value } = input
    return value
  } else if (input instanceof HTMLTextAreaElement) {
    const { value } = input
    return value
  }
}

/**
 * Generates a random key.
 */
export function randomKey (length = 16): string {
  const dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    const index = Math.random() * (dict.length - 1)
    out += dict.substring(index, index + 1)
  }
  return out
}

/**
 * Returns a value from a context using a path.
 */
export function resolve<T> (
  path: string,
  context?: any,
  syntaxChecked = false
): T | undefined {
  // There is nothing to resolve if context is undefined or null.
  if (context == null) {
    return context
  }
  // Return context when resolve has reach the deepest level in context path.
  // ex: "object.array[0]" => "array[0]" => "[0]" => ""
  if (path === '') {
    return context
  }

  const bracketIndex = path.indexOf('[')
  const bracketEnd = path.indexOf(']')
  const dotIndex = path.indexOf('.')

  // Do not check syntax errors if already done.
  if (!syntaxChecked) {
    // Check for extra space.
    if (path.indexOf('. ') !== -1 || path.indexOf(' .') !== -1) {
      throw new SyntaxError(`path "${path}" is not valid`)
    }
    // Check if key is not defined (ex: []).
    if (path.indexOf('[]') !== -1) {
      throw new SyntaxError(`missing array index or object attribute in "${path}"`)
    }
    // Check for missing object attribute.
    if (dotIndex + 1 === path.length) {
      throw new SyntaxError(`missing object attribute in "${path}"`)
    }

    const closingBrackets = path.split(']').length
    const openingBrackets = path.split('[').length

    // Check for missing opening bracket.
    if (openingBrackets < closingBrackets) {
      throw new SyntaxError(`missing opening bracket "[" in "${path}"`)
    }
    // Check for missing closing bracket.
    if (closingBrackets < openingBrackets) {
      throw new SyntaxError(`missing closing bracket "]" in "${path}"`)
    }
  }

  // Resolve dot "." path.
  if (dotIndex !== -1 && (bracketIndex === -1 || dotIndex < bracketIndex)) {
    if (typeof context !== 'object' || (context instanceof Array)) {
      throw new SyntaxError(`path ${path} is not valid for the given context`)
    }
    // ex: "object.field" => field: "object", path: "field"
    const field = path.substring(0, dotIndex)

    // Check for extra space.
    if (field.indexOf(' ') !== -1) {
      throw new SyntaxError(`path "${path}" is not valid`)
    }
    return resolve(path.substring(dotIndex + 1), context[field], true)
  }

  // Resolve brackets "[..]" path.
  if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
    // ex: "[0].field" => field: "[0]", subPath: "field"
    // ex: "[a].field" => field: "[a]", subPath: "field"
    if (bracketIndex === 0) {
      let key: number | string = path.substring(bracketIndex + 1, bracketEnd)

      // Parse key value if it's a number.
      if (/^[0-9]+$/.test(key)) {
        key = parseInt(key, 10)
      }
      // Resolve "field" instead of ".field" if array is followed by a dot.
      const subPath = path.substring(bracketEnd + (
        path.substring(bracketEnd + 1, bracketEnd + 2) === '.' ? 2 : 1
      ))
      return resolve(subPath, context[key], true)
    }
    // ex: "array[0].field" => field: "array", subPath: "[0].field"
    const field = path.substring(0, bracketIndex)
    if (field.indexOf(' ') !== -1) {
      throw new SyntaxError(`path "${path}" is not valid`)
    }
    return resolve(path.substring(bracketIndex), context[field], true)
  }

  // Return root attribute.
  // ex: "field"
  return context[path]
}

/**
 * Moves path value in a record.
 * @param record
 * @param path
 * @param fromIndex
 * @param toIndex
 */
export function movePathIndices<T extends Record<string, unknown>> (record: T, path: string, fromIndex: number, toIndex: number): T {
  const minIndex = Math.min(fromIndex, toIndex)
  const maxIndex = Math.max(fromIndex, toIndex)
  const result: Record<string, unknown> = {}
  const keys = Object.keys(record)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    result[key] = record[key]

    if (key.startsWith(`${path}[`)) {
      const pathIndex = getIndexFromPath(key)

      if (pathIndex != null && pathIndex >= minIndex && pathIndex < maxIndex) {
        result[`${path}[${pathIndex + 1}]`] = record[key]
      }
    }
  }
  const fromValue = record[`${path}[${fromIndex}]`]
  const toValue = record[`${path}[${toIndex}]`]
  result[`${path}[${toIndex}]`] = fromValue
  result[`${path}[${fromIndex}]`] = toValue
  return result as T
}

/**
 * Swaps two list values in a record.
 * @param record
 * @param path
 * @param fromIndex
 * @param toIndex
 */
export function swapPathIndices<T extends Record<string, unknown>> (record: T, path: string, fromIndex: number, toIndex: number): T {
  const fromValue = record[`${path}[${fromIndex}]`]
  const toValue = record[`${path}[${toIndex}]`]
  return {
    ...record,
    [`${path}[${fromIndex}]`]: toValue,
    [`${path}[${toIndex}]`]: fromValue
  }
}

/**
 * Updates indices in paths of a record.
 * @param record
 * @param path
 * @param index
 * @param change
 */
export function updatePathIndices<T extends Record<string, unknown>> (
  record: T,
  path: string,
  index: number,
  change: number
): T {
  const result: Record<string, unknown> = {}
  const keys = Object.keys(record)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    result[key] = record[key]

    if (key.startsWith(`${path}[`)) {
      const pathIndex = getIndexFromPath(key)

      if (pathIndex != null && pathIndex >= index) {
        result[`${path}[${pathIndex + change}]`] = record[key]

        // Delete the first index when inserting items
        // or the last index when removing items.
        if ((change > 0 && pathIndex === index) ||
          (change < 0 && pathIndex === index + 1)) {
          delete result[key]
        }
      }
    }
  }
  return result as T
}
