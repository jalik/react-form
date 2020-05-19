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

import deepExtend from '@jalik/deep-extend';

/**
 * Returns the copy of an object built from the path with the assigned value.
 * @param {string} path
 * @param {*} value
 * @param {Object} context
 * @param {boolean} syntaxChecked
 * @return {*}
 */
export function build(path, value, context, syntaxChecked = false) {
  if (typeof path !== 'string') {
    throw new Error('path must be a string');
  }
  // Return value when resolve has reach the deepest level in context path.
  // ex: "object.array[0]" => "array[0]" => "[0]" => ""
  if (path === '') {
    return value;
  }
  const bracketIndex = path.indexOf('[');
  const bracketEnd = path.indexOf(']');
  const dotIndex = path.indexOf('.');

  // Do not check syntax errors if already done.
  if (!syntaxChecked) {
    // Check for extra space.
    if (path.indexOf(' ') !== -1) {
      throw new SyntaxError(`path "${path}" is not valid`);
    }
    // Check if key is not defined (ex: []).
    if (path.indexOf('[]') !== -1) {
      throw new SyntaxError(`missing array index or object attribute in "${path}"`);
    }
    // Check for missing object attribute.
    if (dotIndex + 1 === path.length) {
      throw new SyntaxError(`missing object attribute in "${path}"`);
    }

    const closingBrackets = path.split(']').length;
    const openingBrackets = path.split('[').length;

    // Check for missing opening bracket.
    if (openingBrackets < closingBrackets) {
      throw new SyntaxError(`missing opening bracket "[" in "${path}"`);
    }
    // Check for missing closing bracket.
    if (closingBrackets < openingBrackets) {
      throw new SyntaxError(`missing closing bracket "]" in "${path}"`);
    }
  }

  let ctx = context;

  // Use a copy of the object to not mutate the original.
  if (context instanceof Array) {
    ctx = [...context];
  } else if (typeof context === 'object' && context !== null) {
    ctx = { ...context };
  }

  if (dotIndex !== -1 && (bracketIndex === -1 || dotIndex < bracketIndex)) {
    // Resolve dot "." path.
    // ex: "object.field" => field: "object", subPath: "field"
    const field = path.substr(0, dotIndex);

    // Create object if it does not exist.
    if (typeof ctx === 'undefined') {
      ctx = { [field]: {} };
    } else if (typeof ctx[field] === 'undefined') {
      ctx[field] = {};
    }
    ctx[field] = build(path.substr(dotIndex + 1), value, ctx[field]);
  } else if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
    // Resolve brackets "[..]" path.
    // ex: "[0].field" => field: "[0]", subPath: "field"
    // ex: "[a].field" => field: "[a]", subPath: "field"
    if (bracketIndex === 0) {
      // Extract key.
      let key = path.substring(bracketIndex + 1, bracketEnd);

      // Parse key value if it's a number.
      if (/^[0-9]+$/.test(key)) {
        key = parseInt(key, 10);

        // Create array if it does not exist.
        if (typeof ctx === 'undefined' || ctx === null) {
          ctx = [];
        }
      } else if (typeof ctx === 'undefined' || ctx === null) {
        ctx = {};
      }
      // Resolve "field" instead of ".field" if array is followed by a dot.
      let subPath;

      if (path.substr(bracketEnd + 1, 1) === '.') {
        subPath = path.substr(bracketEnd + 2);

        // Create object if it does not exist.
        if (typeof ctx[key] === 'undefined') {
          ctx[key] = {};
        }
      } else {
        subPath = path.substr(bracketEnd + 1);
      }
      ctx[key] = build(subPath, value, ctx[key]);
    } else {
      // ex: "array[0].field" => field: "array", subPath: "[0].field"
      const field = path.substr(0, bracketIndex);
      ctx[field] = build(path.substr(bracketIndex), value, ctx[field]);
    }
  } else {
    // Set root attribute.
    // ex: "field"
    ctx[path] = value;
  }
  return ctx;
}

/**
 * Returns a deeply cloned opbject.
 * @param {Object} object
 * @return {Object}
 */
export function clone(object) {
  return deepExtend({}, object);
}

/**
 * Returns selected values of a multiple select.
 * @param {HTMLSelectElement} select
 * @return {[]}
 */
export function getSelectedValues(select) {
  const values = [];

  for (let i = 0; i < select.options.length; i += 1) {
    if (select.options[i].selected) {
      values.push(select.options[i].value);
    }
  }
  return values;
}

