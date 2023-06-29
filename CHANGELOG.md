# Changelog

## 5.1.0 (2023-06-28)

- Added option `parser(value): any` to `handleSetValue(name, options?)` returned by `useForm()`
- Added `swap(from, to)` to `useFieldArray()`
- Allow passing several indexes to `remove()` in `useFieldArray()`
- Fixed functions of `useFieldArray()` to queue updates when called during the same render
- Fixed `submitted` not being set to `false` when form is modified after submit
- Upgraded dependencies

## 5.0.2 (2023-05-25)

- Fixed some attributes (required, multiple) returned by `initializeField()` not used in `<Field>`

## 5.0.1 (2023-05-23)

- Fixed select and textarea fields not updating on change
- Fixed validation not being debounced when modifying a field
- Fixed on debouncing `validate()`, `validateField()` and `validateFields()`

## 5.0.0 (2023-05-18)

- **[BREAKING]** Renamed component `<SelectOption />` to `<Option />`
- **[BREAKING]** Renamed option `onChange` to `transform` in `useForm(options)`
- **[BREAKING]** Renamed option `onLoad` to `load` in `useForm(options)`
- **[BREAKING]** Renamed option `onInitializeField` to `initializeField` in `useForm(options)`
- **[BREAKING]** Renamed option `onValidate` to `validate` in `useForm(options)`
- **[BREAKING]** Renamed option `onValidateField` to `validateField` in `useForm(options)`
- **[BREAKING]** Renamed function `getAttributes(field: string)` to `getFieldProps(field: name)`
- **[BREAKING]** Renamed function `remove(field: string)` to `removeFields(fields: string[])` and
- **[BREAKING]** Renamed function `initValues(values)` to `setInitialValues(values)`
- **[BREAKING]** Changed `setErrors(errors, options?)` to set all errors at once, use
  option `partial: true` to apply a partial update
- **[BREAKING]** Changed `setValues(values, options?)` to set all values at once, use
  option `partial: true` to apply a partial update
- **[BREAKING]** Function `validateField(name: string)` returned by `useForm()` does not accept a
  value as second argument
- **[BREAKING]** Do not call `removeField(name)` when `<Field>` is unmounted
- **[BREAKING]** Increment `submitCount` on `submit()` and not on submit error
- **[BREAKING]** Removed `loaded` from `useForm()`
- **[BREAKING]** Removed options `invalidClass`, `modifiedClass` and `validClass` in `useForm()` (
  the same result can be achieved with `initializeField()`)
- Added option `formatter(value): string` to `<Field>`
- Added option `partial: boolean` to `setErrors(errors, options)`
- Added option `partial: boolean` to `setValues(fields, options)`
- Added option `validate: boolean` to `setTouchedFields(fields, options)`
- Added option `validate: boolean` to `setValues(values, options)`
- Added option `clearAfterSubmit: boolean` to `useForm(options)`
- Added option `debug: boolean` to `useForm(options)`
- Added option `onSubmitted()` to `useForm(options)`
- Added option `reinitialize: boolean` to `useForm(options)`
- Added option `trimOnBlur: boolean` to `useForm(options)`
- Added option `trimOnSubmit: boolean` to `useForm(options)`
- Added option `validateOnChange: boolean` to `useForm(options)`
- Added option `validateOnInit: boolean` to `useForm(options)`
- Added option `validateOnSubmit: boolean` to `useForm(options)`
- Added option `validateOnTouch: boolean` to `useForm(options)`
- Added `clear(fields?: string[])` to `useForm()`
- Added `clearErrors(fields?: string[])` to `useForm()`
- Added `clearTouchedFields(fields?: string[])` to `useForm()`
- Added `handleBlur(event)` to `useForm()`
- Added `handleReset(event)` to `useForm()`
- Added `handleSetValue(name)` to `useForm()`
- Added `load()` to `useForm()`
- Added `setTouchedField(name: string, touched: boolean)` to `useForm()`
- Added `setTouchedFields(fields: Record<string, boolean>, options?)` to `useForm()`
- Added `touched: boolean` to `useForm()`
- Added `touchedFields: string[]` to `useForm()`
- Pass form state as second argument of `initializeField(name: string, formState: FormState)`
- Ignore modifications in `handleChange()` when form is disabled
- Keep form disabled after validation if submission follows
- Improved behavior of error messages display when typing or submitting
- Fixed clearing errors of modified fields only
- Fixed parent form submission when submitting a nested form
- Fixed `modified` value returned by `useForm()` after removing a field
- TypeScript declaration types

## 4.0.0 (2023-03-24)

- **[BREAKING]** Initial values are not replaced after form submission (to get the same behaviour,
  call `initValues(submittedValues)`)
- **[BREAKING]** onValidateField() must return the Error instead of throwing it
- **[BREAKING]** Changed signature of onValidateField(value, name, values) to onValidateField(name,
  value, values)
- Added `onLoad()` option to `useForm()`
- Added `onChange()` option to `useForm()`
- Return `hasError: boolean` from `useForm()`
- Return `loading: boolean` from `useForm()`
- Return `loaded: boolean` from `useForm()`
- Return `loadError: Error` from `useForm()`
- Return `validateFields()` from `useForm()`
- Fixed `errors` returned by `useForm()` to not contain attributes with `undefined`

## v3.0.9 (2021-09-20)

- Fixed ESM build

## v3.0.7 (2021-09-20)

- Upgraded dependencies

## v3.0.6 (2021-05-19)

- Fixed react missing key warnings in Field.js
- Upgraded dependencies

## v3.0.5 (2021-05-19)

- Added support for react 17.x

## v3.0.4 (2021-05-19)

- Fixed react missing key warnings in Field.js
- Removed "prop-types" from dependencies (still in peerDependencies)

## v3.0.3 (2021-05-18)

- Fixed call of handleChange() with nothing as second argument
- Upgraded dependencies

## v3.0.2 (2021-01-18)

- Upgraded dependencies

## v3.0.1 (2020-10-19)

- Fixed error `performance is not defined` in nodejs env
- Upgraded dependencies

## v3.0.0 (2020-10-14)

- **[BREAKING]** Renamed attribute `changes` to `modifiedFields` returned from `useForm()`
- Allow to return a falsy value (e.g. null, false) during validation instead of an empty object,
  when there are no errors
- Automatically set attribute `id` on `<Field>` using the name and value
- Added export function `getFieldId(name, value)` to package
- Added `nullify` option to `useForm()`
- Upgraded dependencies

## v2.0.1 (2020-09-17)

- Upgraded dependencies

## v2.0.0 (2020-08-06)

- **[BREAKING]** Removed attribute `validator` from `<Field>`
- **[BREAKING]** Removed functions `register()` and `unregister()` returned from `useForm()`
- Added function `remove(name)` returned by `useForm()` as a replacement of  `unregister()`
- Added attribute `submitResult` returned by `useForm()`

## v1.1.1 (2020-06-10)

- Fixed infinite loop with anonymous functions passed as `validator` or `parser` in `<Field>`

## v1.1.0 (2020-06-10)

- Removed debounce on validate and submit
- Fixed infinite loop with `initialValues` in `useForm()` options
- Fixed display of children in `<Field>` when the attribute `options` is undefined and using a
  custom component
- Fixed React warnings of duplicate keys when using attribute `options` in `<Field>`
- Added attribute `initialized` returned by `useForm()`
- Upgraded dependencies

## v1.0.0

- First public release
