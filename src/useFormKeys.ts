/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import { UseFormHook } from './useForm'
import { FormState, Values } from './useFormReducer'

export type FormKeys = Record<string, number>

export type UseFormKeysOptions<V extends Values, E, R> = {
  formKey: string;
  state: FormState<V, E, R>;
}

export type UseFormKeysHook = {
  changeKey (path: string): void;
  getKey (path: string): string;
  setKeys: Dispatch<SetStateAction<FormKeys>>;
}

function useFormKeys<V extends Values, E, R> (options: UseFormKeysOptions<V, E, R>): UseFormKeysHook {
  const { formKey } = options

  const keysRef = useRef<Record<string, string>>({})
  const [keys, setKeys] = useState<FormKeys>({})

  const getKey = useCallback<UseFormHook<V, E, R>['key']>((path: string): string => {
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