/**
 * Returns an empty string when value is null.
 * @param {*} value
 * @return {string}
 */
export function inputValue(value) {
  return value !== null && typeof value !== 'undefined' ? value : '';
}

/**
 * Checks if the element is handling an array value.
 * @param {RadioNodeList} element
 * @return {boolean}
 */
export function isElementWithArrayValue(element) {
  if (element instanceof RadioNodeList && element.length > 1) {
    for (let i = 0; i < element.length; i += 1) {
      if (element[i].type !== 'checkbox' && !element[i].multiple) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Returns true if value is "true", "yes", "1" or "y",
 * false if not truthy or null for anything else.
 * @param {string|*} text
 * @return {boolean|null}
 */
export function parseBoolean(text) {
  return typeof text === 'string' && text.length > 0 ? /^[1y]|true|yes$/i.test(text) : null;
}

/**
 * Returns the parsed value of a field based on its type.
 * @param {Element} input
 * @return {number|string|*}
 */
export function parseInputValue(input) {
  const { type, value } = input;

  if (typeof value === 'string' && value.length > 0) {
    if (type === 'number' || type === 'range') {
      return parseFloat(value);
    }
  }
  return value;
}

/**
 * Returns the string if not empty, otherwise returns null.
 * @param {string} text
 * @return {string|null}
 */
export function parseString(text) {
  return typeof text === 'string' && text.length > 0 ? text : null;
}

/**
 * Returns a value from a context using a path.
 * @param {string} path
 * @param {object} context
 * @param {boolean} syntaxChecked
 * @return {*}
 * @throws SyntaxError
 */
export function resolve(path, context, syntaxChecked = false) {
  if (typeof path !== 'string') {
    throw new Error('path must be a string');
  }
  // There is nothing to resolve if context is undefined or null.
  if (typeof context === 'undefined' || context === null) {
    return context;
  }
  // Return context when resolve has reach the deepest level in context path.
  // ex: "object.array[0]" => "array[0]" => "[0]" => ""
  if (path === '') {
    return context;
  }

  const bracketIndex = path.indexOf('[');
  const bracketEnd = path.indexOf(']');
  const dotIndex = path.indexOf('.');

  // Do not check syntax errors if already done.
  if (!syntaxChecked) {
    // Check for extra space.
    if (path.indexOf(' ') !== -1) {
      throw new SyntaxError(`path "${path}" is not valid`);
    }
    // Check if key is not defined (ex: []).
    if (path.indexOf('[]') !== -1) {
      throw new SyntaxError(`missing array index or object attribute in "${path}"`);
    }
    // Check for missing object attribute.
    if (dotIndex + 1 === path.length) {
      throw new SyntaxError(`missing object attribute in "${path}"`);
    }

    const closingBrackets = path.split(']').length;
    const openingBrackets = path.split('[').length;

    // Check for missing opening bracket.
    if (openingBrackets < closingBrackets) {
      throw new SyntaxError(`missing opening bracket "[" in "${path}"`);
    }
    // Check for missing closing bracket.
    if (closingBrackets < openingBrackets) {
      throw new SyntaxError(`missing closing bracket "]" in "${path}"`);
    }
  }

  // Resolve dot "." path.
  if (dotIndex !== -1 && (bracketIndex === -1 || dotIndex < bracketIndex)) {
    // ex: "object.field" => field: "object", subPath: "field"
    const field = path.substr(0, dotIndex);
    return resolve(path.substr(dotIndex + 1), context[field], true);
  }

  // Resolve brackets "[..]" path.
  if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
    // ex: "[0].field" => field: "[0]", subPath: "field"
    // ex: "[a].field" => field: "[a]", subPath: "field"
    if (bracketIndex === 0) {
      let key = path.substring(bracketIndex + 1, bracketEnd);

      // Parse key value if it's a number.
      if (/^[0-9]+$/.test(key)) {
        key = parseInt(key, 10);
      }
      // Resolve "field" instead of ".field" if array is followed by a dot.
      const subPath = path.substr(bracketEnd + (
        path.substr(bracketEnd + 1, 1) === '.' ? 2 : 1
      ));
      return resolve(subPath, context[key], true);
    }
    // ex: "array[0].field" => field: "array", subPath: "[0].field"
    const field = path.substr(0, bracketIndex);
    return resolve(path.substr(bracketIndex), context[field], true);
  }

  // Return root attribute.
  // ex: "field"
  return context[path];
}
