/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { Context, createContext, useContext } from 'react'
import { UseFormHook } from './useForm'
import { Values } from './useFormState'

/**
 * The default form context.
 */
export const FormContext = createContext<unknown>(undefined)

/**
 * Returns the form context.
 */
function useFormContext<V extends Values = Values, E = Error, R = unknown> (): UseFormHook<V, E, R> {
  return useContext<UseFormHook<V, E, R>>(FormContext as unknown as Context<UseFormHook<V, E, R>>)
  // if (context == null) {
  //   throw new Error('useFormContext must be used within a Form component')
  // }
  // return context
}

export default useFormContext
