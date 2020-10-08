/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
 */

import { string } from 'prop-types';
import React from 'react';
import useFormContext from '../useFormContext';

function FieldError({ name, ...props }) {
  const { errors } = useFormContext();
  const error = errors[name];
  return error ? (
    <span {...props}>
      {error instanceof Error ? error.message : error}
    </span>
  ) : null;
}

FieldError.propTypes = {
  name: string.isRequired,
};

export default FieldError;
