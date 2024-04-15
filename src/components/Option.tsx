/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

import { inputValue } from '../utils'
import React from 'react'

export type OptionProps = React.ComponentProps<'option'>

function Option (props: OptionProps): React.ReactElement {
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
      {label || value}
    </option>
  )
}

export default Option
