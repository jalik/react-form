# Changelog

## v3.0.8

- Fixed errors while importing source

## v3.0.7

- Upgraded dependencies

## v3.0.6

- Fixed react missing key warnings in Field.js
- Upgraded dependencies

## v3.0.5

- Added support for react 17.x

## v3.0.4

- Fixed react missing key warnings in Field.js
- Removed "prop-types" from dependencies (still in peerDependencies)

## v3.0.3

- Fixed call of handleChange() with nothing as second argument
- Upgraded dependencies

## v3.0.2

- Upgraded dependencies

## v3.0.1

- Fixed error `performance is not defined` in nodejs env
- Upgraded dependencies

## v3.0.0

- **[BREAKING]** Renamed attribute `changes` to `modifiedFields` returned from `useForm()`
- Allow to return a falsy value (e.g. null, false) during validation instead of an empty object,
  when there are no errors
- Automatically set attribute `id` on `<Field>` using the name and value
- Added export function `getFieldId(name, value)` to package
- Added `nullify` option to `useForm()`
- Upgraded dependencies

## v2.0.1

- Upgraded dependencies

## v2.0.0

- **[BREAKING]** Removed attribute `validator` from `<Field>`
- **[BREAKING]** Removed functions `register()` and `unregister()` returned from `useForm()`
- Added function `remove(name)` returned by `useForm()` as a replacement of  `unregister()`
- Added attribute `submitResult` returned by `useForm()`

## v1.1.1

- Fixed infinite loop with anonymous functions passed as `validator` or `parser` in `<Field>`

## v1.1.0

- Removed debounce on validate and submit
- Fixed infinite loop with `initialValues` in `useForm()` options
- Fixed display of children in `<Field>` when the attribute `options` is undefined and using a
  custom component
- Fixed React warnings of duplicate keys when using attribute `options` in `<Field>`
- Added attribute `initialized` returned by `useForm()`
- Upgraded dependencies

## v1.0.0

- First public release
