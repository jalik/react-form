# @jalik/react-form

![GitHub package.json version](https://img.shields.io/github/package-json/v/jalik/react-form.svg)
[![Build Status](https://travis-ci.com/jalik/react-form.svg?branch=master)](https://travis-ci.com/jalik/react-form)
![GitHub](https://img.shields.io/github/license/jalik/react-form.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jalik/react-form.svg)
[![GitHub issues](https://img.shields.io/github/issues/jalik/react-form.svg)](https://github.com/jalik/react-form/issues)
![npm](https://img.shields.io/npm/dt/@jalik/react-form.svg)

## Why using this ?

This package has many advantages that you could find in other solutions like Formik, React-Hook-Form, Redux Form... but it offers a different developer experience, which tries to be much more easy to use and less verbose than other packages, it also focuses on being flexible and powerful.

The benefits of using this lib are:
- Initialization of fields using a schema
- Handling fields state (value and onChange)
- Handling the list of modified fields
- Handling form status (modified, disabled, validating, submitting...)
- Auto disable fields until form is initialized
- Auto disable fields when form is disabled, not modified, validating or submitting
- Auto parsing fields value when modified (smart typing or custom parser)
- Auto validate fields when modified
- Auto validate fields before form submission
- Validate form using a schema
- Handling form errors
- Disable form submission until fields are valid
- Reset one, several, or all fields
- Handling form submission errors and retry
- Compatible with custom components
- <s>Debounce of validation and submission</s> (removed until it's more stable)

## Installation

To install this package using npm, do `npm install --save @jalik/react-form`.

## Documentation

*Since this package started as a personal project and needs a lot of time, documentation will be released in a second time with sandbox examples to play with, please be patient.*

*For those who want to test before everyone, below is a very light and incomplete documentation.*

## Quick start

Here is a basic log in form with minimal options and no validation:

```js
import { Button, Field, Form, useForm } from '@jalik/react-form';

function LogInForm() {
  const form = useForm({
    initialValues: {
      username: null,
      password: null    
    },
    onSubmit(values) {
      // do anything with values and return a promise.
      return fetch('https://www.mysite.com/auth', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'content-type': 'application/json' }
      });
    }
  });
  return (
    <Form context={form}>
      <Field name="username" />
      <Field name="password" />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## Hooks

### useForm()

This hook creates and return the form context (states and functions).

Check `useFormContext()` to see what is returned in the form context.

```js
import { useForm } from '@jalik/react-form';

const form = useForm({
  // required, needs to be "{}" if form is empty
  initialValues: { /* a:1, b:2... */ },
  // optional
  submitDelay: 100,
  // optional
  validateDelay: 200,
  // optional
  onInitializeField(name) {
    // returns field attributes based on name...
    return { required: true };
  },
  // required, needs to return a promise
  onSubmit(values) {
    return new Promise((resolve) => {
      // resolve to notify that the form has been submitted
      resolve();
      // or reject with error
      reject(new Error('network error'));
    });
  },
  // optional, needs to return a promise
  onValidate(values) {
    return new Promise((resolve) => {
      const errors = {};
      // check for errors...
      // resolve "{}" if no error
      // resolve "{username: 'field is required'}" if "username" field is invalid
      resolve(errors);
    });
  },
  // optional, needs to return a promise
  onValidateField(value, name, formValues) {
    return new Promise((resolve, reject) => {
      // resolve with no error
      resolve();
      // or resolve with error
      resolve(new Error('field is not valid'));
      // or resolve with error message
      resolve('field is required');
      // or reject
      reject(new Error('an error occurred during validation'))
    });
  },
});
```

### useFormContext()

This hook returns the form context.

```js
import { useFormContext } from '@jalik/react-form';

const {
  // states
  changes,
  disabled,
  errors,
  invalidClass,
  modified,
  modifiedClass,
  submitCount,
  submitError,
  submitted,
  submitting,
  validClass,
  validateError,
  validated,
  validating,
  values,

  // functions
  getAttributes,
  getInitialValue,
  getValue,
  handleChange,
  handleReset,
  handleSubmit,
  initValues,
  register,
  reset,
  setError,
  setErrors,
  setValue,
  setValues,
  submit,
  unregister,
  validate
} = useFormContext();
```

#### Loading form

If you need to initialize your form asynchronously, use `initValues(values)`.

```js
import { Button, Field, Form, useForm } from '@jalik/react-form';

function fetchUser(userId) {
  return fetch(`https://www.mysite.com/users/${userId}`).then(resp => resp.json());
}

function updateUser(userId, patch) {
  return fetch(`https://www.mysite.com/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    headers: { 'content-type': 'application/json' }
  });
}

function UserForm({ userId }) {
  const form = useForm({
    disabled: true, // to avoid modifications during loading
    onSubmit: (values) => updateUser(userId, values)
  });

  useEffect(() => {
    fetchUser(userId).then((user) => {
      form.initValues(user);
    });
  }, [fetchUser, form.initValues]);

  return (
    <Form context={form}>
      <Field name="username" />
      <Field name="password" />
      <Button type="submit">Save</Button>
    </Form>
  );
}
```

## Components

This lib exposes a few components to make life easier.

### Button

This component is synced with form state, so whenever the form is disabled (because it is validating or submitting), the button is also disabled.

```js
import { Button } from '@jalik/react-form';

<Button>Just a button</Button>
<Button type="reset">Reset</Button>
<Button type="submit">Submit</Button>
```

### Field

This component handles the value and the changes of an input. It can also parse and validate the field on the fly. Only the name is required.

```js
import { Field } from '@jalik/react-form';

function checkRequired(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
}

function parseBoolean(value) {
 return /^true$/i.test(value);
}

export function AcceptCheckboxField() {
  return (
    <Field
      name="acceptTerms"
      parser={parseBoolean}
      type="checkbox"
      validator={checkRequired}
      value="true"
    />
  );
}
```

This component accepts all input types, plus `select` and `textarea`, by default it is `text`.

```js
import { Field } from '@jalik/react-form';

export function CountrySelectField() {
  return (
    <Field
      name="country"
      type="select"
      options={[
        {label:"French Polynesia", value: 'pf'},
        {label:"New Zealand", value: 'nz'}
      ]}
    />
  );
}
```

### FieldError

This component is a convenient way to display the error of a field without having to handle conditions.

```js
import { Field, FieldError } from '@jalik/react-form';

function checkPassword(value) {
  if (!/[a-zA-Z]/.test(value)) {
    throw new Error('password must contain letters');
  }
  if (!/[0-9]/.test(value)) {
    throw new Error('password must contain numbers');
  }
}

export function PasswordField() {
  return (
    <>
      <Field
        name="password"
        type="password"
        validator={checkPassword}
      />
      <FieldError name="password" />
    </>
  );
}
```

### Form

This component contains the form context, so any component inside a Form is associated to it.

```js
import { Button, Field, Form, useForm } from '@jalik/react-form';

export function LogInForm() {
  const form = useForm({
    initialValues: {},
    onSubmit(values) {
      // do something...
    }
  });
  return (
    <Form context={form}>
      <Field name="username" />
      <Field name="password" />
      <Button type="submit">Submit</Button>
    </Form>
  );
} 
```

## Changelog

History of releases is in the [changelog](./CHANGELOG.md).

## License

The code is released under the [MIT License](http://www.opensource.org/licenses/MIT).
