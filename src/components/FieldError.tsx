/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import React, { ElementType } from 'react'
import useFormContext from '../useFormContext'

export type FieldErrorProps<C extends ElementType> = React.ComponentProps<C> & {
  /**
   * The custom component to render.
   */
  component?: C,
  /**
   * The error's field name.
   */
  name: string;
}

function FieldError<C extends ElementType = 'span'> (props: FieldErrorProps<C>): React.ReactElement | null {
  const {
    component: Component = 'span',
    name,
    ...others
  } = props
  const { errors } = useFormContext()
  const error = errors[name]

  if (!error) {
    return null
  }

  return (
    <Component {...others}>
      {error.message}
    </Component>
  )
}

export default FieldError
