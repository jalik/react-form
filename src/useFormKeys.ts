/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { Dispatch, SetStateAction, useCallback, useState } from 'react'

export type FormKeys = Record<string, number>

export type UseFormKeysOptions = {
  /**
   * The form key.
   */
  formKey: string;
}

export type UseFormKeysHook = {
  /**
   * Returns the key of a path.
   * @param path
   */
  getKey (path: string): string;
  /**
   * Replaces the key of a path.
   * @param paths
   */
  replaceKeys (paths: string[]): void;
  /**
   * Replaces all keys from values.
   * @param values
   */
  replaceKeysFromValues (values: Record<string, unknown>): void;
  /**
   * Sets all keys.
   */
  setKeys: Dispatch<SetStateAction<FormKeys>>;
}

function useFormKeys (options: UseFormKeysOptions): UseFormKeysHook {
  const { formKey } = options

  const [keys, setKeys] = useState<FormKeys>({})

  const getKey = useCallback<UseFormKeysHook['getKey']>((path) => {
    return `${formKey}-${path}-${keys[path] ?? 0}`
  }, [formKey, keys])

  const replaceKeys = useCallback<UseFormKeysHook['replaceKeys']>((paths) => {
    setKeys((s) => {
      const result: FormKeys = {}
      paths.forEach((path) => {
        result[path] = (s[path] ?? 0) + 1
      })
      return result
    })
  }, [])

  const replaceKeysFromValues = useCallback<UseFormKeysHook['replaceKeysFromValues']>((values) => {
    replaceKeys(Object.keys(values))
  }, [replaceKeys])

  return {
    getKey,
    replaceKeys,
    replaceKeysFromValues,
    setKeys
  }
}

export default useFormKeys
