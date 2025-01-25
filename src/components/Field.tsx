/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  ElementType,
  HTMLInputTypeAttribute,
  OptionHTMLAttributes,
  ReactElement,
  useCallback,
  useMemo
} from 'react'
import { FieldElement } from '../useForm'
import useFormContext from '../useFormContext'
import { inputValue } from '../utils'
import Option from './Option'

export type FieldProps<T = string, C extends ElementType = any> =
  ComponentPropsWithoutRef<C>
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

function Field<T, C extends ElementType = 'input'> (props: FieldProps<T, C>): ReactElement {
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
    handleChange,
    mode
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

  const handleFieldChange = useCallback((event: ChangeEvent<FieldElement>) => {
    handleChange(event, { parser })
  }, [handleChange, parser])

  const finalProps = useMemo(() => {
    const fieldProps = getFieldProps(name,
      {
        ...others,
        disabled,
        id,
        multiple,
        onBlur,
        onChange: mode === 'controlled'
          ? (onChange ?? handleFieldChange)
          : undefined,
        required,
        type,
        value
      },
      // Pass parser so we can compare form value and field value.
      { parser }
    )

    // Allow formatting value.
    fieldProps.value = inputValue(formatValue(fieldProps.value))

    return fieldProps
  }, [disabled, formatValue, getFieldProps, handleFieldChange, id, mode, multiple, name, onBlur, onChange, others, parser, required, type, value])

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

export default Field
