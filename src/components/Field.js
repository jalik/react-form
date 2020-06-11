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
  any,
  arrayOf,
  bool,
  func,
  node,
  number,
  oneOfType,
  shape,
  string,
} from 'prop-types';
import React, {
  useEffect,
  useMemo,
} from 'react';
import useFormContext from '../useFormContext';
import { inputValue } from '../utils';

export const CHECKBOX = 'checkbox';
export const RADIO = 'radio';
export const SELECT = 'select';
export const TEXT = 'text';
export const TEXTAREA = 'textarea';

/**
 * Returns true if the type is checkable.
 * @param {string} type
 * @return {boolean}
 */
function isCheckable(type) {
  return [CHECKBOX, RADIO].indexOf(type) !== -1;
}

export function SelectOption(opts) {
  let disabled = false;
  let label;
  let value;

  if (typeof opts === 'object' && opts !== null && typeof opts.value !== 'undefined') {
    disabled = opts.disabled;
    label = opts.label || opts.value;
    value = opts.value;
  } else {
    label = opts;
    value = opts;
  }
  return (
    <option
      key={label}
      disabled={disabled}
      value={value}
    >
      {label}
    </option>
  );
}

function Field(
  {
    children,
    className,
    component: Component,
    disabled,
    emptyOptionLabel,
    multiple,
    name,
    onChange,
    options,
    parser,
    type,
    validator,
    value,
    ...props
  },
) {
  const {
    changes,
    disabled: formDisabled,
    errors,
    getAttributes,
    getValue,
    handleChange,
    invalidClass,
    modifiedClass,
    register,
    unregister,
    validClass,
  } = useFormContext();

  const contextValue = getValue(name);
  const classNames = [className];

  // Get field attributes (compute only once).
  const attributes = useMemo(() => (
    getAttributes(name)
  ), [getAttributes, name]);

  // Adds CSS classes corresponding to field state.
  if (changes[name] === true) {
    classNames.push(modifiedClass);
    classNames.push(typeof errors[name] !== 'undefined' ? invalidClass : validClass);
  } else if (typeof errors[name] !== 'undefined') {
    classNames.push(invalidClass);
  }

  const finalProps = {
    ...attributes,
    ...props,
    className: classNames.join(' '),
    disabled: disabled || formDisabled,
    multiple,
    name,
    onChange: onChange || handleChange,
    // Keep value passed to field instead of the form context value if field is checkable.
    value: inputValue(isCheckable(type) ? value : contextValue),
  };

  // Registers the field when mounted, so the form is aware of it,
  // and unregisters it when unmounted, this allows cleaning errors and stuffs like that.
  useEffect(() => {
    register(name, { parser, validator });
    return () => { unregister(name); };
  }, [name, parser, register, unregister, validator]);

  if (type === CHECKBOX) {
    // Checks if single or multiple checkbox.
    if (contextValue instanceof Array) {
      finalProps.checked = contextValue.indexOf(value) !== -1;
      // Avoids required attribute on multiple checkboxes.
      finalProps.required = false;
    } else {
      finalProps.checked = contextValue === value;
    }
  } else if (type === RADIO) {
    finalProps.checked = contextValue === value;
  }

  const finalOptions = options ? [...options] : [];

  if (finalOptions.length > 0) {
    // Adds an empty value to avoid selection of the first value by default.
    if (!multiple && !children) {
      finalOptions.unshift({
        label: emptyOptionLabel,
        value: '',
      });
    }
  }

  // Forces multiple field to have an array as value.
  if (multiple && !(finalProps.value instanceof Array)) {
    finalProps.value = [];
  }

  // Allows rendering of a custom component.
  if (Component !== null) {
    return finalOptions.length > 0 || children ? (
      <Component {...finalProps} type={type}>
        {children}
        {finalOptions.map(SelectOption)}
      </Component>
    ) : (
      <Component {...finalProps} type={type} />
    );
  }

  // Renders a select field.
  if (type === SELECT) {
    return (
      <select {...finalProps}>
        {children}
        {finalOptions.map(SelectOption)}
      </select>
    );
  }

  // Renders a textarea field.
  if (type === TEXTAREA) {
    return <textarea {...finalProps} />;
  }

  // By default, renders an input field.
  return <input {...finalProps} type={type} />;
}

Field.propTypes = {
  children: node,
  className: string,
  component: func,
  disabled: bool,
  emptyOptionLabel: string,
  multiple: bool,
  name: string.isRequired,
  onChange: func,
  options: arrayOf(oneOfType([
    any,
    shape({
      disabled: bool,
      label: string,
      value: any.isRequired,
    }),
  ])),
  parser: func,
  type: string,
  validator: func,
  value: oneOfType([string, number, bool]),
};

Field.defaultProps = {
  children: null,
  className: null,
  component: null,
  disabled: null,
  emptyOptionLabel: '...',
  multiple: false,
  onChange: null,
  options: null,
  parser: null,
  type: TEXT,
  validator: null,
  value: null,
};

export default Field;
