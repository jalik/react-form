/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import React, { ComponentProps, ElementType, PropsWithChildren } from 'react'
import useFormContext from '../useFormContext'
import { GetButtonProps } from '../useForm'

export type ButtonProps<C extends ElementType> =
  & Omit<ComponentProps<C>, 'component' | 'type'>
  & PropsWithChildren
  & {
  /**
   * The custom component to render.
   */
  component?: C;
  /**
   * The type of button.
   */
  type?: GetButtonProps['type'];
};

function Button<C extends ElementType> (props: ButtonProps<C>): React.ReactElement {
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
