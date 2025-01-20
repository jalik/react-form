/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useCallback, useRef } from 'react'
import { Observer } from '@jalik/observer'
import { FormState, Values } from './useFormReducer'
import { FieldKey } from './useForm'

export type FieldStatus<T = unknown> = {
  modified: boolean;
  name: string;
  previousValue: T | null;
  touched: boolean;
  value: T | null;
}

export type UseFormWatchOptions<V extends Values, E, R> = {
  state: FormState<V, E, R>;
}

export type UseFormWatchHook<V extends Values, E, R> = {
  notifyWatchers<T> (path: string, status: FieldStatus<T>): void;
  observers: MutableRefObject<Observer<FormState<V, E, R>, string>>;
  watch<T = unknown> (name: FieldKey<V>, callback: (status: FieldStatus<T>) => void | (() => void)): void;
}

export function inputChangeEvent (name: string): string {
  return `input(${name}):change`
}

function useFormWatch<V extends Values, E = Error, R = any> (options: UseFormWatchOptions<V, E, R>): UseFormWatchHook<V, E, R> {
  const observers = useRef(new Observer(options.state))

  const notifyWatchers = useCallback<UseFormWatchHook<V, E, R>['notifyWatchers']>((path, status: FieldStatus) => {
    observers.current.emit(inputChangeEvent(path), status)
  }, [])

  const watch = useCallback<UseFormWatchHook<V, E, R>['watch']>((name, callback) => {
    observers.current.on(inputChangeEvent(name), callback)
    return () => {
      observers.current.off(inputChangeEvent(name), callback)
    }
  }, [observers])

  return {
    notifyWatchers,
    observers,
    watch
  }
}

export default useFormWatch
