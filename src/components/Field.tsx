/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react'
import useFormContext from '../useFormContext'
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
   * The format function to call before displaying the value.
   */
  formatter?: FormatFunction | null | false;
  /**
   * The name of the field.
   */
  name: string;
  /**
   * The parse function to call when the value is modified.
   */
  parser?: ParseFunction<T>;
  /**
   * Makes the field mandatory.
   */
  required?: boolean;
  /**
   * The value (controlled mode).
   */
  value?: T;
}

function Field<T, C extends ElementType = 'input'> (props: FieldProps<T, C>): ReactElement {
  const {
    component: Component = 'input',
    formatter,
    name,
    parser,
    ...others
  } = props

  const form = useFormContext()
  const { getFieldProps } = form

  return (
    <Component
      key={form.key(name)}
      {...getFieldProps(name, others, {
        format: formatter,
        parse: parser
      })}
    />
  )
}

export default Field
