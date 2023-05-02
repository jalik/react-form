/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React from 'react'
import { UseFormHook } from '../useForm'
import { FormContext } from '../useFormContext'
import { Values } from '../useFormReducer'

export interface FormProps<V extends Values, R> {
  context: UseFormHook<V, R>;
}

function Form<V extends Values, R> (
  props: FormProps<V, R> & React.FormHTMLAttributes<HTMLFormElement>
): JSX.Element {
  const {
    children,
    context,
    ...others
  } = props

  const {
    handleReset,
    handleSubmit
  } = context

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
  )
}

export default Form
