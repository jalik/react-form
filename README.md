# @jalik/react-form

![GitHub package.json version](https://img.shields.io/github/package-json/v/jalik/react-form.svg)
![Build Status](https://github.com/jalik/react-form/actions/workflows/node.js.yml/badge.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jalik/react-form.svg)
[![GitHub issues](https://img.shields.io/github/issues/jalik/react-form.svg)](https://github.com/jalik/react-form/issues)
![GitHub](https://img.shields.io/github/license/jalik/react-form.svg)
![npm](https://img.shields.io/npm/dt/@jalik/react-form.svg)
[![@jalik/react-form](https://snyk.io/advisor/npm-package/@jalik/react-form/badge.svg)](https://snyk.io/advisor/npm-package/@jalik/react-form)

## Why using this lib ?

There are other well established solutions like Formik, React-Hook-Form, Redux Form...  
This lib aims to provide the **best experience for developers (DX) and users (UX)** when creating
advanced forms in React (have a look at the features below).  
If you feel concerned, then it's all for you :)

## Features

- Fields props initialization at form level (optional)
- Management of field state and updates (value and onChange)
- Tracking of modified fields
- Tracking of touched fields
- Various form status info (modified, disabled, validating, submitting...)
- Form loading using promise (optional)
- Auto-disabling fields until the form is initialized
- Auto-disabling fields when the form is disabled, not modified, validating or submitting
- Parsing of field value when modified (smart typing or custom parser)
- Replacement of empty string by null on field change and form submit
- Trim values on form submitting
- Field validation on change (optional)
- Field validation on init/load (optional)
- Field validation on touch (optional)
- Field validation on submitting (optional)
- Field and form validation using a custom function or schema (like yup)
- Form and field errors handling
- Reset form or fields
- Handling form submission errors and retries
- Compatible with custom components libraries
- TypeScript declarations ♥

## Sandbox

You can play with the lib
here: https://codesandbox.io/s/jalik-react-form-demo-wx6hg?file=/src/components/UserForm.js

## Installing

```shell
npm i @jalik/react-form
```

```shell
yarn add @jalik/react-form
```

## Creating a form

```tsx
import { Button, Field, Form, useForm } from '@jalik/react-form'

/**
 * Authenticates by username and password.
 * @param username
 * @param password
 */
function authenticate (username, password) {
  return fetch('https://www.mysite.com/auth', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    }),
    headers: { 'content-type': 'application/json' }
  })
}

function SignInForm () {
  const form = useForm({
    initialValues: {
      username: '',
      password: ''
    },
    // onSubmit needs to return a promise,
    // so the form is aware of the submit state.
    onSubmit: (values) => authenticate(values.username, values.password)
  })

  return (
    // Using the provided components allows writing code faster while keeping it very concise.
    // <Field> and other components must be nested in a <Form> with the form context. 
    <Form context={form}>
      <Field name="username" />
      <Field name="password" />
      <Button type="submit">Sign in</Button>
    </Form>
  )
}
```

## Loading a form

There are several ways to load a form:

* Loading values inside or outside the form component ;
* Loading values using the `load` option of `useForm()` ;

### Loading values inside the form component

```tsx
import { Button, Field, Form, useForm } from '@jalik/react-form'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

function UserFormPage () {
  const params = useParams()
  const [user, setUser] = useState(null)

  // Load user and call setUser(user)...

  const form = useForm({
    // initialValues must be null (or omitted) at first,
    // so the form will understand that it will be initialized later.
    initialValues: user,
    reinitialize: true,
    onSubmit: async (values) => ({ saved: true }),
  })

  return (
    <Form context={form}>
      <Field name="firstName" />
      <Field name="lastName" />
      <Button type="submit">Save</Button>
    </Form>
  )
}
```

### Loading values using the `load` option in `useForm()`

```tsx
import { Button, Field, Form, useForm } from '@jalik/react-form'
import { useCallback } from 'react'

function loadUser (id) {
  return fetch(`/api/user/${id}`).then((resp) => resp.json())
}

function UserFormPage (props) {
  const form = useForm({
    // initialValues must be null (or omitted) at first,
    // so the form will understand that it will be initialized later.
    initialValues: null,
    // WARNING: load is called every time it changes,
    // in this case the form will be updated when the id changes.
    // Note that all fields are disabled during loading.
    load: useCallback(() => loadUser(1337), []),
    onSubmit: async (values) => ({ saved: true }),
  })

  return (
    <Form context={form}>
      <Field name="firstName" />
      <Field name="lastName" />
      <Button type="submit">Save</Button>
    </Form>
  )
}
```

## Validating a form

### Validating using a schema

Form validation using a schema needs a small amount of work.  
Here we use `@jalik/schema` to validate the form using a schema, but it is possible to use any lib
(yup, joi...).

```tsx
import { Button, Field, FieldError, Form, useForm } from '@jalik/react-form'
import Schema from '@jalik/schema'

/**
 * Returns field props based on schema constraints.
 * @param schema
 */
export function createFieldInitializer (schema) {
  // function called by initializeField
  return (name) => {
    const field = schema.getField(name)
    return field ? {
      required: field.isRequired()
    } : null
  }
}

/**
 * Validates the field using the schema.
 * @param schema
 */
export function createFieldValidator (schema) {
  // function called by validateField
  return async (name, value) => {
    schema.getField(name).validate(value)
  }
}

/**
 * The function returned validates the form (all fields) using the schema.
 * @param schema
 */
export function createFormValidator (schema) {
  // function called by validate
  return async (values) => schema.getErrors(values)
}

// Prepare the form validation schema.
const SignInFormSchema = new Schema({
  username: {
    type: 'string',
    required: true,
    minLength: 1
  },
  password: {
    type: 'string',
    required: true,
    minLength: 1
  }
})

function SignInForm () {
  const form = useForm({
    initialValues: {
      username: null,
      password: null
    },
    // This function sets the fields props based on a schema.
    initializeField: createFieldInitializer(SignInFormSchema),
    // This function validates all fields (even missing ones) based on a schema.
    validate: createFormValidator(SignInFormSchema),
    // This function validates a single field based on a schema.
    validateField: createFieldValidator(SignInFormSchema),
    onSubmit: async (values) => ({ success: true })
  })
  return (
    <Form context={form}>
      <Field name="username" />
      <FieldError name="username" />

      <Field name="password" />
      <FieldError name="password" />

      <Button type="submit">Sign in</Button>
    </Form>
  )
}
```

## Form component linking

To link and initialize your components with a form instance, use `getButtonProps()`, `getFieldProps()` and `getFormProps()`.

```tsx
import { useFormContext } from '@jalik/react-form'
import { MyCustomButton, MyCustomForm, MyCustomInput } from 'my-custom-ui'

export function FormButton (props) {
  const form = useFormContext()
  return <MyCustomButton {...form.getButtonProps(props)} />
}

export function FormInput (props) {
  const { name } = props
  const form = useFormContext()
  return <MyCustomInput {...form.getFieldProps(name, props)} />
}

export function FormWrapper (props) {
  const form = useFormContext()
  return <MyCustomForm {...form.getFormProps(props)} />
}
```

Or use the provided components `<Button>`, `<Field>` and `<Form>`.

```tsx
import { Button, Field, Form } from '@jalik/react-form'
import { MyCustomButton, MyCustomForm, MyCustomInput } from 'my-custom-ui'

export function FormButton (props) {
  return <Button {...props} component={MyCustomButton} />
}

export function FormInput (props) {
  return <Field {...props} component={MyCustomInput} />
}

export function FormWrapper (props) {
  return <Form {...props} component={MyCustomForm} />
}
```

## API

### Hooks

#### useForm (options)

This is where the magic happens, this hook defines the form state and its behavior.

```tsx
import { useForm } from '@jalik/react-form'

const form = useForm({
  // optional, what to do after a successful submit: 'clear' | 'initialize' | 'reset' | null
  afterSubmit: 'reset',
  // optional, used to debug form
  debug: false,
  // optional, used to disable all fields and buttons
  disabled: false,
  disableOnSubmit: true,
  disableOnValidate: true,
  // optional, disables the submit button if form is not modified
  disableSubmitIfNotModified: false,
  // optional, disables the submit button if form is not valid
  disableSubmitIfNotValid: false,
  // optional, enable native HTML validation on submit
  enableHTMLValidation: false,
  // optional, update form when status changes
  forceUpdateOnStatusChange: false,
  // optional, used to set initial values
  initialValues: undefined,
  // optional, sets initial errors
  initialErrors: {},
  // optional, sets initial modified fields
  initialModified: {},
  // optional, sets initial touched fields
  initialTouched: {},
  // optional, used to replace empty string by null on change and on submit
  nullify: false,
  // optional, prevent native action on submit
  preventDefaultOnSubmit: true,
  // optional, used to initialize form everytime initialValues changes
  reinitialize: false,
  // optional, used to debounce submit
  submitDelay: 100,
  // optional, used to remove extra spaces on blur
  trimOnBlur: false,
  // optional, used to remove extra spaces on submit
  trimOnSubmit: false,
  // optional, used to debounce validation
  validateDelay: 400,
  // optional, used to validate field on change
  validateOnChange: false,
  // optional, used to validate all fields on initialization
  validateOnInit: false,
  // optional, used to validate all fields on submit
  validateOnSubmit: true,
  // optional, used to validate field on touch
  validateOnTouch: false,

  // optional, used to set field props dynamically
  initializeField: (name, formState) => ({
    className: formState.modifiedFields[name] ? 'input-modified' : undefined,
    required: name === 'username'
  }),

  // optional, used to load initial values
  load: async () => ({
    id: 1,
    username: 'test'
  }),

  // REQUIRED, called when form is submitted
  onSubmit: async (values) => ({ success: true }),

  // optional, called when form has been successfully submitted
  onSuccess: (result, values) => {
    // resuls contains the value returned by onSubmit, in this example { success: true }
  },

  // optional, called when form values have changed
  onValuesChange: (values, previousValues) => {
  },

  // optional, called when a field value changed
  // mutation contains all pending changes in a flat object ({field: value})
  // values contains the next form values
  transform: (mutation, values) => {
    // in this example, if lastname or firstname changed,
    // we set the value of "username" like "john.c"
    if (mutation.lastname || mutation.firstname) {
      mutation.username = [
        values.firstname,
        (values.lastname || '')[0]
      ].join('.').toLowerCase()
    }
    return mutation
  },

  // optional, used to validate all fields (expect a promise)
  validate: async (values) => {
    const errors = {}

    if (!values.username) {
      // error can be a string
      errors.username = 'field is required'
      // or an Error
      errors.username = new Error('field is required')
    }
    return errors
  },

  // optional, used to validate a single field (expect a promise)
  validateField: async (name, value, values) => {
    if (name === 'username' && !value) {
      // error can be a string
      return 'field is required'
      // or an Error
      return new Error('field is required')
    }
  }
})
```

#### useFormContext ()

This hook returns the form context and functions.

```ts
import { useFormContext } from '@jalik/react-form'

const {
  // FORM STATE
  // tells if the form is disabled
  disabled,
  // tells if the form has been initialized
  initialized,
  // tells if the form was modified
  modified,
  // tells if the form was touched
  touched,

  // FORM UTILS
  // returns the button props
  getButtonProps,
  // returns the field props
  getFieldProps,
  // handler for onChange
  handleChange,
  // handler for onBlur
  handleBlur,
  // handler for onReset
  handleReset,
  // handler for onChange((value) => {}) instead of onChange((event) => {})
  handleSetValue,
  // handler for onSubmit
  handleSubmit,

  // LOADING
  load,
  // tells if the form is loading
  loading,
  // loading error (if any)
  loadError,

  // FIELD VALUES
  // clears the form (values, errors...)
  clearValues,
  // returns the field initial value by name
  getInitialValue,
  // returns the field initial value by name
  getValue,
  // initial values (used when form is reset)
  initialValues,
  // removes fields (used for dynamic forms)
  removeValues,
  // resets all or given fields to their initial values
  resetValues,
  // sets the initial values
  setInitialValues,
  // sets value of a field
  setValue,
  // sets values of multiple fields
  setValues,
  // the form values
  values,

  // LIST MANAGEMENT
  appendListItem,
  insertListItem,
  moveListItem,
  prependListItem,
  removeListItem,
  replaceListItem,
  swapListItem,

  // FIELD ERRORS
  // clears all errors
  clearErrors,
  // fields errors
  errors,
  // tells if the form has errors
  hasError,
  // sets a single field error
  setError,
  // sets fields errors
  setErrors,

  // FIELD STATE MANAGEMENT
  // clears all or given fields
  clearModifiedFields,
  // clears all or given fields
  clearTouchedFields,
  // returns the modified fields
  getModifiedFields,
  // returns the touched fields
  getTouchedFields,
  // check if a field was modified
  isModified,
  // check if a field was touched
  isTouched,
  // the list of modified fields
  modifiedFields,
  // resets modified fields to their initial values
  resetModifiedFields,
  // resets touched fields to their initial values
  resetTouchedFields,
  // set a single modified field
  setModifiedField,
  // set all or given modified field
  setModifiedFields,
  // set a single touched field
  setTouchedField,
  // set all or given touched field
  setTouchedFields,
  // the list of touched fields
  touchedFields,

  // FORM SUBMISSION
  // submits the form with values (validate first)
  submit,
  // the number of times the form was submitted.
  // resets to zero when submission succeeds.
  submitCount,
  // the submit error (if any)
  submitError,
  // the submit result (returned by onSubmit)
  submitResult,
  // tells if the form was submitted (changes to false when form is modified)
  submitted,
  // tells if the form is submitting
  submitting,

  // VALIDATION
  // tells if the form will trigger a validation
  // can be a boolean or a list of fields to validate
  needValidation,
  // sets the validation state of the form
  setValidated,
  // sets the validation error
  setValidateError,
  // tells if the form is validating
  setValidating,
  // validates all fields
  validate,
  // the validation error (if any)
  // happens only when an error is thrown during validation
  // it's different from the field validation errors
  validateError,
  // validates given fields
  validateFields,
  // tells if the form was successfully validated
  validated,
  // tells if a field should be validated on change
  validateOnChange,
  // tells if all fields should be validated on initialization
  validateOnInit,
  // tells if all fields should be validated on submit
  validateOnSubmit,
  // tells if a field should be validated on touch
  validateOnTouch,
  // tells if the form is validating
  validating,

  // WATCH
  watch,
  watchers,
} = useFormContext()
```

#### useFieldArray (options)

This hook returns utils to manage an array of fields.

```tsx
import { useFieldArray, useForm } from '@jalik/react-form'

function ItemListForm () {
  const form = useForm({
    initialValues: {
      items: [{ name: 'Item 1' }]
    },
    onSubmit: (values) => Promise.resolve(values)
  })

  const {
    items,
    append,
    prepend,
    remove,
    insert,
    replace,
    move,
    swap,
    handleAppend,
    handlePrepend,
    handleRemove
  } = useFieldArray({
    context: form,
    name: 'items',
    defaultValue: { name: 'New Item' }
  })

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.key}>
          <Field name={item.name} />
          <button type="button" onClick={handleRemove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAppend}>Add Item</button>
    </div>
  )
}
```

### Components

Some components are provided to ease forms building.

#### &lt;Button&gt;

This component is synced with the form, so whenever the form is disabled (because it is loading,
validating or submitting), the button disabled.

```tsx
import { Button } from '@jalik/react-form'

function SubmitButton () {
  return (
    <Button type="submit">Submit</Button>
  )
}
```

#### &lt;Field&gt;

This component handles the field value and logic.  
**The name is required.**

```tsx
import { Field } from '@jalik/react-form'
import { Switch } from '@mantine/core'

function parseBoolean (value) {
  return /^true|1$/gi.test(value)
}

export function AcceptTermsField () {
  return (
    <Field
      component={Switch}
      name="acceptTerms"
      parser={parseBoolean}
      type="checkbox"
      value="true"
    />
  )
}

export function CountryField () {
  return (
    <Field
      name="country"
      type="select"
      options={[
        {
          label: 'French Polynesia',
          value: 'pf'
        },
        {
          label: 'New Zealand',
          value: 'nz'
        }
      ]}
    />
  )
}
```

#### &lt;FieldError&gt;

This component automatically displays the field error (if any).

```tsx
import { Field, FieldError } from '@jalik/react-form'

export function PasswordField () {
  return (
    <>
      <Field
        name="password"
        type="password"
      />
      <FieldError name="password" />
    </>
  )
}
```

#### &lt;Form&gt;

This component contains the form context, so any component nested in a `Form` can access the form
context using `useFormContext()`.

```tsx
import { Button, Field, Form, useForm } from '@jalik/react-form'

export function SignInForm () {
  const form = useForm({
    onSubmit: (values) => Promise.resolve(true)
  })
  return (
    <Form context={form}>
      <Field name="username" />
      <Field name="password" />
      <Button type="submit">Sign in</Button>
    </Form>
  )
} 
```

## Changelog

History of releases is in the [changelog](./CHANGELOG.md).

## License

The code is released under the [MIT License](http://www.opensource.org/licenses/MIT).
