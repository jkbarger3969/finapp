/* eslint-disable @typescript-eslint/no-explicit-any */
import { set } from "lodash";
import React from "react";

class DefaultValue {
  #_name: string;
  #_defaultValue: any;

  constructor({ name, defaultValue }: { name: string; defaultValue: any }) {
    this.#_name = name;
    this.#_defaultValue = defaultValue;
  }

  get name(): string {
    return this.#_name;
  }

  valueOf() {
    return this.#_defaultValue;
  }
}

class FieldWatcher<T extends string | Field<any>> {
  readonly #_name: string;
  readonly #_watcher: (updateId: symbol) => void;
  readonly #_stateTracker: () => boolean;

  constructor({
    nameOrField,
    form,
    watcher,
    isValueEqual = (a: any, b: any) => a === b,
  }: {
    nameOrField: T;
    form: T extends string ? Form : never;
    watcher: (updateId: symbol) => void;
    isValueEqual?: (a: any, b: any) => boolean;
  }) {
    this.#_watcher = watcher;

    if (nameOrField instanceof Field) {
      this.#_name = nameOrField.props.name;
      this.#_stateTracker = (() => {
        const stateTracker = (function* () {
          interface StateSnapShot {
            props: Omit<FieldProps<T>, "onBlur" | "onChange" | "name">;
            state: FieldState;
          }

          const getSnapShot = (): StateSnapShot => ({
            props: {
              value: nameOrField.props.value,
            },
            state: {
              isValid: nameOrField.state.isValid,
              isValidating: nameOrField.state.isValidating,
              isTouched: nameOrField.state.isTouched,
              isDirty: nameOrField.state.isDirty,
              errors: nameOrField.state.errors,
            },
          });

          let prevState = getSnapShot();

          while (true) {
            const curState = getSnapShot();

            yield !(
              (Object.keys(
                prevState.props
              ) as (keyof StateSnapShot["props"])[]).every((key) => {
                switch (key) {
                  case "value":
                    return isValueEqual(
                      prevState.props[key],
                      curState.props[key]
                    );
                  default:
                    return prevState.props[key] === curState.props[key];
                }
              }) &&
              (Object.keys(
                prevState.state
              ) as (keyof StateSnapShot["state"])[]).every((key) => {
                switch (key) {
                  case "errors":
                    return (
                      prevState.state[key].length ===
                        curState.state[key].length &&
                      prevState.state[key].every(
                        (error, i) => error === curState.state[key][i]
                      )
                    );
                  default:
                    return prevState.state[key] === curState.state[key];
                }
              })
            );

            prevState = curState;
          }
        })();

        // Capture first state
        stateTracker.next();

        return () => stateTracker.next().value;
      })();
    } else {
      this.#_name = nameOrField;
      this.#_stateTracker = (() => {
        const stateTracker = function* (this: FieldWatcher<T>) {
          interface StateSnapShot {
            value: any;
            errors: Error[];
          }

          const getSnapShot = (): StateSnapShot => ({
            value: form.getFieldValue(this.name, false),
            errors: [...form.getFieldErrors(this.name)],
          });

          let prevState = getSnapShot();

          while (true) {
            const curState = getSnapShot();

            yield !(Object.keys(prevState) as (keyof StateSnapShot)[]).every(
              (key) => {
                switch (key) {
                  case "errors":
                    return (
                      prevState[key].length === curState[key].length &&
                      prevState[key].every(
                        (error, i) => error === curState[key][i]
                      )
                    );
                  case "value":
                    return isValueEqual(prevState[key], curState[key]);
                  default:
                    return prevState[key] === curState[key];
                }
              }
            );

            prevState = curState;
          }
        }.call(this);

        // Capture first state
        stateTracker.next();

        return () => stateTracker.next().value;
      })();
    }
  }

  get name(): string {
    return this.#_name;
  }

  run(updateId: symbol) {
    if (this.#_stateTracker()) {
      this.#_watcher(updateId);
    }
  }

  valueOf() {
    return this.#_watcher;
  }
}

