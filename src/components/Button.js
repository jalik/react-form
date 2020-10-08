/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
 */

import {
  bool,
  func,
  node,
  oneOf,
} from 'prop-types';
import React from 'react';
import useFormContext from '../useFormContext';

export const TYPE_BUTTON = 'button';
export const TYPE_RESET = 'reset';
export const TYPE_SUBMIT = 'submit';

export const BUTTON_TYPES = [
  TYPE_BUTTON,
  TYPE_RESET,
  TYPE_SUBMIT,
];

function Button(
  {
    children,
    component: Component,
    disabled,
    type,
    ...props
  },
) {
  const {
    disabled: formDisabled,
    modified,
    submitting,
  } = useFormContext();

  const finalProps = { ...props, type };

  // Disable button when form is disabled, submitting, or unmodified.
  finalProps.disabled = disabled || formDisabled || submitting
    || (type === TYPE_RESET && !modified)
    || (type === TYPE_SUBMIT && !modified);

  // Allows rendering of a custom component.
  if (Component !== null) {
    return <Component {...finalProps}>{children}</Component>;
  }
  // eslint-disable-next-line react/button-has-type
  return <button {...finalProps}>{children}</button>;
}

Button.propTypes = {
  children: node,
  component: func,
  disabled: bool,
  type: oneOf(BUTTON_TYPES),
};

Button.defaultProps = {
  children: null,
  component: null,
  disabled: false,
  type: TYPE_BUTTON,
};

export default Button;
