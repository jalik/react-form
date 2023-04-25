/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { UseFormHook, Values } from './useForm';
import useFormContext from './useFormContext';
import { uuid } from './utils';


export interface ArrayItem<T> {
  key: string | number;
  value: T;
}

/**
 * Returns an array item with key and value.
 */
function createItem<T>(value: T): ArrayItem<T> {
  return { key: uuid(), value };
}

/**
 * Returns fields synchronized with original array.
 */
function synchronizeItems<T>(array: T[], fields: ArrayItem<T>[]): ArrayItem<T>[] {
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


export interface UseFieldArrayOptions<T, F extends Values> {
  context: UseFormHook<F, unknown>,
  defaultValue: T,
  name: string
}

/**
 * Returns utils to manage an array of fields.
 */
function useFieldArray<T, F extends Values>(options: UseFieldArrayOptions<T, F>) {
  const { context, defaultValue, name } = options;
  const form = useFormContext();
  const { getValue, setValue } = context || form;
  const fields = useRef<ArrayItem<T>[]>([]);

  /**
   * The original array.
   */
  const array = useMemo(() => {
    const value = getValue<T[]>(name, []);
    fields.current = synchronizeItems(value, fields.current);
    return value;
  }, [getValue, name]);

  /**
   * Adds a value at the end of the array.
   */
  const append = useCallback((...value: T[]): void => {
    // Update virtual array.
    fields.current.push(...value.map(createItem));

    // Update original array.
    array.push(...value);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Inserts a value at a given index.
   */
  const insert = useCallback((index: number, ...value: T[]): void => {
    // Update virtual array.
    fields.current.splice(index, 0, ...value.map(createItem));

    // Update original array.
    array.splice(index, 0, ...value);
    setValue(name, array);
  }, [array, name, setValue]);

  // todo add swap(fromIndex, toIndex)

  /**
   * Moves a value from an index to another index.
   */
  const move = useCallback((fromIndex: number, toIndex: number): void => {
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
   */
  const prepend = useCallback((...value: T[]): void => {
    // Update virtual array.
    fields.current.unshift(...value.map(createItem));

    // Update original array.
    array.unshift(...value);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Removes a value from the array by its index.
   */
  const remove = useCallback((index: number): void => {
    // Update virtual array.
    fields.current.splice(index, 1);

    // Update original array.
    array.splice(index, 1);
    setValue(name, array);
  }, [array, name, setValue]);

  /**
   * Handles event that appends a value.
   */
  const handleAppend = useCallback((event: React.SyntheticEvent): void => {
    event.preventDefault();
    append(typeof defaultValue === 'function' ? defaultValue() : defaultValue);
  }, [append, defaultValue]);

  /**
   * Handles event that prepends a value.
   */
  const handlePrepend = useCallback((event: React.SyntheticEvent): void => {
    event.preventDefault();
    prepend(typeof defaultValue === 'function' ? defaultValue() : defaultValue);
  }, [prepend, defaultValue]);

  /**
   * Handles event that removes a value at a given index.
   */
  const handleRemove = useCallback((index: number) => ((event: React.SyntheticEvent): void => {
    event.preventDefault();
    remove(index);
  }), [remove]);

  return useMemo(() => ({
    append,
    fields: fields.current,
    handleAppend,
    handlePrepend,
    handleRemove,
    insert,
    move,
    prepend,
    remove,
  }), [append, handleAppend, handlePrepend, handleRemove, insert, move, prepend, remove]);
}

export default useFieldArray;
