/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2026 Karl STEIN
 */

// functions

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

// components

export { default as Button } from './components/Button'
export type { ButtonProps } from './components/Button'

export { default as Field } from './components/Field'
export type { FieldProps } from './components/Field'

export { default as FieldError } from './components/FieldError'
export type { FieldErrorProps } from './components/FieldError'

export { default as Form } from './components/Form'
export type { FormProps } from './components/Form'

// hooks

export {
  default as useFieldArray
} from './useFieldArray'

export type {
  UseFieldArrayOptions
} from './useFieldArray'

export {
  default as useForm
} from './useForm'

export type {
  UseFormOptions,
  UseFormHook,
  FieldElement,
  FormatFunction,
  InitializeFieldFunction,
  ParseFunction
} from './useForm'

export {
  default as useFormContext,
  FormContext
} from './useFormContext'

export type {
  Errors,
  FieldPath,
  FormMode,
  FormState,
  ModifiedState,
  PathsAndValues,
  PathsOrValues,
  TouchedState,
  Values
} from './useFormState'

export type {
  ValidateFieldFunction
} from './useFormValidation'
