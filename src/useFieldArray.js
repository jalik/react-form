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

import {
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { v4 as uuid } from 'uuid';
import useFormContext from './useFormContext';

/**
 * Returns an array item with key and value.
 * @param {*} value
 * @return {{value: *, key: string}}
 */
function createItem(value) {
  return { key: uuid(), value };
}

/**
 * Returns fields synchronized with original array.
 * @param {[]} array
 * @param {[]} fields
 * @return {[]}
 */
function synchronizeItems(array, fields) {
  // Removes extra items.
  const newArray = fields.slice(0, array.length);

  array.forEach((value, index) => {
    if (typeof fields[index] === 'undefined') {
      // Adds missing items.
      newArray[index] = createItem(value);
    } else {
      // Update existing items.
      newArray[index].value = value;
    }
  });
  return newArray;
}

/**
 * Returns utils to manage an array of fields.
 * @param {*} context
 * @param {*} defaultValue
 * @param {string} name
 * @return {{
 *   append: function,
 *   fields: Object,
 *   handleAppend: function,
 *   handlePrepend: function,
 *   handleRemove: function,
 *   insert: function,
 *   move: function,
 *   prepend: function,
 *   remove: function
 * }}
 */
function useFieldArray({ context, defaultValue, name }) {
  const form = useFormContext();
  const { getValue, setValue } = context || form;
  const fields = useRef([]);

  /**
   * The original array.
   * @type {[]}
   */
  const array = useMemo(() => {
    const value = getValue(name, []);
    fields.current = synchronizeItems(value, fields.current);
    return value;
  }, [getValue, name]);

  /**
   * Adds a value at the end of the array.
   * @param {*} value
   */
  const append = useCallback((...value) => {
    // Update virtual array.
    fields.current.push(...value.map(createItem));

    // Update original array.
    array.push(...value);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Inserts a value at a given index.
   * @param {number} index
   * @param {*} value
   */
  const insert = useCallback((index, ...value) => {
    // Update virtual array.
    fields.current.splice(index, 0, ...value.map(createItem));

    // Update original array.
    array.splice(index, 0, ...value);
    setValue(name, array);
  }, [array, name, setValue]);

  // todo add swap(fromIndex, toIndex)

  /**
   * Moves a value from an index to another index.
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  const move = useCallback((fromIndex, toIndex) => {
    const index = Math.min(Math.max(toIndex, 0), array.length);

    // Update virtual array.
    const [item] = fields.current.splice(fromIndex, 1);
    fields.current.splice(index, 0, item);

    // Update original array.
    const [element] = array.splice(fromIndex, 1);
    array.splice(index, 0, element);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Adds a value at beginning of the array.
   * @param {*} value
   */
  const prepend = useCallback((...value) => {
    // Update virtual array.
    fields.current.unshift(...value.map(createItem));

    // Update original array.
    array.unshift(...value);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Removes a value from the array by its index.
   * @param {string} index
   */
  const remove = useCallback((index) => {
    // Update virtual array.
    fields.current.splice(index, 1);

    // Update original array.
    array.splice(index, 1);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Handles event that appends a value.
   * @param {Event} event
   */
  const handleAppend = useCallback((event) => {
    event.preventDefault();
    append(typeof defaultValue === 'function' ? defaultValue() : defaultValue);
  }, [append, defaultValue]);

  /**
   * Handles event that prepends a value.
   * @param {Event} event
   */
  const handlePrepend = useCallback((event) => {
    event.preventDefault();
    prepend(typeof defaultValue === 'function' ? defaultValue() : defaultValue);
  }, [prepend, defaultValue]);

  /**
   * Handles event that removes a value at a given index.
   * @param {number} index
   * @return {function}
   */
  const handleRemove = useCallback((index) => ((event) => {
    event.preventDefault();
    remove(index);
  }), [remove]);

  return {
    append,
    fields: fields.current,
    handleAppend,
    handlePrepend,
    handleRemove,
    insert,
    move,
    prepend,
    remove,
  };
}

export default useFieldArray;
