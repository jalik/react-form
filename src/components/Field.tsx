/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React, { HTMLInputTypeAttribute, useCallback, useEffect, useMemo } from 'react';
import { FieldAttributes } from '../useForm';
import useFormContext from '../useFormContext';
import { getFieldId, inputValue } from '../utils';
import Option, { OptionProps } from './Option';

export const CHECKBOX = 'checkbox';
export const RADIO = 'radio';
export const SELECT = 'select';
export const TEXT = 'text';
export const TEXTAREA = 'textarea';

/**
 * Returns true if the type is checkable.
 */
function isCheckable(type: HTMLInputTypeAttribute): boolean {
  return [CHECKBOX, RADIO].indexOf(type) !== -1;
}

export interface FieldProps<T> {
  component: any;
  disabled?: boolean;
  emptyOptionLabel?: string;
  multiple?: boolean;
  name: string;
  options?: string[] | number[] | boolean[] | OptionProps[];
  parser?(value: string): T;
  required?: boolean;
  // todo add formatter
  type?: HTMLInputTypeAttribute | 'select' | 'textarea';
  // todo remove
  validator?<T>(value: T): Error | undefined;
  value: unknown;
}

function Field<T>(props: FieldProps<T> & FieldAttributes): JSX.Element {
  const {
    children,
    className,
    component: Component,
    disabled,
    emptyOptionLabel,
    id,
    multiple,
    name,
    onBlur,
    onChange,
    options,
    parser,
    type,
    value,
    validator,
    ...others
  } = props;

  const {
    disabled: formDisabled,
    errors,
    getAttributes,
    getValue,
    handleBlur,
    handleChange,
    invalidClass,
    modifiedClass,
    modifiedFields,
    remove,
    validClass,
  } = useFormContext();

  // Check deprecated attributes
  if (validator) {
    // eslint-disable-next-line no-console
    console.warn(`${name}: attribute "validator" is deprecated`);
  }

  // Check incompatible attributes
  if (onChange && parser) {
    // eslint-disable-next-line no-console
    console.warn(`${name}: attributes "parser" and "onChange" cannot be set together`);
  }

  // Get context value from field name
  const contextValue = useMemo(() => getValue(name), [getValue, name]);

  const handleFieldBlur = useCallback((event: React.FocusEvent<FieldElement>) => {
    handleBlur(event);
  }, [handleBlur]);

  const handleFieldChange = useCallback((event: React.ChangeEvent<FieldElement>) => {
    handleChange(event, { parser });
  }, [handleChange, parser]);

  // Get field attributes (compute only once).
  const attributes = useMemo(() => (
    getAttributes(name)
  ), [getAttributes, name]);

  // Prepare field classes.
  const classNames = useMemo(() => {
    const classes = [className];

    // Adds CSS classes corresponding to field state.
    if (modifiedFields[name]) {
      classes.push(modifiedClass);
      classes.push(errors[name] ? invalidClass : validClass);
    } else if (typeof errors[name] !== 'undefined') {
      classes.push(invalidClass);
    }
    return classes;
  }, [className, errors, invalidClass, modifiedClass, modifiedFields, name, validClass]);

  // Get parsed value if parser is passed, so we can compare parsed value to field value (if checked).
  const parsedValue = useMemo(() => parser && typeof value === 'string' ? parser(value) : value, [parser, value]);

  const finalProps = useMemo(() => {
    const p: { [key: string]: unknown } = {
      ...attributes,
      ...others,
      className: classNames.join(' '),
      disabled: disabled || formDisabled,
      id: id || getFieldId(name, value),
      multiple,
      name,
      required: others.required || attributes?.required,
      onBlur: onBlur || handleFieldBlur,
      onChange: onChange || handleFieldChange,
      value: contextValue,
    };

    if (value === null && type === RADIO) {
      // Pass null value for radio only
      p.value = '';
    } else if (value === '' && type === RADIO) {
      // Pass null value for radio only
      p.value = '';
    } else if (Component != null) {
      // Pass raw value or raw context value to custom component
      p.value = inputValue(value != null && value !== '' ? value : contextValue);
    } else {
      // Pass string value to classic form element
      p.value = String(inputValue(value != null && value !== '' ? value : contextValue));
    }

    if (type && isCheckable(type)) {
      if (contextValue instanceof Array) {
        p.checked = contextValue.indexOf(parsedValue) !== -1;
        // Remove required attribute on multiple fields.
        p.required = false;
      } else {
        // Get checked state from checkbox without value or by comparing checkbox value and context value.
        p.checked = (value == null || value === '') && typeof contextValue === 'boolean' && type === CHECKBOX
          ? contextValue
          : contextValue === parsedValue;
      }
    }
    return p;
  }, [Component, attributes, classNames, contextValue, disabled, formDisabled, handleFieldBlur, handleFieldChange,
    id, multiple, name, onBlur, onChange, others, parsedValue, type, value]);

  const finalOptions = useMemo(() => {
    const list = (options ? [...options] : []).map((option, index) => (
      typeof option === 'object' && option != null
        ? { ...option, key: `${option.label}_${option.value}` }
        : { key: `${index}_${option}`, label: option, value: option }
    ));

    if (list.length > 0) {
      // Adds an empty value to avoid selection of the first value by default.
      if (!multiple && !children) {
        list.unshift({
          disabled: false,
          key: 'empty',
          label: emptyOptionLabel,
          value: '',
        });
      }
    }
    return list;
  }, [children, emptyOptionLabel, multiple, options]);

  // Removes the field when unmounted, to clean errors and stuffs like that.
  useEffect(() => () => {
    remove(name);
  }, [name, remove]);

  // Renders a custom component.
  if (Component != null) {
    if (children || finalOptions.length > 0) {
      return (
        <Component {...finalProps} type={type}>
          {children}
          {finalOptions.map(({ key, ...option }) => (
            <Option key={key} {...option} />
          ))}
        </Component>
      );
    } else {
      return <Component {...finalProps} type={type} />;
    }
  }

  // Renders a select field.
  if (type === SELECT) {
    return (
      <select {...finalProps} value={String(finalProps.value)}>
        {children}
        {finalOptions.map(({ key, ...option }) => (
          <Option key={key} {...option} />
        ))}
      </select>
    );
  }

  // Renders a textarea field.
  if (type === TEXTAREA) {
    return (
      <textarea {...finalProps} value={String(finalProps.value)} />
    );
  }

  // By default, renders an input field.
  return (
    <input
      {...finalProps}
      type={type}
      value={String(finalProps.value)}
    />
  );
}

Field.defaultProps = {
  emptyOptionLabel: '...',
};

export default Field;
