/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import React, { ElementType } from 'react'
import useFormContext from '../useFormContext'

export type ButtonProps<C extends ElementType> = React.ComponentProps<C> & {
  /**
   * The custom component to render.
   */
  component?: C,
  /**
   * The type of button.
   */
  type?: 'button' | 'reset' | 'submit',
}

function Button<C extends ElementType = 'button'> (props: ButtonProps<C>): React.ReactElement {
  const {
    children,
    component: Component = 'button',
    type = 'button',
    ...others
  } = props

  const { getButtonProps } = useFormContext()

  return (
    <Component {...getButtonProps({
      ...others,
      type
    })}>
      {children}
    </Component>
  )
}

export default Button
