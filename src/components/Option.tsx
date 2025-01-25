/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { inputValue } from '../utils'
import { ComponentProps, ReactElement } from 'react'

export type OptionProps = ComponentProps<'option'>

function Option (props: OptionProps): ReactElement {
  const {
    label,
    value,
    ...others
  } = props

  return (
    <option
      {...others}
      value={inputValue(value)}
    >
      {label ?? value}
    </option>
  )
}

export default Option
