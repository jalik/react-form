/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React, { useCallback, useMemo } from 'react';
import useFormContext from '../useFormContext';

export const TYPE_BUTTON = 'button';
export const TYPE_RESET = 'reset';
export const TYPE_SUBMIT = 'submit';

export interface ButtonsProps extends React.Component {
  component: any,
  type?: 'button' | 'reset' | 'submit',
}

function Button(props: ButtonsProps & React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  const {
    children,
    component,
    disabled,
    onClick,
    type,
    ...others
  } = props;

  const {
    disabled: formDisabled,
    modified,
    reset,
    submit,
    submitting,
  } = useFormContext();

  // Disable button when form is disabled, submitting, or unmodified.
  const isDisabled = useMemo(() => (
    disabled
    || formDisabled
    || submitting
    || (type === TYPE_RESET && !modified)
    || (type === TYPE_SUBMIT && !modified)
  ), [disabled, formDisabled, modified, submitting, type]);

  const handleClick = useCallback((ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Avoid submitting parent forms
    ev.preventDefault();

    if (onClick) {
      onClick(ev);
    } else if (type === TYPE_SUBMIT) {
      submit();
    } else if (type === TYPE_RESET) {
      reset();
    }
  }, [onClick, reset, submit, type]);

  // Allows rendering of a custom component.
  const Component = component || 'button';

  return (
    <Component
      {...others}
      disabled={isDisabled}
      onClick={handleClick}
      type={type}
    >
      {children}
    </Component>
  );
}

Button.defaultProps = {
  children: null,
  component: null,
};

export default Button;
