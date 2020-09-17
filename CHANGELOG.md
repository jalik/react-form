# Changelog

## v2.0.1
- Upgrades dependencies

## v2.0.0
- Removes attribute `validator` from `<Field>`
- Removes `register` and `unregister` from `useForm()`
- Adds `remove` in `useForm()` as a replacement of  `unregister`
- Returns the form submission result as `submitResult` in `useForm()`

## v1.1.1
- Fixes infinite loop when anonymous functions are passed as `validator` or `parser` in `<Field>`

## v1.1.0
- Removes debounce on validate and submit
- Fixes infinite loop with `initialValues` in `useForm()`
- Fixes display of children in `<Field>` when the attribute `options` is undefined and using a custom component
- Fixes React warnings of duplicate keys with `options` in `<Field>`
- Returns `initialized` in `useForm()`
- Upgrades dependencies

## v1.0.0
- First public release
