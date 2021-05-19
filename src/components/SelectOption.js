/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2021 Karl STEIN
 */

import {
  bool,
  number,
  oneOfType,
  string,
} from 'prop-types';
import React from 'react';

function SelectOption(props) {
  const {
    disabled,
    label,
    value,
    ...otherProps
  } = props;
  return (
    <option
      {...otherProps}
      disabled={disabled}
      value={value}
    >
      {label || value}
    </option>
  );
}

SelectOption.propTypes = {
  disabled: bool,
  label: string,
  value: oneOfType([bool, number, string]),
};

SelectOption.defaultProps = {
  disabled: false,
  label: null,
  value: null,
};

export default SelectOption;
