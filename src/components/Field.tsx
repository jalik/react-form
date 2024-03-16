/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import React, {
  ElementType,
  HTMLInputTypeAttribute,
  OptionHTMLAttributes,
  useCallback,
  useMemo
} from 'react'
import { FieldElement } from '../useForm'
import useFormContext from '../useFormContext'
import { inputValue } from '../utils'
import Option from './Option'

export type FieldProps<T = string, C extends ElementType = any> =
  React.ComponentPropsWithoutRef<C>
  & {
  /**
   * The custom component to render.
   */
  component?: C;
  /**
   * Disables the field.
   */
  disabled?: boolean;
  /**
   * Sets the label of the empty option (select only).
   */
  emptyOptionLabel?: string;
  /**
   * The format function to call before displaying the value.
   * @param value
   */
  formatter? (value: T | string): string | undefined;
  /**
   * The name of the field.
   */
  name: string;
  /**
   * The field options (select only).
   */
  options?: OptionHTMLAttributes<HTMLOptionElement>[];
  /**
   * The parse function to call when the value is modified.
   * @param value
   * @param target
   */
  parser? (value: string, target?: HTMLElement): T;
  /**
   * Makes the field mandatory.
   */
  required?: boolean;
  /**
   * The field's type.
   */
  type?: HTMLInputTypeAttribute | 'select' | 'textarea';
  /**
   * The field's value.
   */
  value?: string | T;
}

function Field<T, C extends ElementType = 'input'> (props: FieldProps<T, C>): JSX.Element {
  const {
    children,
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
    required,
    type,
    value,
    ...others
  } = props

  const {
    getFieldProps,
    handleChange
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
      // Do not stringify value for custom component
      return Component ? val : String(val)
    }
    return ''
  }, [Component, formatter])

  const handleFieldChange = useCallback((event: React.ChangeEvent<FieldElement>) => {
    handleChange(event, { parser })
  }, [handleChange, parser])

  const finalProps = useMemo(() => {
    const fieldProps = getFieldProps(name, {
      ...others,
      disabled,
      id,
      multiple,
      onBlur,
      onChange: onChange || handleFieldChange,
      required,
      type,
      value,
      // Get parsed value if parser is passed,
      // so we can compare parsed value to field value (if checked).
      parsedValue: parser && typeof value === 'string' ? parser(value) : value
    })

    // Allow formatting value.
    fieldProps.value = inputValue(formatValue(fieldProps.value))

    return fieldProps
  }, [disabled, formatValue, getFieldProps, handleFieldChange, id, multiple, name, onBlur, onChange, others, parser, required, type, value])

  const finalOptions: OptionHTMLAttributes<HTMLOptionElement>[] = useMemo(() => {
    const list: OptionHTMLAttributes<HTMLOptionElement>[] = options ? [...options] : []

    if (list.length > 0) {
      // Adds an empty value to avoid selection of the first value by default.
      if (!multiple && !children) {
        list.unshift({
          disabled: false,
          label: emptyOptionLabel,
          value: ''
        })
      }
    }
    return list
  }, [children, emptyOptionLabel, multiple, options])

  // Renders a custom component.
  if (Component != null) {
    if (children || finalOptions.length > 0) {
      return (
        <Component {...finalProps}>
          {children}
          {finalOptions.map((option) => (
            <Option key={`${option.label}_${option.value}`} {...option} />
          ))}
        </Component>
      )
    }
    return <Component {...finalProps} />
  }

  // Renders a select field.
  if (type === 'select') {
    return (
      <select
        {...finalProps}
        value={String(finalProps.value)}
      >
        {children}
        {finalOptions.map((option) => (
          <Option key={`${option.label}_${option.value}`} {...option} />
        ))}
      </select>
    )
  }

  // Renders a textarea field.
  if (type === 'textarea') {
    return (
      <textarea
        {...finalProps}
        value={String(finalProps.value)}
      />
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
  disabled: undefined,
  emptyOptionLabel: '...',
  formatter: undefined,
  multiple: undefined,
  options: undefined,
  parser: undefined,
  required: undefined,
  type: 'text',
  value: undefined
}

export default Field