class FieldValidator {
  readonly #_name: string;
  readonly #_form: Form;
  readonly #_field: Field<any> | undefined;
  readonly #_validators: Validator<any>[] = [];
  readonly #_errors: Error[] = [];
  #_validating: Promise<boolean> | null = null;

  constructor({ field, form }: { field: string | Field<any>; form: Form }) {
    if (field instanceof Field) {
      this.#_name = field.props.name;
      this.#_field = field;
    } else {
      this.#_name = field;
    }
    this.#_form = form;
  }

  get name(): string {
    return this.#_name;
  }

  errors(): IterableIterator<Error> {
    return this.#_errors.values();
  }

  reset(): void {
    this.#_validating = null;
    this.#_errors.splice(0);
  }

  validate(): Promise<boolean> | boolean {
    let hasPromise = false;

    const value = this.#_form.getFieldValue(this.#_name, true);

    const errors = this.#_validators.reduce((errors, validator) => {
      const error = validator(value, {
        name: this.#_name,
        form: this.#_form,
        field: this.#_field,
      });

      if (error instanceof Promise) {
        hasPromise = true;
        errors.push(error);
      } else if (error) {
        errors.push(error);
      }

      return errors;
    }, [] as (Promise<Error | undefined | null> | Error)[]);

    if (hasPromise) {
      const promise = Promise.all(errors).then((results) => {
        if (this.#_validating !== promise) {
          return this.#_validating || !this.#_errors.length;
        }

        this.#_validating = null;
        const errors = results.filter((error) => !!error) as Error[];
        this.#_errors.splice(0, this.#_errors.length, ...(errors as Error[]));
        return !errors.length;
      }) as Promise<boolean>;

      this.#_validating = promise;

      return promise;
    } else {
      this.#_validating = null;
      this.#_errors.splice(0, this.#_errors.length, ...(errors as Error[]));
      return !errors.length;
    }
  }
}

/**
 * @param value - Always the **dirty** value.
 */
export type Validator<T = unknown> = (
  value: T | undefined,
  context: {
    name: string;
    form: Form;
    field?: Field;
  }
) => Promise<Error | undefined | null> | Error | undefined | null;

export interface FieldProps<T = unknown> {
  onBlur(e?: React.FocusEvent): void;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  value: T;
  name: string;
}

export interface FieldState {
  isValid: boolean;
  isValidating: boolean;
  isTouched: boolean;
  isDirty: boolean;
  errors: Error[];
}

export class Field<T = unknown> {
  readonly #_name: string;
  readonly #_form: Form;
  readonly #_props: FieldProps<T> = (() => {
    const propsDef: {
      [key in keyof FieldProps<T>]: PropertyDescriptor;
    } = {
      onBlur: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: (e?: React.FocusEvent) => {
          this.setTouched(true);
        },
        enumerable: true,
      },
      onChange: {
        value: (e: React.ChangeEvent<HTMLInputElement>) => {
          this.setValue((e.target.value as unknown) as T);
        },
        enumerable: true,
      },
      value: {
        get: () => this.#_form.getFieldValue(this.props.name, false),
        enumerable: true,
      },
      name: {
        get: () => this.#_name,
        enumerable: true,
      },
    };

    return Object.create(null, propsDef);
  })();
  readonly #_state: FieldState = (() => {
    const stateDef: {
      [key in keyof FieldState]: PropertyDescriptor;
    } = {
      isValid: {
        get: () => this.#_form.isFieldValid(this.props.name),
        enumerable: true,
      },
      isValidating: {
        get: () => this.#_form.isFieldValidating(this.props.name),
        enumerable: true,
      },
      isTouched: {
        get: () => this.#_form.isFieldTouched(this),
        enumerable: true,
      },
      isDirty: {
        get: () => this.#_form.isFieldDirty(this.props.name),
        enumerable: true,
      },
      errors: {
        get: () => [...this.#_form.getFieldErrors(this.props.name)],
        enumerable: true,
      },
    };
    return Object.create(null, stateDef);
  })();

  constructor({ name, form }: { name: string; form: Form }) {
    this.#_name = name;
    this.#_form = form;

    // Add accessors to instance and make enumerable.
    Object.defineProperties(
      this,
      ["props", "state"].reduce((props, prop) => {
        props[prop] = {
          ...Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), prop),
          enumerable: true,
        } as PropertyDescriptor;
        return props;
      }, {} as PropertyDescriptorMap)
    );
  }

  get props(): FieldProps<T> {
    return this.#_props;
  }
  get state(): FieldState {
    return this.#_state;
  }
  readonly setValue = (value?: T) =>
    this.#_form.setFieldValue(this.props.name, value);
  readonly setTouched = (touched: boolean) =>
    this.#_form.setFieldTouched(this, touched);
  readonly validate = (): Promise<boolean> | boolean =>
    this.#_form.validateField(this.props.name);

  readonly reset = (): void => this.#_form.resetField(this.props.name);
}

