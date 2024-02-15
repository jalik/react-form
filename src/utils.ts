/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import deepExtend from '@jalik/deep-extend'
import { FieldElement } from './useForm'

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
  }

  let ctx = context

  // Use a copy of the object to not mutate the original.
  if (context instanceof Array) {
    ctx = [...context]
  } else if (typeof context === 'object' && context !== null) {
    ctx = { ...context }
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
    ctx[field] = build(path.substring(dotIndex + 1), value, ctx[field])
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
      ctx[key] = build(subPath, value, ctx[key])
    } else {
      // ex: "array[0].field" => field: "array", subPath: "[0].field"
      const field = path.substring(0, bracketIndex)
      ctx[field] = build(path.substring(bracketIndex), value, ctx[field])
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
 * Returns a deeply cloned object.
 */
export function clone<T> (object: T): T {
  return deepExtend({}, object)
}

/**
 * Returns a flat object.
 * @example { a: { test: 1 }, b: 2 } => { "a.test": 1, b: 2 }
 * @param object
 * @param isRoot
 */
export function flatten (object: Record<string, any>, isRoot = true): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  Object.entries(object).forEach(([key, value]) => {
    if (!isRoot && (key.indexOf(' ') !== -1 || key.indexOf('.') !== -1)) {
      result[`[${key}]`] = value
    } else {
      result[key] = value
    }
    if (value != null && typeof value === 'object' && !(value instanceof Array)) {
      const branches = flatten(value, false)
      Object.entries(branches).forEach(([k, v]) => {
        if (!isRoot && (key.indexOf(' ') !== -1 || key.indexOf('.') !== -1)) {
          result[`[${key}].${k}`] = v
        } else if (k.indexOf('[') === 0) {
          result[`${key}${k}`] = v
        } else {
          result[`${key}.${k}`] = v
        }
      })
    }
  })
  return result
}

/**
 * Returns checked values from an input element.
 */
export function getCheckedValues (element: HTMLInputElement): string[] {
  const values = []
  const { form } = element

  if (form) {
    for (let i = 0; i < form.length; i += 1) {
      const item = form.elements[i]
      if (item instanceof HTMLInputElement && item.name === element.name && item.checked) {
        values.push(item.value)
      }
    }
  }
  return values
}

/**
 * Returns the field ID using name and value.
 */
export function getFieldId (name: string, value: unknown): string {
  return `field_${name}_${String(value)}`.replace(/[^a-zA-Z0-9_-]+/g, '_')
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
 * Returns selected values from a select element.
 */
export function getSelectedValues (element: HTMLSelectElement): string[] {
  const values = []
  const { options } = element

  for (let i = 0; i < options.length; i += 1) {
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
 * Returns an empty string when value is null.
 */
export function inputValue<T> (value?: T): string | T {
  return value == null ? '' : value
}

export function isMultipleFieldElement (element: RadioNodeList | Element): boolean {
  let count = 0
  const inputTypes = ['checkbox', 'file']

  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
    if (element.form && element.name != null) {
      for (let i = 0; i < element.form.elements.length; i += 1) {
        const elm = element.form.elements[i]

        if (elm instanceof HTMLSelectElement &&
          elm.name === element.name &&
          elm.multiple) {
          return true
        }

        if ((elm instanceof HTMLInputElement &&
          elm.name === element.name &&
          elm.type === element.type &&
          inputTypes.includes(elm.type))) {
          count += 1

          if (count > 1) {
            return true
          }
        }
      }
    }
  } else if (element instanceof RadioNodeList) {
    let name = null
    for (let i = 0; i < element.length; i += 1) {
      const elm = element[i]

      if (elm instanceof HTMLInputElement && inputTypes.includes(elm.type)) {
        if (!name) {
          name = elm.name
        }
        if (elm.name === name) {
          count += 1

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
 * Pass arguments to function when it is called.
 * @param func
 * @param args
 */
export function passArgs<T> (func: (event: T, ...args: unknown[]) => void, ...args: unknown[]) {
  return (event: T): void => {
    func(event, ...args)
  }
}

/**
 * Generates a random key.
 */
export function randomKey (length = 16): string {
  const dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
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
