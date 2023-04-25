/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React from 'react';
import { Fields, UseFormHook } from '../useForm';
import { FormContext } from '../useFormContext';

export interface FormProps<T extends Fields, R> {
  context: UseFormHook<T, R>;
}

function Form<T extends Fields, R>(props: FormProps<T, R> & React.FormHTMLAttributes<HTMLFormElement>): JSX.Element {
  const {
    children,
    context,
    ...others
  } = props;

  const { handleReset, handleSubmit } = context;

  return (
    <FormContext.Provider value={context}>
      <form
        method="post"
        {...others}
        onReset={handleReset}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export default Form;
