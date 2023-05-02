/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { HTMLAttributes } from 'react'
import useFormContext from '../useFormContext'

export interface FieldErrorProps {
  component?: any,
  name: string;
}

function FieldError (props: HTMLAttributes<HTMLElement> & FieldErrorProps): JSX.Element | null {
  const {
    component: Component,
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
  component: 'span'
}

export default FieldError
