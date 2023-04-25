/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { createContext, useContext } from 'react';
import { UseFormHook, Values } from './useForm';

/**
 * The default form context.
 */
export const FormContext = createContext<any>(undefined);

/**
 * Returns the form context.
 */
function useFormContext<V extends Values, R>(): UseFormHook<V, R> {
  return useContext<UseFormHook<V, R>>(FormContext);
}

export default useFormContext;
