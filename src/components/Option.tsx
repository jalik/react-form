/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import React from 'react';
import { inputValue } from '../utils';

export interface SelectOptionProps {
  disabled: boolean;
  key?: React.Key;
  label?: string | number | boolean;
  value: string | number | boolean;
}

function Option(props: SelectOptionProps): JSX.Element {
  const {
    disabled,
    label,
    value,
    ...others
  } = props;

  return (
    <option
      {...others}
      disabled={disabled}
      value={String(inputValue(value))}
    >
      {label || value}
    </option>
  );
}

Option.defaultProps = {
  disabled: false,
};

export default Option;