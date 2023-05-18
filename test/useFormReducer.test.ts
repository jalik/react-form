/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2023 Karl STEIN
 */

import { describe, expect, it } from '@jest/globals'
import useFormReducer, {
  ACTION_CLEAR,
  ACTION_CLEAR_ERRORS,
  ACTION_CLEAR_TOUCHED_FIELDS,
  ACTION_INIT_VALUES,
  ACTION_LOAD,
  ACTION_LOAD_ERROR,
  ACTION_LOAD_SUCCESS,
  ACTION_REMOVE,
  ACTION_RESET,
  ACTION_RESET_VALUES,
  ACTION_SET_ERRORS,
  ACTION_SET_TOUCHED_FIELDS,
  ACTION_SET_VALUES,
  ACTION_SUBMIT,
  ACTION_SUBMIT_ERROR,
  ACTION_SUBMIT_SUCCESS,
  ACTION_VALIDATE,
  ACTION_VALIDATE_ERROR,
  ACTION_VALIDATE_FAIL,
  ACTION_VALIDATE_SUCCESS,
  Errors,
  FormAction,
  initialState
} from '../src/useFormReducer'
import { build, clone, hasDefinedValues, resolve } from '../src/utils'

const validationOptions = {
  validateOnChange: true,
  validateOnInit: true,
  validateOnSubmit: true,
  validateOnTouch: true
}

const stateWithoutInitialValues = {
  ...initialState,
  ...validationOptions
}

const stateWithInitialValues = {
  ...stateWithoutInitialValues,
  initialValues: {
    username: 'jalik',
    gender: 'male'
  },
  values: {
    username: 'jalik',
    gender: 'male'
  }
}

const stateWithInitialValuesAndModifiedFields = {
  ...stateWithInitialValues,
  modified: true,
  modifiedFields: {
    username: true,
    gender: true
  },
  touched: true,
  touchedFields: {
    username: true,
    gender: true
  },
  values: {
    username: 'jalik1234',
    gender: 'male'
  }
}

const stateWithInitialValuesAndErrors = {
  ...stateWithInitialValuesAndModifiedFields,
  errors: {
    username: new Error('invalid username'),
    gender: new Error('invalid gender')
  },
  hasError: true
}

const stateValidated = {
  ...stateWithInitialValuesAndModifiedFields,
  validated: true
}

const stateValidatedWithSubmitError = {
  ...stateValidated,
  submitError: new Error('Network error'),
  submitCount: 2
}

