/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { createContext, useContext } from 'react'
import { UseFormHook } from './useForm'
import { Values } from './useFormReducer'

/**
 * The default form context.
 */
export const FormContext = createContext<any>(undefined)

/**
 * Returns the form context.
 */
function useFormContext<V extends Values = Values, E = Error, R = any> (): UseFormHook<V, E, R> {
  return useContext<UseFormHook<V, E, R>>(FormContext)
}

export default useFormContext
