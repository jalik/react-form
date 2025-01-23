/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

import { expect, it } from '@jest/globals'
import { render, renderHook, screen } from '@testing-library/react'
import { Field, Form, useForm } from '../../src'
import '@testing-library/jest-dom/jest-globals'

it('should render component with passed props', () => {
  const hook = renderHook(() =>
    useForm({
      initialValues: { password: null }
    }))

  render(
    <Form context={hook.result.current}>
      <Field data-testid="pass" name="pass" type="password" disabled required />
    </Form>
  )
  const el = screen.getByTestId('pass')
  expect(el).toBeInTheDocument()
  expect(el).toHaveAttribute('disabled')
  expect(el).toHaveAttribute('required')
  expect(el).toHaveAttribute('name', 'pass')
  expect(el).toHaveAttribute('type', 'password')
})
