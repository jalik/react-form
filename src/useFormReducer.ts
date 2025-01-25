/*
 * This file is licensed under the MIT License (MIT)
 * Copyright (c) 2025 Karl STEIN
 */

export type Errors<E = Error> = Record<string, E | undefined | null>;
export type ModifiedFields = Record<string, boolean>;
export type TouchedFields = Record<string, boolean>;
export type Values = Record<string, any>;

export interface FormState<V extends Values = Values, E = Error, R = any> {
  /**
   * Enables debugging.
   */
  debug: boolean;
  /**
   * Disables all fields and buttons.
   */
  disabled?: boolean;
  /**
   * The number of times the form was submitted (count is reset on success).
   */
  submitCount: number;
  /**
   * The submit error.
   */
  submitError?: Error;
  /**
   * The submit result returned by onSubmit promise.
   */
  submitResult?: R;
  /**
   * Tells if the form was submitted successfully.
   */
  submitted: boolean;
  /**
   * Tells if the form is submitting.
   */
  submitting: boolean;
}
