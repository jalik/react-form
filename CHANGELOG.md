# Changelog

## v6.0.0 (2025-02-10)

### Breaking changes

- refactor: remove component `<Option>`
- refactor: remove method `handleChange()` from `useForm()`
- refactor: remove options `clearAfterSubmit` and `setInitialValuesOnSuccess` in `useForm()`
- refactor: rename option `onSubmitted()` to `onSuccess()` in `useForm()`
- refactor: rename method `setTouchedFields()` to `setTouched()` in
  `useForm()`
- refactor: rename type `ModifiedFields` to `ModifiedState`
- refactor: rename type `TouchedFields` to `TouchedState`
- refactor: rename `useFieldArray().fields` to `items`
- refactor: forms can be submitted if not modified by default (use option `disableSubmitIfNotModified` to change this)
- refactor: `setValues()` does not accept a function anymore in `useForm()`
- refactor: add function `initialize()` to `useForm()` and make `setInitialValues()` do what it says
- refactor: remove props `emptyOptionLabel`, `options` and `type` from `Field` component to only handle props initialization
- refactor: rename mode `experimental_uncontrolled` to `uncontrolled`
- refactor: rename option `parser` to `parse` in `useForm().getFieldProps()`, `useForm().handleFieldChange()`, `useForm().handleSetValue()` and `getFieldValue()`

**Potentially breaking change**