export interface SubmitState {
  event?: React.FormEvent<HTMLFormElement>;
  dirtyValues: Record<string, unknown>;
  values: Record<string, unknown>;
  form: Form;
}
export type OnSubmitCb = (submitState: SubmitState) => Promise<void> | void;

export type OnSubmit =
  | OnSubmitCb
  | {
      onStart?: OnSubmitCb;
      onInvalid?: (
        submitState: SubmitState & { errors: Map<string, Error[]> }
      ) => Promise<void> | void;
      onSubmit: OnSubmitCb;
      onError?: (
        submitState: SubmitState & { error: Error }
      ) => Promise<void> | void;
      onSuccess?: OnSubmitCb;
    };

export class Form {
  readonly #_fields = new Set<Field<any>>();
  readonly #_values = new Map<string, any>();
  readonly #_defaultValues = new Set<DefaultValue>();
  readonly #_touchedFields = new WeakSet<Field<any>>();
  readonly #_validatingFields = new Map<string, Promise<boolean>>();
  #_validatingAll: Promise<boolean> | null = null;
  #_submitCount = 0;
  #_isSubmitting = false;
  #_isSubmitted = false;
  #_submissionError: Error | null = null;

  readonly #_fieldValidators = new Set<FieldValidator>();

  readonly #_fieldWatchers = new Set<FieldWatcher<any>>();
  readonly #_formWatchers = new Set<(updateId: symbol) => void>();

  readonly #_runFormStateTracker = (() => {
    const stateTracker = function* (this: Form) {
      type StateSnapShot = Omit<
        Form,
        | "isFieldRegistered"
        | "getRegisteredField"
        | "setFieldValue"
        | "getFieldValue"
        | "getFieldDefaultValue"
        | "isFieldValid"
        | "isFieldValidating"
        | "isFieldTouched"
        | "setFieldTouched"
        | "isFieldDirty"
        | "getFieldErrors"
        | "validateField"
        | "validateAll"
        | "submit"
        | "handleSubmit"
        | "fields"
        | "values"
        | "errors"
        | "getValues"
        | "setTouchedAll"
        | "resetFieldErrors"
        | "resetAllErrors"
        | "resetField"
        | "resetForm"
        | "resetSubmitCount"
        | "resetSubmitted"
        | "resetSubmissionError"
      >;

      const getSnapShot = (): StateSnapShot => ({
        isDirty: this.isDirty,
        isValid: this.isValid,
        isValidating: this.isValidating,
        isSubmitted: this.isSubmitted,
        isSubmitting: this.isSubmitting,
        submitCount: this.submitCount,
        submissionError: this.submissionError,
      });

      let prevState = getSnapShot();

      while (true) {
        const curState = getSnapShot();

        yield !(Object.keys(prevState) as (keyof StateSnapShot)[]).every(
          (key) => prevState[key] === curState[key]
        );

        prevState = curState;
      }
    }.call(this);

    // Capture first state
    stateTracker.next();

