/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { HTMLInputTypeAttribute, useCallback, useEffect, useMemo } from 'react'
import { FieldAttributes, FieldElement } from '../useForm'
import useFormContext from '../useFormContext'
import { getFieldId, inputValue } from '../utils'
import Option, { OptionProps } from './Option'

type FieldType = HTMLInputTypeAttribute | 'select' | 'textarea';

/**
 * Returns true if the type is checkable.
 */
function isCheckable (type: HTMLInputTypeAttribute): boolean {
  return type === 'checkbox' || type === 'radio'
}

export interface FieldProps<T = string> {
  component?: any;
  disabled?: boolean;
  emptyOptionLabel?: string;
  formatter? (value: T | string): string | undefined;
  multiple?: boolean;
  name: string;
  options?: string[] | number[] | boolean[] | OptionProps[];
  parser? (value: string): T;
  required?: boolean;
  type?: FieldType;
  value?: string | T;
}

function Field<T> (props: FieldAttributes & FieldProps<T>): JSX.Element {
  const {
    children,
    className,
    component: Component,
    disabled,
    emptyOptionLabel,
    formatter,
    id,
    multiple,
    name,
    onBlur,
    onChange,
    options,
    parser,
    type,
    value,
    ...others
  } = props

  const {
    disabled: formDisabled,
    errors,
    getFieldProps,
    getValue,
    handleBlur,
    handleChange,
    invalidClass,
    modifiedClass,
    modifiedFields,
    removeFields,
    validClass
  } = useFormContext()

  // Check incompatible attributes
  if (onChange && parser) {
    // eslint-disable-next-line no-console
    console.warn(`${name}: attributes "parser" and "onChange" cannot be set together`)
  }

  const formatValue = useCallback((val: T | string) => {
    if (val != null && val !== '') {
      if (formatter) {
        return formatter(val)
      }
      return String(val)
    }
    return ''
  }, [formatter])

  // Get context value from field name
  const contextValue = useMemo(() => getValue<T>(name), [getValue, name])

  const handleFieldBlur = useCallback((event: React.FocusEvent<FieldElement>) => {
    handleBlur(event)
  }, [handleBlur])

  const handleFieldChange = useCallback((event: React.ChangeEvent<FieldElement>) => {
    handleChange(event, { parser })
  }, [handleChange, parser])

  // Get field props.
  const attributes = useMemo(() => (
    getFieldProps(name)
  ), [getFieldProps, name])

  // Prepare field classes.
  const classNames = useMemo(() => {
    const classes = [className]

    // Adds CSS classes corresponding to field state.
    if (modifiedFields[name]) {
      classes.push(modifiedClass)
      classes.push(errors[name] ? invalidClass : validClass)
    } else if (typeof errors[name] !== 'undefined') {
      classes.push(invalidClass)
    }
    return classes
  }, [className, errors, invalidClass, modifiedClass, modifiedFields, name, validClass])

  // Get parsed value if parser is passed,
  // so we can compare parsed value to field value (if checked).
  const parsedValue = useMemo(() => (
    parser && typeof value === 'string' ? parser(value) : value
  ), [parser, value])

  const finalProps = useMemo(() => {
    const p: { [key: string]: any } = {
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
      value: contextValue
    }

    if (value === null || value === '') {
      if (type === 'radio') {
        // Convert null value for radio only
        p.value = ''
      }
    }

    // Allow formatting value.
    p.value = inputValue(formatValue(p.value))

    if (type && isCheckable(type)) {
      if (contextValue instanceof Array) {
        p.checked = contextValue.indexOf(parsedValue) !== -1
        // Remove required attribute on multiple fields.
        p.required = false
      } else {
        // Get checked state from checkbox without value
        // or by comparing checkbox value and context value.
        p.checked = (value == null || value === '') && typeof contextValue === 'boolean' && type === 'checkbox'
          ? contextValue
          : contextValue === parsedValue
      }
    }
    return p
  }, [attributes, classNames, contextValue, disabled, formDisabled, formatValue, handleFieldBlur,
    handleFieldChange, id, multiple, name, onBlur, onChange, others, parsedValue, type, value])

  const finalOptions: OptionProps[] = useMemo(() => {
    const list: OptionProps[] = (options ? [...options] : []).map((option, index) => {
      if (typeof option === 'object' && option != null) {
        return {
          ...option,
          key: `${option.label}_${option.value}`
        }
      }
      return {
        key: `${index}_${option}`,
        label: String(option),
        value: String(option)
      }
    })

    if (list.length > 0) {
      // Adds an empty value to avoid selection of the first value by default.
      if (!multiple && !children) {
        list.unshift({
          disabled: false,
          key: 'empty',
          label: emptyOptionLabel,
          value: ''
        })
      }
    }
    return list
  }, [children, emptyOptionLabel, multiple, options])

  // Removes the field when unmounted, to clean errors and stuffs like that.
  useEffect(() => () => {
    removeFields([name])
  }, [name, removeFields])

  // Renders a custom component.
  if (Component != null) {
    if (children || finalOptions.length > 0) {
      return (
        <Component {...finalProps} type={type}>
          {children}
          {finalOptions.map(({
            key,
            ...option
          }) => (
            <Option key={key} {...option} />
          ))}
        </Component>
      )
    }
    return <Component {...finalProps} type={type} />
  }

  // Renders a select field.
  if (type === 'select') {
    return (
      <select {...finalProps} value={String(finalProps.value)}>
        {children}
        {finalOptions.map(({
          key,
          ...option
        }) => (
          <Option key={key} {...option} />
        ))}
      </select>
    )
  }

  // Renders a textarea field.
  if (type === 'textarea') {
    return (
      <textarea {...finalProps} value={String(finalProps.value)} />
    )
  }

  // By default, renders an input field.
  return (
    <input
      {...finalProps}
      type={type}
      value={String(finalProps.value)}
    />
  )
}

Field.defaultProps = {
  component: undefined,
  disabled: false,
  emptyOptionLabel: '...',
  formatter: undefined,
  multiple: false,
  options: undefined,
  parser: undefined,
  required: false,
  type: undefined,
  value: undefined
}

export default Field
