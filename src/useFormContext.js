/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
 */

import {
  createContext,
  useContext,
} from 'react';

/**
 * The default form context.
 * @type {React.Context}
 */
export const FormContext = createContext({});

/**
 * Returns the form context.
 * @return {*}
 */
function useFormContext() {
  return useContext(FormContext);
}

export default useFormContext;