describe('useFormReducer(state, action)', () => {
  describe(`with action "${ACTION_CLEAR}"`, () => {
    describe('with data.fields empty or undefined', () => {
      const action: FormAction = {
        type: ACTION_CLEAR
      }

      it('should clear all values', () => {
        const state =
          stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual({ ...state, ...initialState })
      })
    })

    describe('with data.fields not empty', () => {
      const action: FormAction = {
        type: ACTION_CLEAR,
        data: { fields: ['username'] }
      }

      it('should clear selected fields values', () => {
        const state =
          stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        const errors = { ...state.errors }
        const modifiedFields = { ...state.modifiedFields }
        const touchedFields = { ...state.touchedFields }
        let initialValues = clone(state.initialValues)
        let values = clone(state.values)

        action.data.fields.forEach((name: string) => {
          delete errors[name]
          delete modifiedFields[name]
          delete touchedFields[name]
          initialValues = build(name, undefined, initialValues)
          values = build(name, undefined, values)
        })

        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          initialValues,
          modified: hasDefinedValues(modifiedFields),
          modifiedFields,
          touched: hasDefinedValues(touchedFields),
          touchedFields,
          values,
          validateError: undefined,
          validated: false
        })
      })
    })
  })

  describe(`with action "${ACTION_CLEAR_ERRORS}"`, () => {
    describe('with data.fields empty or undefined', () => {
      const action: FormAction = {
        type: ACTION_CLEAR_ERRORS
      }

      it('should clear all errors', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual({
          ...state,
          errors: {},
          hasError: false
        })
      })
    })

    describe('with data.fields not empty', () => {
      const action: FormAction = {
        type: ACTION_CLEAR_ERRORS,
        data: { fields: ['username'] }
      }

      it('should clear selected fields errors', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        const errors = { ...state.errors }
        action.data.fields.forEach((name: string) => {
          delete errors[name]
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors)
        })
      })
    })
  })

  describe(`with action "${ACTION_CLEAR_TOUCHED_FIELDS}"`, () => {
    describe('with data.fields empty or undefined', () => {
      const action: FormAction = {
        type: ACTION_CLEAR_TOUCHED_FIELDS
      }

      it('should clear all touched fields', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual({
          ...state,
          touched: false,
          touchedFields: {}
        })
      })
    })

    describe('with data.fields not empty', () => {
      const action: FormAction = {
        type: ACTION_CLEAR_TOUCHED_FIELDS,
        data: { fields: ['username'] }
      }

      it('should clear selected touched fields', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        const touchedFields = { ...state.touchedFields }
        action.data.fields.forEach((name) => {
          delete touchedFields[name]
        })
        expect(newState).toStrictEqual({
          ...state,
          touched: hasDefinedValues(touchedFields),
          touchedFields
        })
      })
    })
  })

  describe(`with action "${ACTION_INIT_VALUES}"`, () => {
    const action: FormAction = {
      type: ACTION_INIT_VALUES,
      data: { values: { username: 'jalik' } }
    }

    it('should set initial values', () => {
      const state = stateWithoutInitialValues
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        initialized: true,
        initialValues: action.data.values,
        needValidation: state.validateOnInit,
        values: action.data.values
      })
    })
  })

  describe(`with action "${ACTION_LOAD}"`, () => {
    const action: FormAction = {
      type: ACTION_LOAD
    }

    it('should set load state', () => {
      const state = stateWithoutInitialValues
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: true,
        loading: true
      })
    })
  })

  describe(`with action "${ACTION_LOAD_ERROR}"`, () => {
    const action: FormAction = {
      type: ACTION_LOAD_ERROR,
      error: new Error('Network error')
    }

    it('should set load error', () => {
      const state = useFormReducer(stateWithoutInitialValues, {
        type: ACTION_LOAD
      })
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: false,
        loadError: action.error,
        loading: false
      })
    })
  })

  describe(`with action "${ACTION_LOAD_SUCCESS}"`, () => {
    const action: FormAction = {
      type: ACTION_LOAD_SUCCESS,
      data: { values: { username: 'jalik' } }
    }

    it('should set load success', () => {
      const state = useFormReducer(stateWithoutInitialValues, {
        type: ACTION_LOAD
      })
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: false,
        initialValues: action.data.values,
        initialized: true,
        loaded: true,
        loading: false,
        values: action.data.values
      })
    })
  })

  describe(`with action "${ACTION_REMOVE}"`, () => {
    const action: FormAction = {
      type: ACTION_REMOVE,
      data: { fields: ['username'] }
    }

    it('should remove fields', () => {
      const state = stateWithInitialValuesAndErrors
      const newState = useFormReducer(state, action)
      const errors = { ...state.errors }
      delete errors.username
      const modifiedFields = { ...state.modifiedFields }
      delete modifiedFields.username
      const touchedFields = { ...state.touchedFields }
      delete touchedFields.username
      const values = { ...state.values }
      delete values.username
      expect(newState).toStrictEqual({
        ...state,
        errors,
        hasError: hasDefinedValues(errors),
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
        values
      })
    })

    describe('with undefined fields', () => {
      it('should execute normally', () => {
        const state = stateWithoutInitialValues
        const newState = useFormReducer(state, action)
        const errors = { ...state.errors }
        const modifiedFields = { ...state.modifiedFields }
        const touchedFields = { ...state.touchedFields }
        const values = { ...state.values }
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          modified: hasDefinedValues(modifiedFields),
          modifiedFields,
          touched: hasDefinedValues(touchedFields),
          touchedFields,
          values
        })
      })
    })
  })

  describe(`with action "${ACTION_RESET}"`, () => {
    const action: FormAction = {
      type: ACTION_RESET
    }

    describe('during validation', () => {
      it('should ignore action', () => {
        const state = useFormReducer(stateWithInitialValuesAndErrors, {
          type: ACTION_VALIDATE
        })
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual(state)
      })
    })

    it('should reset values', () => {
      const newState = useFormReducer(stateWithInitialValuesAndErrors, action)
      expect(newState).toStrictEqual(stateWithInitialValues)
    })
  })

  describe(`with action "${ACTION_RESET_VALUES}"`, () => {
    const action: FormAction = {
      type: ACTION_RESET_VALUES,
      data: { fields: ['username'] }
    }

    describe('during validation', () => {
      it('should ignore action', () => {
        const state = useFormReducer(stateWithInitialValuesAndErrors, {
          type: ACTION_VALIDATE
        })
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual(state)
      })
    })

    it('should reset fields', () => {
      const state = stateWithInitialValuesAndErrors
      const newState = useFormReducer(state, action)
      const errors = { ...state.errors }
      delete errors.username
      const modifiedFields = { ...state.modifiedFields }
      delete modifiedFields.username
      const touchedFields = { ...state.touchedFields }
      delete touchedFields.username
      const values = { ...state.values }
      delete values.username
      expect(newState).toStrictEqual({
        ...state,
        errors,
        hasError: hasDefinedValues(errors),
        modified: hasDefinedValues(modifiedFields),
        modifiedFields,
        touched: hasDefinedValues(touchedFields),
        touchedFields,
        validateError: undefined,
        validated: false,
        values: {
          ...state.values,
          username: state.initialValues.username
        }
      })
    })
  })

  describe(`with action "${ACTION_SET_ERRORS}"`, () => {
    describe('with data.partial = false', () => {
      it('should replace all errors', () => {
        const state = stateWithInitialValuesAndErrors
        const action: FormAction = {
          type: ACTION_SET_ERRORS,
          data: {
            partial: false,
            errors: { username: new Error('Random error') }
          }
        }
        const newState = useFormReducer(state, action)
        const errors = {}
        Object.entries(action.data.errors).forEach(([field, error]) => {
          if (error) {
            errors[field] = error
          }
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors)
        })
      })
    })

    describe('with data.partial = true', () => {
      it('should set errors partially', () => {
        const state = stateWithInitialValuesAndErrors
        const action: FormAction = {
          type: ACTION_SET_ERRORS,
          data: {
            partial: true,
            errors: { username: new Error('Random error') }
          }
        }
        const newState = useFormReducer(state, action)
        const errors = { ...state.errors }
        Object.entries(action.data.errors).forEach(([field, error]) => {
          if (error) {
            errors[field] = error
          }
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors)
        })
      })
    })
  })

  describe(`with action "${ACTION_SET_VALUES}"`, () => {
    const baseAction: FormAction = {
      type: ACTION_SET_VALUES,
      data: { values: { username: 'naruto' } }
    }

    describe('with data.partial = false', () => {
      const action = {
        ...baseAction,
        data: {
          ...baseAction.data,
          partial: false
        }
      }

      it('should set all values', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        const errors = clone(state.errors)
        const modifiedFields = clone(state.modifiedFields)
        const { data } = action
        let values = {}

        Object.entries(data.values).forEach(([name, value]) => {
          values = build(name, value, values)

          // Compare initial value to detect change.
          modifiedFields[name] = value !== resolve(name, state.initialValues)

          // Do not clear errors when validation is triggered
          // to avoid errors to disappear/appear quickly during typing.
          if (!data.validate) {
            delete errors[name]
          }
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          modified: true,
          modifiedFields,
          needValidation: data.validate === true
            ? Object.keys(data.values)
            : state.needValidation,
          validated: false,
          values
        })
      })
    })

    describe('with data.partial = true', () => {
      const action = {
        ...baseAction,
        data: {
          ...baseAction.data,
          partial: true
        }
      }

      it('should set selected fields values', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        const errors = clone(state.errors)
        const modifiedFields = clone(state.modifiedFields)
        const { data } = action
        let values = clone(state.values)

        Object.entries(data.values).forEach(([name, value]) => {
          values = build(name, value, values)

          // Compare initial value to detect change.
          modifiedFields[name] = value !== resolve(name, state.initialValues)

          // Do not clear errors when validation is triggered
          // to avoid errors to disappear/appear quickly during typing.
          if (!data.validate) {
            delete errors[name]
          }
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          modified: true,
          modifiedFields,
          needValidation: data.validate === true
            ? Object.keys(data.values)
            : state.needValidation,
          validated: false,
          values
        })
      })
    })

    describe('with data.validate = false', () => {
      const action = {
        ...baseAction,
        data: {
          ...baseAction.data,
          validate: false
        }
      }

      it('should set values', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        const errors = { ...state.errors }
        const modifiedFields = { ...state.modifiedFields }
        let values = {}
        Object.entries(action.data.values).forEach(([name, value]) => {
          values = build(name, value, values)
          modifiedFields[name] = value !== resolve(name, state.initialValues)
          delete errors[name]
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          modified: true,
          modifiedFields,
          validated: false,
          values
        })
      })
    })

    describe('with data.validate = true', () => {
      const action = {
        ...baseAction,
        data: {
          ...baseAction.data,
          validate: true
        }
      }

      it('should set values and trigger validation', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, {
          ...action,
          data: {
            ...action.data,
            validate: true
          }
        })
        const errors = { ...state.errors }
        const modifiedFields = { ...state.modifiedFields }
        let values = {}
        Object.entries(action.data.values).forEach(([name, value]) => {
          values = build(name, value, values)
          modifiedFields[name] = value !== resolve(name, state.initialValues)
        })
        expect(newState).toStrictEqual({
          ...state,
          errors,
          hasError: hasDefinedValues(errors),
          modified: true,
          modifiedFields,
          needValidation: Object.keys(action.data.values),
          validated: false,
          values
        })
      })
    })
  })

  describe(`with action "${ACTION_SUBMIT}"`, () => {
    const action: FormAction = {
      type: ACTION_SUBMIT
    }

    it('should set submit state', () => {
      const state = stateValidatedWithSubmitError
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: true,
        submitting: true,
        submitCount: state.submitCount + 1
      })
    })
  })

  describe(`with action "${ACTION_SUBMIT_ERROR}"`, () => {
    const action: FormAction = {
      type: ACTION_SUBMIT_ERROR,
      error: new Error('Server Error')
    }

    it('should set submit error', () => {
      const state = useFormReducer(stateValidatedWithSubmitError, {
        type: ACTION_SUBMIT
      })
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: false,
        submitError: action.error,
        submitting: false
      })
    })
  })

  describe(`with action "${ACTION_SUBMIT_SUCCESS}"`, () => {
    const action: FormAction = {
      type: ACTION_SUBMIT_SUCCESS,
      data: { result: { success: true } }
    }

    it('should set submit result', () => {
      const state = useFormReducer(stateValidatedWithSubmitError, {
        type: ACTION_SUBMIT
      })
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        ...stateWithoutInitialValues,
        submitResult: action.data.result,
        submitted: true
      })
    })
  })

  describe(`with action "${ACTION_SET_TOUCHED_FIELDS}"`, () => {
    const action: FormAction = {
      type: ACTION_SET_TOUCHED_FIELDS,
      data: { fields: ['username'] }
    }

    describe('with validateOnTouch = false', () => {
      it('should set touched fields', () => {
        const state = {
          ...stateWithInitialValues,
          validateOnTouch: false
        }
        const newState = useFormReducer(state, action)
        const touchedFields = { ...state.touchedFields }
        action.data.fields.forEach((name) => {
          touchedFields[name] = true
        })
        expect(newState).toStrictEqual({
          ...state,
          touched: true,
          touchedFields
        })
      })
    })

    describe('with validateOnTouch = true', () => {
      it('should set touched fields and add them to validation', () => {
        const state = stateWithInitialValues
        const newState = useFormReducer(state, action)
        const touchedFields = { ...state.touchedFields }
        action.data.fields.forEach((name) => {
          touchedFields[name] = true
        })
        expect(newState).toStrictEqual({
          ...state,
          needValidation: [...action.data.fields],
          touched: true,
          touchedFields
        })
      })
    })

    describe('with option validate = true', () => {
      it('should set touched fields and add them to validation', () => {
        const state = stateWithInitialValues
        const newState = useFormReducer(state, {
          ...action,
          data: {
            ...action.data,
            validate: true
          }
        })
        const touchedFields = { ...state.touchedFields }
        action.data.fields.forEach((name) => {
          touchedFields[name] = true
        })
        expect(newState).toStrictEqual({
          ...state,
          needValidation: [...action.data.fields],
          touched: true,
          touchedFields
        })
      })
    })
  })

  describe(`with action "${ACTION_VALIDATE}"`, () => {
    const action: FormAction = {
      type: ACTION_VALIDATE
    }

    describe('without { data: fields }', () => {
      it('should set validation state', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual({
          ...state,
          disabled: true,
          needValidation: false,
          validating: true
        })
      })
    })

    describe('with { data: fields }', () => {
      const action: FormAction = {
        type: ACTION_VALIDATE,
        data: { fields: ['username'] }
      }

      it('should set validation state', () => {
        const state = stateWithInitialValuesAndErrors
        const newState = useFormReducer(state, action)
        expect(newState).toStrictEqual({
          ...state,
          needValidation: false
        })
      })
    })
  })

  describe(`with action "${ACTION_VALIDATE_ERROR}"`, () => {
    const action: FormAction = {
      type: ACTION_VALIDATE_ERROR,
      error: new Error('Unhandled error')
    }

    it('should set validate error', () => {
      const state = useFormReducer(stateWithInitialValuesAndErrors, {
        type: ACTION_VALIDATE
      })
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: false,
        validating: false,
        validateError: action.error
      })
    })
  })

  describe(`with action "${ACTION_VALIDATE_FAIL}"`, () => {
    const action: FormAction = {
      type: ACTION_VALIDATE_FAIL,
      data: {
        errors: {
          username: new Error('Username already exists'),
          password: undefined
        }
      }
    }

    it('should set validation field errors', () => {
      const state = useFormReducer(stateValidatedWithSubmitError, {
        type: ACTION_VALIDATE
      })
      const newState = useFormReducer(state, action)
      const errors: Errors = {}
      Object.keys(action.data.errors).forEach((name) => {
        // Ignore undefined/null errors
        if (action.data.errors[name]) {
          errors[name] = action.data.errors[name]
        }
      })
      expect(newState).toStrictEqual({
        ...state,
        disabled: false,
        errors,
        hasError: hasDefinedValues(action.data.errors),
        validating: false
      })
    })
  })

  describe(`with action "${ACTION_VALIDATE_SUCCESS}"`, () => {
    const action: FormAction = {
      type: ACTION_VALIDATE_SUCCESS,
      data: { beforeSubmit: false }
    }

    it('should set validate success', () => {
      const state = useFormReducer(stateValidatedWithSubmitError, {
        type: ACTION_VALIDATE
      })
      const newState = useFormReducer(state, action)
      expect(newState).toStrictEqual({
        ...state,
        disabled: action.data.beforeSubmit === true,
        errors: {},
        hasError: false,
        validated: true,
        validating: false,
        validateError: undefined
      })
    })
  })

  describe('with invalid action', () => {
    const action: FormAction = {
      // @ts-ignore
      type: 'INVALID'
    }

    it('should throw an error', () => {
      const state = stateWithInitialValues
      expect(() => {
        useFormReducer(state, action)
      }).toThrow()
    })
  })
})
