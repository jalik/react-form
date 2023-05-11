/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { inputValue } from '../utils'
import React from 'react'

function Option (props: React.OptionHTMLAttributes<HTMLOptionElement>): JSX.Element {
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
