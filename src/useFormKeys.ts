/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { useCallback, useState } from 'react'
import { FieldPath, Values } from './useFormState'

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
  getKey (path: FieldPath<V>): string;
  /**
   * Replaces the key of a path.
   * @param paths
   */
  replaceKeys (paths?: FieldPath<V>[]): void;
}

function useFormKeys<V extends Values> (options: UseFormKeysOptions): UseFormKeysHook<V> {
  const { formKey } = options

  const [version, setVersion] = useState<number>(0)

  const getKey = useCallback<UseFormKeysHook<V>['getKey']>((path) => {
    return `${formKey}-${path}-v${version}`
  }, [formKey, version])

  const replaceKeys = useCallback<UseFormKeysHook<V>['replaceKeys']>(() => {
    setVersion((s) => s + 1)
  }, [])

  return {
    getKey,
    replaceKeys
  }
}

export default useFormKeys