- fix: declare package as module to avoid compile error in ViteJS (thinking it's a CommonJS package)

### Other changes

- feat: add method `key(name)` to `useForm()` (uncontrolled mode)
- feat: add method `getModified()` to `useForm()`
- feat: add method `getTouched()` to `useForm()`
- feat: add method `isModified()` to `useForm()`
- feat: add method `isTouched()` to `useForm()`
- feat: add method `resetTouched()` to `useForm()`
- feat: add method `appendListItem()` to `useForm()`
- feat: add method `insertListItem()` to `useForm()`
- feat: add method `moveListItem()` to `useForm()`
- feat: add method `removeListItem()` to `useForm()`
- feat: add method `replaceListItem()` to `useForm()`
- feat: add method `swapListItem()` to `useForm()`
- feat: add method `forceUpdate()` to `useForm()`
- feat: add method `getInitialError()` to `useForm()`
- feat: add method `getInitialErrors()` to `useForm()`
- feat: add method `resetErrors(fields)` to `useForm()`
- feat: add method `handleFieldChange(name, opts)` to `useForm()`
- feat: add option `afterSubmit` to `useForm()`
- feat: add option `format` to `getFieldProps()` returned by `useForm()`
- feat: add option `initialErrors` to `useForm()`
- feat: add option `initialModified` to `useForm()`
- feat: add option `initialTouched` to `useForm()`
- feat: add option `onValuesChange(values, mutation)` to `useForm()`
- feat: add option `preventDefaultOnSubmit` to `useForm()`
- feat: add option `disableSubmitIfNotModified` to `useForm()`
- feat: add option `disableSubmitIfNotValid` to `useForm()`
- feat: add option `forceUpdateOnStatusChange` to `useForm()`
- feat: add option `sort` to `useFieldArray()`
- feat: add hook `useWatch(path, callback)`
- feat: make `onSubmit` optional in `useForm()`
- feat: pass `values` as second argument of `onSubmitted(result, values)`
- feat: allow passing `setValueOptions` to `getFieldProps()`, `handleFieldChange()` and `handleSetValue()` in `useForm()`
- feat: set `key` attribute using `useForm().key()` in `<Field>` component
- feat: improve autocompletion of field names in functions arguments
- feat: pass current items to callback of `handleAppend()` and `handlePrepend()` of `useFieldArray()`
- fix: return `onClick` property in `getButtonProps()` in `useForm()`
- fix: fix errors state after changing array items (insert, prepend, remove...)
- fix: fix value returned by `getFieldProps()` to be empty string instead of null when format option is not null
- fix: export types from index to simplify import declarations
- fix: do not mark form as validated when `validateFields()` was successful

## v5.6.0 (2025-01-09)

- feat: add submitted `values` as second argument to `onSubmitted()` returned by `useForm()`
- chore(deps): upgrade dependencies

## v5.5.0 (2024-12-13)

- feat: add option `mode` (`'controlled' | 'experimental_uncontrolled'`) to `useForm()`
- feat: add method `getError()` to `useForm()`
- feat: add method `getErrors()` to `useForm()`
- feat: add method `getInitialValues()` to `useForm()`
- feat: add method `getValues()` to `useForm()`
- feat: improve generated field `id` returned by `getFieldProps()` in `useForm()`

## 5.4.2 (2024-05-21)

- Removed `defaultProps` as recommended by React

## 5.4.1 (2024-05-08)

- Fixed `initialValues` not being cleared when options `clearAfterSubmit`
  and `setInitialValuesOnSuccess` are both `true`

## 5.4.0 (2024-05-06)

- Fixed submit success not being updated when promise returned no result
- Added option `disableOnSubmit: boolean` to `useForm()`
- Added option `disableOnValidate: boolean` to `useForm()`
- Added option `setInitialValuesOnSuccess: boolean` to `useForm()`

## 5.3.1 (2024-04-26)

- Fixed value not being read from target when using `handleChange()`
- Fixed type of `errors[path]` to be `Error | undefined` instead of `Error | void | undefined`
  in `useForm()`

## 5.3.0 (2024-04-17)

- Added attribute `name` to fields returned by `useFieldArray()`
- Added `getButtonProps()` to `useForm()`
- Added `getFormProps()` to `useForm()`

## 5.2.2 (2024-03-15)

- Fixed type attribute not being passed when custom component is used

## 5.2.1 (2024-02-14)

- Fixed setting the value of a field whose parent is null

## 5.2.0 (2024-01-04)

- Allow passing a function using current state in `setValues((current) => next)`, like `useState()`
- Fixed `form.touched` being `true` when calling `setTouchedFields()` with only falsy values
- Upgraded dependencies

## 5.1.2 (2023-07-02)

- Added `getFieldValue()` to `useForm()`
- Do not set form `validated` when validation starts
- Fixed form `hasError` not being false in some cases
- Fixed `validateFields()` to not dispatch fail state when validation succeeds
- Fixed cases where field name resolution was not working
- Fixed update of previously defined values not being removed with `setValues()`

## 5.1.1 (2023-06-28)

- Fixed `useFieldArray()` not triggering rendering when array is modified

## 5.1.0 (2023-06-28)

- Added option `parser(value): any` to `handleSetValue(name, options?)` returned by `useForm()`
- Added `swap(from, to)` to `useFieldArray()`
- Allow passing several indices to `remove()` in `useFieldArray()`
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

### Breaking changes

- Renamed component `<SelectOption />` to `<Option />`
- Renamed option `onChange` to `transform` in `useForm(options)`
- Renamed option `onLoad` to `load` in `useForm(options)`
- Renamed option `onInitializeField` to `initializeField` in `useForm(options)`
- Renamed option `onValidate` to `validate` in `useForm(options)`
- Renamed option `onValidateField` to `validateField` in `useForm(options)`
- Renamed function `getAttributes(field: string)` to `getFieldProps(field: name)`
- Renamed function `remove(field: string)` to `removeFields(fields: string[])` and
- Renamed function `initValues(values)` to `setInitialValues(values)`
- Changed `setErrors(errors, options?)` to set all errors at once, use
  option `partial: true` to apply a partial update
- Changed `setValues(values, options?)` to set all values at once, use
  option `partial: true` to apply a partial update
- Function `validateField(name: string)` returned by `useForm()` does not accept a
  value as second argument
- Do not call `removeField(name)` when `<Field>` is unmounted
- Increment `submitCount` on `submit()` and not on submit error
- Removed `loaded` from `useForm()`
- Removed options `invalidClass`, `modifiedClass` and `validClass` in `useForm()` (
  the same result can be achieved with `initializeField()`)

### Other changes

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

### Breaking changes

- Initial values are not replaced after form submission (to get the same behaviour,
  call `initValues(submittedValues)`)
- onValidateField() must return the Error instead of throwing it
- Changed signature of onValidateField(value, name, values) to onValidateField(name,
  value, values)

### Other changes

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

### Breaking changes

- Renamed attribute `changes` to `modifiedFields` returned from `useForm()`

### Other changes

- Allow to return a falsy value (e.g. null, false) during validation instead of an empty object,
  when there are no errors
- Automatically set attribute `id` on `<Field>` using the name and value
- Added export function `getFieldId(name, value)` to package
- Added `nullify` option to `useForm()`
- Upgraded dependencies

## v2.0.1 (2020-09-17)

- Upgraded dependencies

## v2.0.0 (2020-08-06)

### Breaking changes

- Removed attribute `validator` from `<Field>`
- Removed functions `register()` and `unregister()` returned from `useForm()`

### Other changes

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
