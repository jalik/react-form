/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { createContext, useContext } from 'react';
import { Fields, UseFormHook } from './useForm';

/**
 * The default form context.
 */
export const FormContext = createContext<any>(undefined);

/**
 * Returns the form context.
 */
function useFormContext<T extends Fields, R>(): UseFormHook<T, R> {
  return useContext<UseFormHook<T, R>>(FormContext);
}

export default useFormContext;
