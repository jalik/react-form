/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

// export functions
export {
  build,
  flatten,
  getFieldId,
  getFieldValue,
  getIndexFromPath,
  hasDefinedValues,
  hasTrueValues,
  inputValue,
  movePathIndices,
  randomKey,
  reconstruct,
  resolve,
  swapPathIndices,
  updatePathIndices
} from './utils'

// export components
export { default as Button, ButtonProps } from './components/Button'
export { default as Field, FieldProps } from './components/Field'
export { default as FieldError, FieldErrorProps } from './components/FieldError'
export { default as Form, FormProps } from './components/Form'
export { default as Option, OptionProps } from './components/Option'

// export hooks
export { default as useFieldArray, UseFieldArrayOptions } from './useFieldArray'
export { default as useForm, UseFormOptions, UseFormHook, InitializeFieldFunction } from './useForm'
export { default as useFormContext, FormContext } from './useFormContext'

// export types
export {
  Errors,
  FieldPath,
  FormMode,
  FormState,
  ModifiedFields,
  PathsAndValues,
  PathsOrValues,
  TouchedFields,
  Values
} from './useFormState'
