/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { flatten } from './utils'
import { PathsOrValues } from './useFormValues'
import { Values } from './useFormReducer'
import { FieldKey } from './useForm'

export type FormKeys<V extends Values> = Record<FieldKey<V>, number>

export type UseFormKeysOptions = {
  /**
   * The form key.
   */
  formKey: string;
}

export type UseFormKeysHook<V extends Values> = {
  /**
   * Returns the key of a path.
   * @param path
   */
  getKey (path: FieldKey<V>): string;
  /**
   * Replaces the key of a path.
   * @param paths
   */
  replaceKeys (paths: FieldKey<V>[]): void;
  /**
   * Replaces all keys from values.
   * @param values
   */
  replaceKeysFromValues (values: PathsOrValues<Values>): void;
  /**
   * Sets all keys.
   */
  setKeys: Dispatch<SetStateAction<FormKeys<V>>>;
}

function useFormKeys<V extends Values> (options: UseFormKeysOptions): UseFormKeysHook<V> {
  const { formKey } = options

  const [keys, setKeys] = useState<FormKeys<V>>({} as FormKeys<V>)

  const getKey = useCallback<UseFormKeysHook<V>['getKey']>((path) => {
    return `${formKey}-${path}-v${keys[path] ?? 0}`
  }, [formKey, keys])

  const replaceKeys = useCallback<UseFormKeysHook<V>['replaceKeys']>((paths) => {
    setKeys((s) => {
      const result = { ...s }

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        result[path] = (s[path] ?? 0) + 1
      }
      return result
    })
  }, [])

  const replaceKeysFromValues = useCallback<UseFormKeysHook<V>['replaceKeysFromValues']>((values) => {
    replaceKeys(Object.keys(flatten(values)))
  }, [replaceKeys])

  return {
    getKey,
    replaceKeys,
    replaceKeysFromValues,
    setKeys
  }
}

export default useFormKeys
