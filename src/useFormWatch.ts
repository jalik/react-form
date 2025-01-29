/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { Observer } from '@jalik/observer'
import { Values } from './useFormReducer'
import { FieldKey } from './useForm'

export type FieldStatus<T = unknown> = {
  /**
   * Tells if the field was modified.
   */
  modified: boolean;
  /**
   * The field name.
   */
  name: string;
  /**
   * The previous field value.
   */
  previousValue: T | null | undefined;
  /**
   * Tells if the field was touched.
   */
  touched: boolean;
  /**
   * The current field value.
   */
  value: T | null | undefined;
}

export type UseFormWatchHook<V extends Values> = {
  /**
   * Notifies all watchers that a field changed.
   * @param path
   * @param status
   */
  notifyWatchers<T> (path: FieldKey<V>, status: FieldStatus<T>): void;
  /**
   * Adds a watcher that is notified when the field changed.
   * @param path
   * @param callback
   */
  watch<T = unknown> (path: FieldKey<V>, callback: (status: FieldStatus<T>) => void): void;
  /**
   * Registered watchers.
   */
  watchers: MutableRefObject<Observer<any, string>>;
}

export function inputChangeEvent (name: string): string {
  return `input(${name}):change`
}

function useFormWatch<V extends Values> (): UseFormWatchHook<V> {
  const watchers = useRef(new Observer())

  const notifyWatchers = useCallback<UseFormWatchHook<V>['notifyWatchers']>((path, status: FieldStatus) => {
    watchers.current.emit(inputChangeEvent(path), status)
  }, [])

  const watch = useCallback<UseFormWatchHook<V>['watch']>((path, callback) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const id = inputChangeEvent(path)
      watchers.current.on(id, callback)
      return () => {
        watchers.current.off(id, callback)
      }
    }, [callback, path])
  }, [watchers])

  useEffect(() => {
    const ref = watchers.current
    return () => {
      ref.events.clear()
    }
  }, [])

  return {
    notifyWatchers,
    watch,
    watchers
  }
}

export default useFormWatch