    return (updateId = Symbol()) => {
      if (stateTracker.next()) {
        for (const formWatcher of this.#_formWatchers) {
          formWatcher(updateId);
        }
      }
    };
  })();

  #_runFieldStateTrackers(name: string, updateId = Symbol()): void {
    for (const fieldWatcher of this.#_fieldWatchers) {
      if (fieldWatcher.name === name) {
        fieldWatcher.run(updateId);
      }
    }

    this.#_runFormStateTracker(updateId);
  }

  readonly #_onSubmit: Exclude<OnSubmit, OnSubmitCb>;

  constructor({ onSubmit }: { onSubmit: OnSubmit }) {
    this.#_onSubmit =
      typeof onSubmit === "function"
        ? {
            onSubmit,
          }
        : onSubmit;

    // Add accessors to instance and make enumerable.
    Object.defineProperties(
      this,
      [
        "isDirty",
        "isValid",
        "isValidating",
        "isSubmitted",
        "isSubmitting",
        "submitCount",
        "submissionError",
      ].reduce((props, prop) => {
        props[prop] = {
          ...Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), prop),
          enumerable: true,
        } as PropertyDescriptor;
        return props;
      }, {} as PropertyDescriptorMap)
    );
  }

  get isDirty(): boolean {
    return !!this.#_values.size;
  }
  get isValid(): boolean {
    return !!this.errors().next().done;
  }
  get isValidating(): boolean {
    return !!this.#_validatingFields.size;
  }
  get isSubmitted(): boolean {
    return this.#_isSubmitted;
  }
  get isSubmitting(): boolean {
    return this.#_isSubmitting;
  }
  get submitCount(): number {
    return this.#_submitCount;
  }
  get submissionError(): Error | null {
    return this.#_submissionError;
  }

  readonly isFieldRegistered = (name: string): boolean =>
    !!this.getRegisteredField(name);
  readonly getRegisteredField = (name: string): Field | undefined => {
    for (const field of this.fields()) {
      if (field.props.name === name) {
        return field;
      }
    }
  };

  readonly setFieldValue = (name: string, value: any): void => {
    if (value == undefined) {
      this.#_values.delete(name);
    } else {
      this.#_values.set(name, value);
    }

    //NOTE: validateField calls state trackers
    this.validateField(name);
  };
  readonly getFieldValue = <T = unknown>(
    name: string,
    dirtyOnly = true
  ): T | undefined => {
    if (this.#_values.has(name) || dirtyOnly) {
      return this.#_values.get(name);
    } else {
      return this.getFieldDefaultValue(name);
    }
  };
  readonly getFieldDefaultValue = <T = unknown>(
    name: string
  ): T | undefined => {
    for (const defaultValue of this.#_defaultValues) {
      if (name === defaultValue.name) {
        return defaultValue.valueOf();
      }
    }
  };

  readonly isFieldValid = (name: string): boolean =>
    !!this.getFieldErrors(name).next().done;
  readonly isFieldValidating = (name: string): boolean =>
    this.#_validatingFields.has(name);
  readonly isFieldTouched = (field: Field<any>): boolean =>
    this.#_touchedFields.has(field);
  readonly setFieldTouched = (
    field: Field<any>,
    touched: boolean,
    { updateId }: { updateId?: symbol } = {}
  ): void => {
    if (touched) {
      this.#_touchedFields.add(field);
    } else {
      this.#_touchedFields.delete(field);
    }
    this.#_runFieldStateTrackers(field.props.name, updateId);
  };
  readonly setTouchedAll = (
    touched: boolean,
    { updateId = Symbol() }: { updateId?: symbol } = {}
  ): void => {
    for (const field of this.fields()) {
      this.setFieldTouched(field, touched, { updateId });
    }
  };

  readonly isFieldDirty = (name: string): boolean => this.#_values.has(name);
  readonly getFieldErrors = function* (
    this: Form,
    name: string
  ): IterableIterator<Error> {
    for (const fieldValidator of this.#_fieldValidators) {
      if (name === fieldValidator.name) {
        yield* fieldValidator.errors();
      }
    }
  }.bind(this);

  readonly validateField = (
    name: string,
    { updateId }: { updateId?: symbol } = {}
  ): Promise<boolean> | boolean => {
    let hasPromise = false;

    const results: (Promise<boolean> | boolean)[] = [];

    for (const fieldValidator of this.#_fieldValidators) {
      if (name === fieldValidator.name) {
        const result = fieldValidator.validate();

        if (result instanceof Promise) {
          hasPromise = true;
          results.push(result);
        } else {
          results.push(result);
        }
      }
    }

    if (hasPromise) {
      const promise = Promise.all(results).then((results) => {
        if (this.#_validatingFields.get(name) !== promise) {
          return this.#_validatingFields.get(name) || this.isFieldValid(name);
        }
        this.#_validatingFields.delete(name);
        this.#_runFieldStateTrackers(name, updateId);
        return results.every((result) => result);
      });

      this.#_validatingFields.set(name, promise);
      this.#_runFieldStateTrackers(name); // Do NOT use updatedId here.
      return promise;
    } else {
      this.#_validatingFields.delete(name);
      this.#_runFieldStateTrackers(name, updateId);
      return results.every((result) => result);
    }
  };
  readonly validateAll = ({ updateId = Symbol() }: { updateId?: symbol } = {}):
    | Promise<boolean>
    | boolean => {
    let hasPromise = false;

    const results: (Promise<boolean> | boolean)[] = [];

    const validatedFields = new Set<string>();

    for (const { name } of this.#_fieldValidators) {
      if (!validatedFields.has(name)) {
        validatedFields.add(name);
        const result = this.validateField(name, { updateId });
        if (result instanceof Promise) {
          hasPromise = true;
        }
        results.push(result);
      }
    }

    if (hasPromise) {
      const promise = Promise.all(results).then((results) => {
        if (this.#_validatingAll !== promise) {
          return this.#_validatingAll || this.isValid;
        }
        this.#_validatingAll = null;
        return results.every((result) => result);
      }) as Promise<boolean>;

      this.#_validatingAll = promise;

      return promise;
    } else {
      this.#_validatingAll = null;
      return results.every((result) => result);
    }
  };

  /**
   * Validates and sets all fields touched.  If there are no errors, calls the onSubmit callback.
   * @returns {Promise<Map<string, Error[]>>} when submission fails validation.
   * @returns {Promise<Error>} when user defined onSubmit callback throws or rejects with an error.
   */
  readonly submit = async (
    event?: React.FormEvent<HTMLFormElement>
  ): Promise<Error | Map<string, Error[]> | undefined> => {
    if (this.#_onSubmit.onStart) {
      this.#_onSubmit.onStart({
        event,
        dirtyValues: this.getValues(true),
        values: this.getValues(false),
        form: this,
      });
    }

    const startUpdateId = Symbol();

    this.#_isSubmitting = true;
    this.#_submitCount++;
    this.setTouchedAll(true);

    const validateResult = this.validateAll({ updateId: startUpdateId });

    this.#_runFormStateTracker(startUpdateId);

    const isValid =
      validateResult instanceof Promise ? await validateResult : validateResult;

    if (!isValid) {
      this.#_isSubmitting = false;

      const errors = new Map(this.errors());

      this.#_runFormStateTracker();

      if (this.#_onSubmit.onInvalid) {
        this.#_onSubmit.onInvalid({
          event,
          dirtyValues: this.getValues(true),
          values: this.getValues(false),
          form: this,
          errors,
        });
      }

      return errors;
    }

    try {
      const submitResult = this.#_onSubmit.onSubmit({
        event,
        dirtyValues: this.getValues(true),
        values: this.getValues(false),
        form: this,
      });

      if (submitResult instanceof Promise) {
        await submitResult;
      }
    } catch (error) {
      this.#_isSubmitting = false;

      this.#_runFormStateTracker();

      if (this.#_onSubmit.onError) {
        this.#_onSubmit.onError({
          event,
          dirtyValues: this.getValues(true),
          values: this.getValues(false),
          form: this,
          error,
        });
      }

      return error;
    }

    this.#_isSubmitting = false;
    this.#_isSubmitted = true;

    this.#_runFormStateTracker();

    if (this.#_onSubmit.onSuccess) {
      this.#_onSubmit.onSuccess({
        event,
        dirtyValues: this.getValues(true),
        values: this.getValues(false),
        form: this,
      });
    }
  };
  readonly handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    this.submit(event);
  };

  readonly fields = (): IterableIterator<Field> => this.#_fields.values();
  readonly values = function* (
    this: Form,
    dirtyOnly = true
  ): IterableIterator<[string, unknown]> {
    const yieldedKeys = new Set<string>();

    for (const keyVal of this.#_values) {
      yieldedKeys.add(keyVal[0]);
      yield keyVal;
    }

    if (!dirtyOnly) {
      for (const defaultValue of this.#_defaultValues) {
        if (!yieldedKeys.has(defaultValue.name)) {
          yieldedKeys.add(defaultValue.name);
          const value = defaultValue.valueOf();
          if (value !== undefined) {
            yield [defaultValue.name, value];
          }
        }
      }
    }
  }.bind(this);
  readonly errors = function* (
    this: Form
  ): IterableIterator<[string, Error[]]> {
    const checkedFields = new Set<string>();

    for (const { name } of this.#_fieldValidators) {
      if (!checkedFields.has(name)) {
        const errors = [...this.getFieldErrors(name)];
        if (errors.length) {
          yield [name, errors];
        }
      }
    }
  }.bind(this);
  readonly getValues = (dirtyOnly = true): Record<string, unknown> => {
    const valueObj = {} as Record<string, unknown>;

    for (const [name, value] of this.values(dirtyOnly)) {
      set(valueObj, name, value);
    }

    return valueObj;
  };

  readonly resetFieldErrors = (
    name: string,
    { updateId }: { updateId?: symbol } = {}
  ): void => {
    for (const fieldValidator of this.#_fieldValidators) {
      if (fieldValidator.name === name) {
        fieldValidator.reset();
      }
    }
    this.#_runFieldStateTrackers(name, updateId);
  };

  readonly resetAllErrors = ({
    updateId = Symbol(),
  }: { updateId?: symbol } = {}): void => {
    const resetFields = new Set<string>();

    for (const validator of this.#_fieldValidators) {
      if (!resetFields.has(validator.name)) {
        resetFields.add(validator.name);
        this.resetFieldErrors(validator.name, { updateId });
      }
    }
  };

  readonly resetField = (
    name: string,
    { updateId = Symbol() }: { updateId?: symbol } = {}
  ): void => {
    // Reset Errors
    this.resetFieldErrors(name, { updateId });

    this.#_values.delete(name);

    const field = this.getRegisteredField(name);
    if (field) {
      this.setFieldTouched(field, false, { updateId });
    }

    this.#_runFieldStateTrackers(name, updateId);
  };

  /**
   * Sets {@link Form.submitCount} to `0`.
   */
  readonly resetSubmitCount = ({ updateId }: { updateId?: symbol } = {}) => {
    this.#_submitCount = 0;
    this.#_runFormStateTracker(updateId);
  };

  /**
   * Sets {@link Form.isSubmitted} to `false`.
   */
  readonly resetSubmitted = ({ updateId }: { updateId?: symbol } = {}) => {
    this.#_isSubmitted = false;
    this.#_runFormStateTracker(updateId);
  };

  /**
   * Sets {@link Form.submissionError} to `null`.
   */
  readonly resetSubmissionError = ({
    updateId,
  }: { updateId?: symbol } = {}) => {
    this.#_submissionError = null;
    this.#_runFormStateTracker(updateId);
  };

  /**
   * Resets all values, errors, and submission status data.  Resets **everything**.
   */
  readonly resetForm = ({
    updateId = Symbol(),
  }: { updateId?: symbol } = {}): void => {
    const resetFields = new Set<string>();

    for (const {
      props: { name },
    } of this.#_fields) {
      resetFields.add(name);
      this.resetField(name, { updateId });
    }

    for (const validator of this.#_fieldValidators) {
      if (!resetFields.has(validator.name)) {
        resetFields.add(validator.name);
        this.resetField(validator.name, { updateId });
      }
    }

    for (const name of this.#_values.keys()) {
      if (!resetFields.has(name)) {
        this.resetField(name, { updateId });
      }
    }

    this.resetSubmitCount({ updateId });
    this.resetSubmitted({ updateId });
    this.resetSubmissionError({ updateId });

    this.#_runFormStateTracker(updateId);
  };
}
