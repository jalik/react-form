/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Karl STEIN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
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
