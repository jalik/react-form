/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { UseFormHook } from '../useForm'
import { FormContext } from '../useFormContext'
import { Values } from '../useFormState'
import { ComponentProps, ReactElement } from 'react'

export type FormProps<V extends Values, E, R> = ComponentProps<'form'> & {
  /**
   * The form context returned by useForm().
   */
  context: UseFormHook<V, E, R>;
}

function Form<V extends Values = Values, E = Error, R = any> (props: FormProps<V, E, R>): ReactElement {
  const {
    children,
    context,
    ...others
  } = props

  const { getFormProps } = context

  return (
    <FormContext.Provider value={context}>
      <form {...getFormProps(others)}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

export default Form
