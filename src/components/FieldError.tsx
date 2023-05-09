/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { ElementType } from 'react'
import useFormContext from '../useFormContext'

export type FieldErrorProps<C extends ElementType> = {
  component?: C,
  name: string;
} & React.ComponentPropsWithoutRef<C>

function FieldError<C extends ElementType> (props: FieldErrorProps<C>): JSX.Element | null {
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

FieldError.defaultProps = {
  component: undefined
}

export default FieldError
