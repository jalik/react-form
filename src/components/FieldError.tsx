/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { ComponentProps, ElementType, ReactElement } from 'react'
import useFormContext from '../useFormContext'

export type FieldErrorProps<C extends ElementType> = ComponentProps<C> & {
  /**
   * The custom component to render.
   */
  component?: C;
  /**
   * The error's field name.
   */
  name: string;
}

function FieldError<C extends ElementType = 'span'> (props: FieldErrorProps<C>): ReactElement | null {
  const {
    component: Component = 'span',
    name,
    ...others
  } = props
  const { errors } = useFormContext()
  const error = errors[name]
  const message = error instanceof Error ? error.message : error

  if (!message) {
    return null
  }

  return (
    <Component {...others}>
      {message}
    </Component>
  )
}

export default FieldError
