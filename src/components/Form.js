/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2020 Karl STEIN
 */

import {
  func,
  node,
  shape,
} from 'prop-types';
import React from 'react';
import { FormContext } from '../useFormContext';

function Form(
  {
    children,
    context,
    ...props
  },
) {
  const { handleReset, handleSubmit } = context;
  return (
    <FormContext.Provider value={context}>
      <form
        {...props}
        method="post"
        onReset={handleReset}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

Form.propTypes = {
  children: node,
  context: shape({
    handleReset: func.isRequired,
    handleSubmit: func.isRequired,
  }).isRequired,
};

Form.defaultProps = {
  children: null,
};

export default Form;
