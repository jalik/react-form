/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { ElementType, useCallback, useMemo } from 'react'
import useFormContext from '../useFormContext'

export type ButtonsProps<C extends ElementType> = {
  component?: C,
  type?: 'button' | 'reset' | 'submit',
} & React.ComponentPropsWithoutRef<C>

function Button<C extends ElementType> (props: ButtonsProps<C>): JSX.Element {
  const {
    children,
    component: Component = 'button',
    disabled,
    onClick,
    type,
    ...others
  } = props

  const {
    disabled: formDisabled,
    modified,
    reset,
    submit,
    submitting
  } = useFormContext()

  // Disable button when form is disabled, submitting, or unmodified.
  const isDisabled = useMemo(() => (
    disabled ||
    formDisabled ||
    submitting ||
    (type === 'reset' && !modified) ||
    (type === 'submit' && !modified)
  ), [disabled, formDisabled, modified, submitting, type])

  const handleClick = useCallback((ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Prevent submission.
    ev.preventDefault()
    // Prevent parent form submission.
    ev.stopPropagation()

    if (onClick) {
      onClick(ev)
    } else if (type === 'submit') {
      submit()
    } else if (type === 'reset') {
      reset()
    }
  }, [onClick, reset, submit, type])

  return (
    <Component
      {...others}
      disabled={isDisabled}
      onClick={handleClick}
      type={type}
    >
      {children}
    </Component>
  )
}

Button.defaultProps = {
  children: null,
  component: null,
  type: 'button'
}

export default Button
