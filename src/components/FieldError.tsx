/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import useFormContext from '../useFormContext';

export interface FieldErrorProps {
  component: any,
  name: string;
}

function FieldError(props: FieldErrorProps): JSX.Element | null {
  const { component, name, ...others } = props;
  const { errors } = useFormContext();
  const error = errors[name];

  if (!error) {
    return null;
  }

  const Component = component || 'span';

  return (
    <Component {...others}>
      {error.message}
    </Component>
  );
}

FieldError.defaultProps = {
  component: null,
};

export default FieldError;
