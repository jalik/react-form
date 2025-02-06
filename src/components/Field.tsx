/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import {
  ComponentPropsWithoutRef,
  ElementType,
  HTMLInputTypeAttribute,
  OptionHTMLAttributes,
  ReactElement,
  useMemo
} from 'react'
import useFormContext from '../useFormContext'
import Option from './Option'
import { FormatFunction, ParseFunction } from '../useForm'

export type FieldProps<T = string, C extends ElementType = any> =
  ComponentPropsWithoutRef<C>
  & {
  /**
   * The custom component to render.
   */
  component?: C;
  /**
   * The default value (uncontrolled mode).
   */
  defaultValue?: T;
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
  formatter?: FormatFunction | null;
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
  parser?: ParseFunction<T>;
  /**
   * Makes the field mandatory.
   */
  required?: boolean;
  /**
   * The field's type.
   */
  type?: HTMLInputTypeAttribute | 'select' | 'textarea';
  /**
   * The value (controlled mode).
   */
  value?: T;
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
    ...others
  } = props

  const form = useFormContext()
  const { getFieldProps } = form

  const finalProps = useMemo(() => {
    return getFieldProps(name,
      {
        ...others,
        disabled,
        id,
        multiple,
        onBlur,
        onChange,
        required,
        type
      },
      {
        format: formatter,
        parser
      }
    )
  }, [disabled, formatter, getFieldProps, id, multiple, name, onBlur, onChange, others, parser, required, type])

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
        <Component
          key={form.key(name)}
          {...finalProps}>
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
        key={form.key(name)}
        {...finalProps}
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
        key={form.key(name)}
        {...finalProps}
      />
    )
  }

  // By default, renders an input field.
  return (
    <input
      key={form.key(name)}
      {...finalProps}
      type={type}
    />
  )
}

export default Field
