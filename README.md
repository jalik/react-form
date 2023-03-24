# @jalik/react-form

![GitHub package.json version](https://img.shields.io/github/package-json/v/jalik/react-form.svg)
[![Build Status](https://travis-ci.com/jalik/react-form.svg?branch=master)](https://travis-ci.com/jalik/react-form)
![GitHub](https://img.shields.io/github/license/jalik/react-form.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/jalik/react-form.svg)
[![GitHub issues](https://img.shields.io/github/issues/jalik/react-form.svg)](https://github.com/jalik/react-form/issues)
![npm](https://img.shields.io/npm/dt/@jalik/react-form.svg)

## Why using this ?

This package has many advantages that you could find in other solutions like Formik, React-Hook-Form, Redux Form... however it offers a different DX (developer experience) by trying to be the fastest to learn, and the easiest to use while keeping the code as light as possible, so main goals are flexibility and power, then performance.

The benefits of using this lib are:
- Fields definition (constraints) using a schema
- Managing fields state (value and onChange)
- Managing the list of modified fields
- Managing form status (modified, disabled, validating, submitting...)
- Loading form values using promises
- Auto disabling fields until form is initialized
- Auto disabling fields when form is disabled, not modified, validating or submitting
- Auto parsing of fields value when modified (smart typing or custom parser)
- Auto replacing empty string by null on field change
- Auto validation of fields when modified
- Auto validation of fields on form submission
- Form validation using a schema
- Form errors handling
- Avoiding form submission until fields are valid
- Reset one, several, or all fields
- Handling form submission errors and retries
- Compatible with custom components (like reactstrap)

## Installation

Install this package with `npm install -P @jalik/react-form`.

## Demo

You can play with the lib at this address:
https://codesandbox.io/s/jalik-react-form-demo-wx6hg?file=/src/components/UserForm.js

## Creating a form

Creating a form using the provided components can save you a lot of time by handling the logic for you (modification, validation, states...).

```js
import {
  Button,
  Field,
  Form,
  useForm,
} from '@jalik/react-form';

function authenticate(username, password) {
  return fetch('https://www.mysite.com/auth', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: { 'content-type': 'application/json' },
  });
}

function onSubmit(values) {
  const { username, password } = values;
  return authenticate(username, password);
}

function SignInForm() {
  const form = useForm({
    // WARNING: initialValues does not update the form when values change.
    // If you want to change initialValues, use form.initValues() or pass onLoad to useForm()
    initialValues: {
      username: null,
      password: null,
    },
    // onSubmit needs to return a promise,
    // so the form is aware of the loading state.
    onSubmit,
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

## Loading a form

There are several ways to load a form:
* Loading values in the parent component then passing them to the form component ;
* Loading values inside the form component ;
* Loading values using the `onLoad` option in `useForm()` ;


### Loading values in the parent component then passing them to the form component

```js
import {
  Field,
  Form,
  useForm,
} from '@jalik/react-form';

function loadUser(id) {
  return fetch(`/api/user/${id}`)
    .then((resp) => resp.json());
}

function UserForm(props) {
  const { initialValues } = props;

  const form = useForm({
    initialValues,
    onSubmit: (values) => { /* do something with values */ },
  });

  return (
    <Form context={form}>
      <Field name="firstName" />
      <Field name="lastName" />
    </Form>
  );
}

function UserFormPage() {
  // example with react-router
  const params = useParams();
  const [user, setUser] = useState();
  // user loading logic...
  return (
    <UserForm
      initialValues={user}
      // IMPORTANT: force updating the component whenever the user changes
      key={user}
    />
  );
}
```

### Loading values inside the form component

```js
import { useEffect } from 'react';
import {
  Field,
  Form,
  useForm,
} from '@jalik/react-form';

function loadUser(id) {
  return fetch(`/api/user/${id}`)
    .then((resp) => resp.json());
}

function UserFormPage() {
  // example with react-router
  const params = useParams();

  const form = useForm({
    // initialValues must be null (or omitted)
    // so the form will understand that it will be initialized later.
    initialValues: null,
    onSubmit: (values) => { /* do something with values */ },
  });

  // This example shows how one could load data,
  // but it is recommanded to use a loading library to do that.
  useEffect(() => {
    let mounted = true;
    loadUser(params.id).then((user) => {
      if (mounted) {
        // The only thing important here
        // to set initialValues after the form context has been created.
        form.initValues(user);
      }
    });
    return () => {
      mounted = false;
    };
  }, [form.initValues, params.id]);

  return (
    <Form context={form}>
      <Field name="firstName" />
      <Field name="lastName" />
    </Form>
  );
  return (
    <UserForm id={params.id} />
  );
}
```

### Loading values using the `onLoad` option in `useForm()`

```js
import { useCallback } from 'react';
import {
  Field,
  Form,
  useForm,
} from '@jalik/react-form';

function loadUser(id) {
  return fetch(`/api/user/${id}`)
    .then((resp) => resp.json());
}

function UserFormPage(props) {
  // example with react-router
  const params = useParams();

  const form = useForm({
    initialValues,
    // WARNING: onLoad is called every time it changes,
    // in this case the form will be updated when the id changes.
    onLoad: useCallback(() => loadUser(params.id), [params.id]),
    onSubmit: (values) => { /* do something with values */ },
  });

  return (
    <Form context={form}>
      <Field name="firstName" />
      <Field name="lastName" />
    </Form>
  );
}
```

## Validating a form

Of course, we can set up validation checks on our forms.
We can do that using functions, or a schema (recommended).

### Validating using a schema

In the example below, I am using my own lib `@jalik/schema` to validate the form using a schema, but you could use any lib you want (yup, joi...).

Declare the form schema (structure and constraints).

```js
import Schema from '@jalik/schema';

export const SignInFormSchema = new Schema({
  username: {
    type: 'string',
    required: true,
    minLength: 1,
  },
  password: {
    type: 'string',
    required: true,
    minLength: 1,
  },
});
```

Create some helpers that make the bridge between the schema and the form, so they can be reused in other form components.
These functions should be located in another file and imported when needed.

```js
// The function returned initializes the field's attributes using the schema.
// Example: if a field is required in the schema, it will also be required in the form.
export function createFieldInitializer(schema) {
  // called by onInitializeField
  return (name) => {
    const field = schema.getField(name);
    return field ? {
      max: field.getMax(),
      min: field.getMin(),
      // maxLength: field.getMaxLength(),
      minLength: field.getMinLength(),
      pattern: field.getPattern(),
      required: field.isRequired(),
    } : null;
  };
}

// The function returned validates the field's value using the schema.
export function createFieldValidator(schema) {
  // called by onValidateField
  return (value, name, values) => {
    schema.getField(name).validate(value, {
      context: values,
      rootOnly: true,
    });
  };
}

// The function returned validates the form (all fields) using the schema.
export function createFormValidator(schema) {
  // called by onValidate
  return (values) => new Promise((resolve) => {
    resolve(schema.getErrors(values));
  });
}
```

Then we can create the form using the schema helper functions.

```js
import {
  Button,
  Field,
  FieldError,
  Form,
  useForm,
} from '@jalik/react-form';

function authenticate(username, password) {
  return fetch('https://www.mysite.com/auth', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: { 'content-type': 'application/json' },
  });
}

const onInitializeField = createFieldInitializer(SignInFormSchema);
const onValidate = createFormValidator(SignInFormSchema);
const onValidateField = createFieldValidator(SignInFormSchema);

function SignInForm() {
  const form = useForm({
    initialValues: {
      username: null,
      password: null,
    },
    onInitializeField,
    onValidate,
    onValidateField,
    onSubmit: (values) => authenticate(values.username, values.password),
  });
  return (
    <Form context={form}>
      <Field name="username" />
      <FieldError name="username" />
      <Field name="password" />
      <FieldError name="password" />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## Customizing components

You can use your preferred UI components library and use the provided form components by using the `component` attribute on any form component (`<Field />` or `<Button />`).

Example with Reactstrap:

```js
import { Button as _Button } from 'reactstrap';

export default function RsButton(props) {
  return <Button {...props} component={_Button} />;
}
```

## API

### Hooks

#### useForm()

This hook creates and return the form context (states and functions).

Check `useFormContext()` to see what is returned in the form context.

```js
import { useForm } from '@jalik/react-form';

const form = useForm({
  // required, needs to be "{}" if form is empty
  initialValues: { /* a:1, b:2... */ },
  // optional, replace empty string by null on field change
  // false by default
  nullify: true,
  // optional
  submitDelay: 100,
  // optional
  validateDelay: 200,
  // optional
  onInitializeField(name) {
    // returns field attributes based on name...
    // usefull if you want to centralize this process
    // and return attributes dynamically.
    return { required: true };
  },
  onLoad() {
    // returns a promise with the form data.
    return loadFormValues();
  },
  // required, needs to return a promise
  onSubmit(values) {
    return new Promise((resolve) => {
      // resolve with an optional result, to notify that the form has been submitted
      resolve({ success: true });
      // or reject with error
      reject(new Error('network error'));
    });
  },
  // optional, needs to return a promise
  onValidate(values) {
    return new Promise((resolve) => {
      const errors = {};
      // check for errors...
      if (!values.username) {
        errors.username = 'field is required';
      }
      // resolve with errors details
      resolve(errors);

      // these instructions will resolve with no errors
      resolve({});
      resolve(null);
      resolve(false);
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
      reject(new Error('an error occurred during validation'));
    });
  },
});
```

#### useFormContext()

This hook returns the form context, most of the functions and attributes returned are used internally, so you may not need to know the purpose of all elements.

```js
import { useFormContext } from '@jalik/react-form';

const {
  // tells if the form is disabled
  disabled,
  // the fields errors
  errors,
  // the CSS class to use for invalid fields (used by <Field>)
  invalidClass,
  // the loading error (if any)
  loadError,
  // tells if the onLoad function was successful
  loaded,
  // tells if the onLoad function is running
  loading,
  // tells if the form was modified
  modified,
  // the CSS class to use for modified fields (used by <Field>)
  modifiedClass,
  // the list of modified fields
  modifiedFields,
  // the number of times the form was submitted
  submitCount,
  // the submission error
  submitError,
  // the submission result (returned by the promise)
  submitResult,
  // tells if the form was submitted (go back to false when form is modified)
  submitted,
  // tells if the form is submitting
  submitting,
  // the CSS class to use for valid fields (used by <Field>)
  validClass,
  // the validation error (network or other)
  validateError,
  // tells if the form was validated and is valid
  validated,
  // tells if the form is validating
  validating,
  // the form values
  values,

  // returns the attributes of a field
  getAttributes,
  // returns the initial value of a field
  getInitialValue,
  // returns the current value of a field (same as fiels.name)
  getValue,
  // handler for onChange events
  handleChange,
  // handler for onReset events
  handleReset,
  // handler for onSubmit events
  handleSubmit,
  // resets and sets initial fields values
  initValues,
  // removes a field that does not exist anymore (clears errors)
  remove,
  // resets fields values to their initial values
  reset,
  // sets a field error
  setError,
  // sets errors of multiple fields
  setErrors,
  // sets value of a field
  setValue,
  // sets values of multiple fields
  setValues,
  // submits the form with values (validate first)
  submit,
  // validates fields values without submitting
  validate,
  // validates some fields
  validateFields,
} = useFormContext();
```

### Components

To make life easier, some components are provided.

#### Button

This component is synced with the form, so whenever the form is disabled (because it is validating or submitting), the button is also disabled.

```js
import { Button } from '@jalik/react-form';

function SubmitButton() {
  return (
    <Button type="submit">Submit</Button>
  );
}
```

#### Field

This component handles the value and the changes of an input. It can also parse and validate the field on the fly. Only the name is required.

```js
import { Field } from '@jalik/react-form';

function parseBoolean(value) {
  return /^true|1$/gi.test(value);
}

export function AcceptCheckboxField() {
  return (
    <Field
      name="acceptTerms"
      parser={parseBoolean}
      type="checkbox"
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
        { label: 'French Polynesia', value: 'pf' },
        { label: 'New Zealand', value: 'nz' },
      ]}
    />
  );
}
```

#### FieldError

This component automatically displays the field error (if present).

```js
import {
  Field,
  FieldError,
} from '@jalik/react-form';

export function PasswordField() {
  return (
    <>
      <Field
        name="password"
        type="password"
      />
      <FieldError name="password" />
    </>
  );
}
```

#### Form

This component contains the form context, so any component inside a `Form` is associated to it.

```js
import {
  Button,
  Field,
  Form,
  useForm,
} from '@jalik/react-form';

export function LogInForm() {
  const form = useForm({
    initialValues: {},
    onSubmit(values) {
      // do something...
    },
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
