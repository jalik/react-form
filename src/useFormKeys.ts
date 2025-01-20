/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import { FormState, Values } from './useFormReducer'

export type FormKeys = Record<string, number>

export type UseFormKeysOptions<V extends Values, E, R> = {
  /**
   * The form key.
   */
  formKey: string;
  /**
   * The form status.
   */
  state: FormState<V, E, R>; // todo remove
}

export type UseFormKeysHook = {
  /**
   * Changes the key of a path.
   * @param path
   */
  changeKey (path: string): void;
  /**
   * Returns the key of a path.
   * @param path
   */
  getKey (path: string): string;
  /**
   * Sets all keys.
   */
  setKeys: Dispatch<SetStateAction<FormKeys>>;
}

function useFormKeys<V extends Values, E, R> (options: UseFormKeysOptions<V, E, R>): UseFormKeysHook {
  const { formKey } = options

  const keysRef = useRef<Record<string, string>>({})
  const [keys, setKeys] = useState<FormKeys>({})

  const getKey = useCallback<UseFormKeysHook['getKey']>((path) => {
    if (keysRef.current[path] == null) {
      keysRef.current[path] = `${formKey}-${path}-${keys[path]}`
    }
    return keysRef.current[path]
  }, [formKey, keys])

  const changeKey = useCallback<UseFormKeysHook['changeKey']>((path) => {
    setKeys((s) => ({
      ...s,
      [path]: (s[path] ?? 0) + 1
    }))
  }, [])

  return {
    changeKey,
    getKey,
    setKeys
  }
}

export default useFormKeys
