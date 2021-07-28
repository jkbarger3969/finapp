/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useEffect,
  PropsWithChildren,
} from "react";
import { set } from "lodash";

class DefaultValue {
  #_name: string;
  #_defaultValue: any;

  constructor({ name, defaultValue }: { name: string; defaultValue: any }) {
    this.#_name = name;
    this.#_defaultValue = defaultValue;
  }

  get name() {
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
    form: formArg,
    watcher,
    isValueEqual = (a: any, b: any) => a === b,
  }: {
    nameOrField: T;
    watcher: (updateId: symbol) => void;
    isValueEqual?: (a: any, b: any) => boolean;
  } & (T extends string ? { form: Form<any> } : { form?: never })) {
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
      const form = formArg as Form<any>;
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
  readonly #_form: Form<any>;
  readonly #_field: Field | undefined = undefined;
  readonly #_validators: Validator<any>[] = [];
  readonly #_errors: Error[] = [];
  #_validating: Promise<boolean> | null = null;

  constructor({
    field,
    form,
    validators,
  }: {
    field: string | Field;
    form: Form<any>;
    validators: Iterable<Validator<any>>;
  }) {
    if (field instanceof Field) {
      this.#_name = field.props.name;
      this.#_field = field;
    } else {
      this.#_name = field;
    }
    this.#_validators.push(...validators);
    this.#_form = form;
  }

  get name() {
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
    }, [] as (Promise<Error | void | null> | Error)[]);

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
export type Validator<
  T = unknown,
  TName extends string = string,
  TFieldDef extends FieldDef = any
> = (
  value: T | undefined,
  context: {
    name: TName;
    form: Form<TFieldDef>;
    field?: Field<T, TName>;
  }
) => Promise<Error | void | null> | Error | void | null;

export interface FieldProps<T = unknown, TName extends string = string> {
  onBlur(e?: React.FocusEvent): void;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  value: T | undefined;
  name: TName;
}

export interface FieldState {
  isValid: boolean;
  isValidating: boolean;
  isTouched: boolean;
  isDirty: boolean;
  errors: Error[];
}

class Field<T = unknown, TName extends string = string> {
  readonly #_name: TName;
  readonly #_form: Form<any>;
  readonly #_shouldUmount: boolean;
  readonly #_props: FieldProps<T, TName> = (() => {
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

  constructor({
    name,
    form,
    shouldUmount,
  }: {
    name: TName;
    form: Form<any>;
    shouldUmount: boolean;
  }) {
    this.#_name = name;
    this.#_form = form;
    this.#_shouldUmount = shouldUmount;

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

  get props(): FieldProps<T, TName> {
    return this.#_props;
  }
  get state(): FieldState {
    return this.#_state;
  }
  get shouldUmount() {
    return this.#_shouldUmount;
  }
  readonly setValue = (value?: T) =>
    this.#_form.setFieldValue(this.props.name, value as any);
  readonly setTouched = (touched: boolean) =>
    this.#_form.setFieldTouched(this, touched);
  readonly validate = (): Promise<boolean> | boolean =>
    this.#_form.validateField(this.props.name);

  readonly reset = (): void => this.#_form.resetField(this.props.name);
}

export interface SubmitState<TFieldDef extends FieldDef> {
  event?: React.FormEvent<HTMLFormElement>;
  dirtyValues: Values<TFieldDef>;
  values: Values<TFieldDef>;
  form: Form<TFieldDef>;
}
export type OnSubmitCb<TFieldDef extends FieldDef> = (
  submitState: SubmitState<TFieldDef>
) => Promise<void> | void;

export type OnSubmit<TFieldDef extends FieldDef> =
  | OnSubmitCb<TFieldDef>
  | {
      onStart?: OnSubmitCb<TFieldDef>;
      onInvalid?: (
        submitState: SubmitState<TFieldDef> & {
          errors: Map<string, Error[]>;
        }
      ) => Promise<void> | void;
      onSubmit: OnSubmitCb<TFieldDef>;
      onError?: (
        submitState: SubmitState<TFieldDef> & {
          error: Error;
        }
      ) => Promise<void> | void;
      onSuccess?: OnSubmitCb<TFieldDef>;
    };

export type UseFormOptions<TFieldDef extends FieldDef> = {
  onSubmit: OnSubmit<TFieldDef>;
  defaultValues?: TFieldDef;
  validators?: ValidatorDefs<TFieldDef>;
};

export class FieldValue<T = unknown> {
  #_value: T;
  constructor(v: T) {
    this.#_value = v;
  }
  valueOf(): T {
    return this.#_value;
  }
  toString(): string {
    return String(this.#_value);
  }
  static value<T = unknown>(value: T): FieldValue<T> {
    return new FieldValue(value);
  }
}

class Form<TFieldDef extends FieldDef> {
  readonly #_fields = new Set<Field<any, Names<TFieldDef>>>();
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
    const stateTracker = function* (this: Form<TFieldDef>) {
      type StateSnapShot = Omit<
        Form<TFieldDef>,
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

  readonly #_onSubmit: Exclude<OnSubmit<TFieldDef>, OnSubmitCb<TFieldDef>>;

  private constructor({ onSubmit }: { onSubmit: OnSubmit<TFieldDef> }) {
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

  readonly isFieldRegistered = (name: Names<TFieldDef>): boolean =>
    !!this.getRegisteredField(name);
  readonly getRegisteredField = <TName extends Names<TFieldDef>>(
    name: TName
  ): Field<PathValue<TFieldDef, TName>, TName> | undefined => {
    for (const field of this.fields()) {
      if (field.props.name === name) {
        return field as any;
      }
    }
  };

  readonly setFieldValue = <TName extends Names<TFieldDef>>(
    name: TName,
    value: PathValue<TFieldDef, TName> | undefined
  ): void => {
    if (value == undefined) {
      this.#_values.delete(name);
    } else {
      this.#_values.set(name, value);
    }

    //NOTE: validateField calls state trackers
    this.validateField(name);
  };
  readonly getFieldValue = <TName extends Names<TFieldDef>>(
    name: TName,
    dirtyOnly = true
  ): PathValue<TFieldDef, TName> | undefined => {
    if (this.#_values.has(name) || dirtyOnly) {
      return this.#_values.get(name);
    } else {
      return this.getFieldDefaultValue(name);
    }
  };
  readonly getFieldDefaultValue = <TName extends Names<TFieldDef>>(
    name: TName
  ): PathValue<TFieldDef, TName> | undefined => {
    for (const defaultValue of this.#_defaultValues) {
      if (name === defaultValue.name) {
        return defaultValue.valueOf();
      }
    }
  };

  readonly isFieldValid = (name: Names<TFieldDef>): boolean =>
    !!this.getFieldErrors(name).next().done;
  readonly isFieldValidating = (name: Names<TFieldDef>): boolean =>
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

  readonly isFieldDirty = (name: Names<TFieldDef>): boolean =>
    this.#_values.has(name);
  readonly getFieldErrors = function* (
    this: Form<TFieldDef>,
    name: string
  ): IterableIterator<Error> {
    for (const fieldValidator of this.#_fieldValidators) {
      if (name === fieldValidator.name) {
        yield* fieldValidator.errors();
      }
    }
  }.bind(this);

  readonly validateField = (
    name: Names<TFieldDef>,
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
      this.#_runFieldStateTrackers(name); // Do NOT use updateId here.
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
        const result = this.validateField(name as Names<TFieldDef>, {
          updateId,
        });
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
  ): Promise<Error | Map<Names<TFieldDef>, Error[]> | undefined> => {
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

  readonly fields = (): IterableIterator<
    Field<PathValue<TFieldDef, Names<TFieldDef>>>
  > => this.#_fields.values();
  readonly values = function* (
    this: Form<TFieldDef>,
    dirtyOnly = true
  ): IterableIterator<
    [Names<TFieldDef>, PathValue<TFieldDef, Names<TFieldDef>>]
  > {
    const yieldedKeys = new Set<string>();

    for (const [name, value] of this.#_values) {
      yieldedKeys.add(name);
      yield [name as Names<TFieldDef>, value];
    }

    if (!dirtyOnly) {
      for (const defaultValue of this.#_defaultValues) {
        if (!yieldedKeys.has(defaultValue.name)) {
          yieldedKeys.add(defaultValue.name);
          const value = defaultValue.valueOf();
          if (value !== undefined) {
            yield [defaultValue.name as Names<TFieldDef>, value];
          }
        }
      }
    }
  }.bind(this);

  readonly errors = function* (
    this: Form<TFieldDef>
  ): IterableIterator<[Names<TFieldDef>, Error[]]> {
    const checkedFields = new Set<string>();

    for (const { name } of this.#_fieldValidators) {
      if (!checkedFields.has(name)) {
        const errors = [...this.getFieldErrors(name)];
        if (errors.length) {
          yield [name as Names<TFieldDef>, errors];
        }
      }
    }
  }.bind(this);
  readonly getValues = (dirtyOnly = true): Values<TFieldDef> => {
    const valueObj = {} as Values<TFieldDef>;

    for (const [name, value] of this.values(dirtyOnly)) {
      set(valueObj, name, value);
    }

    return valueObj;
  };

  readonly resetFieldErrors = (
    name: Names<TFieldDef>,
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
        this.resetFieldErrors(validator.name as Names<TFieldDef>, { updateId });
      }
    }
  };

  readonly resetField = (
    name: Names<TFieldDef>,
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
        this.resetField(validator.name as Names<TFieldDef>, { updateId });
      }
    }

    for (const name of this.#_values.keys()) {
      if (!resetFields.has(name)) {
        this.resetField(name as Names<TFieldDef>, { updateId });
      }
    }

    this.resetSubmitCount({ updateId });
    this.resetSubmitted({ updateId });
    this.resetSubmissionError({ updateId });

    this.#_runFormStateTracker(updateId);
  };

  static useFormContext<
    TFieldDef extends FieldDef = any
  >(): Form<TFieldDef> | null {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useContext(FormContext);
  }

  static #_useFormContext({
    form,
    hookName,
  }: {
    form?: Form<any>;
    hookName: string;
  }): Form<any> {
    const _context = this.useFormContext<any>();

    const context = form || _context;

    if (process.env.NODE_ENV !== "production") {
      if (context === null) {
        throw new TypeError(
          `"FormContext" does exists in the react tree nor provided to "${hookName}" via the "form" argument.`
        );
      }
    }
    return context as Form<any>;
  }

  static #_useDefaultValues(options: {
    defaultValues: FieldDef;
    shouldUmount?: boolean;
    form?: Form<any>;
    updateIds?: {
      mount: symbol;
      unMount: symbol;
    };
  }): void {
    const form = this.#_useFormContext({
      form: options.form,
      hookName: "useDefaultValues",
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state] = useState(() => {
      const defaultValues: DefaultValue[] = [];
      for (const [name, defaultValue] of parseFieldDef(options.defaultValues)) {
        defaultValues.push(
          new DefaultValue({
            name,
            defaultValue,
          })
        );
      }
      return {
        defaultValues,
        shouldUmount: options.shouldUmount ?? true,
        form,
        updateIds: options.updateIds || {
          mount: Symbol(),
          unMount: Symbol(),
        },
      };
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      state.defaultValues.forEach((defaultValue) => {
        state.form.#_defaultValues.add(defaultValue);
        state.form.#_runFieldStateTrackers(
          defaultValue.name,
          state.updateIds.mount
        );
      });

      return () => {
        if (state.shouldUmount) {
          state.defaultValues.forEach((defaultValue) => {
            state.form.#_defaultValues.delete(defaultValue);
            state.form.#_runFieldStateTrackers(
              defaultValue.name,
              state.updateIds.unMount
            );
          });
        }
      };
    }, [state]);
  }

  static useDefaultValues<TFieldDef extends FieldDef>(options: {
    defaultValues: TFieldDef;
    shouldUmount?: boolean;
    form?: Form<TFieldDef>;
  }): void {
    return this.#_useDefaultValues(options);
  }

  static #_useValidators(options: {
    validators: ValidatorDefs<any>;
    shouldUmount?: boolean;
    form?: Form<any>;
    updateIds?: {
      mount: symbol;
      unMount: symbol;
    };
  }): void {
    const form = this.#_useFormContext({
      form: options.form,
      hookName: "useValidators",
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state] = useState(() => {
      const fieldValidators: FieldValidator[] = [];

      for (const [field, validators] of parseValidatorDefs(
        options.validators
      )) {
        fieldValidators.push(
          new FieldValidator({
            field,
            form,
            validators: validators as any,
          })
        );
      }

      return {
        fieldValidators,
        shouldUmount: options.shouldUmount ?? true,
        form,
        updateIds: options.updateIds || {
          mount: Symbol(),
          unMount: Symbol(),
        },
      };
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      state.fieldValidators.forEach((fieldValidators) => {
        state.form.#_fieldValidators.add(fieldValidators);
        state.form.validateField(fieldValidators.name, {
          updateId: state.updateIds.mount,
        });
      });

      return () => {
        if (state.shouldUmount) {
          state.fieldValidators.forEach((fieldValidators) => {
            state.form.#_fieldValidators.delete(fieldValidators);
            state.form.validateField(fieldValidators.name, {
              updateId: state.updateIds.unMount,
            });
          });
        }
      };
    }, [state]);
  }

  static useValidators<TFieldDef extends FieldDef>(options: {
    validators: ValidatorDefs<TFieldDef>;
    shouldUmount?: boolean;
    form?: Form<TFieldDef>;
  }): void {
    return this.#_useValidators(options);
  }

  static useWatcher<T = unknown, TFieldDef extends FieldDef = any>(options: {
    name: string | Field<any>;
    form?: Form<TFieldDef>;
  }): T {
    const form = this.#_useFormContext({
      form: options.form,
      hookName: "useWatcher",
    });

    const [updateId, watcher] = useState(Symbol());
    const [state] = useState(() => {
      const fieldWatcher = new FieldWatcher({
        nameOrField: options.name,
        form,
        watcher,
      });

      form.#_fieldWatchers.add(fieldWatcher);

      return {
        form,
        fieldWatcher,
      };
    });

    useEffect(
      () => () => {
        state.form.#_fieldWatchers.delete(state.fieldWatcher);
      },
      [state]
    );

    return useMemo<T>(
      () =>
        (({
          value: state.form.getFieldValue(state.fieldWatcher.name),
          defaultValue: state.form.getFieldDefaultValue(
            state.fieldWatcher.name
          ),
          errors: [...state.form.getFieldErrors(state.fieldWatcher.name)],
        } as unknown) as T),
      [updateId, state]
    );
  }

  static useForm<TFieldDef extends FieldDef>({
    onSubmit,
    defaultValues,
    validators,
  }: UseFormOptions<TFieldDef>): Form<TFieldDef> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state] = useState(() => {
      const updateIds = {
        mount: Symbol(),
        unMount: Symbol(),
      };
      const form = new Form<TFieldDef>({ onSubmit });
      return {
        form,
        useDefaultValuesOptions: {
          defaultValues: defaultValues || {},
          form,
          shouldUmount: false,
          updateIds,
        },
        useValidatorsOptions: {
          validators: validators || {},
          form,
          shouldUmount: false,
          updateIds,
        },
      };
    });

    this.#_useDefaultValues(state.useDefaultValuesOptions);

    this.#_useValidators(state.useValidatorsOptions);

    return state.form;
  }

  /**
   * @returns the **same** {@link Field} instance for every call to with matching `name` and {@link Form}.  The fist call creates the {@link Field} instance.
   */
  static useField<
    T = unknown,
    TName extends string = string,
    TFieldDef extends FieldDef = any
  >(options: {
    name: TName;
    defaultValue?: T;
    validator?: Validator<any> | Iterable<Validator<any>>;
    form?: Form<TFieldDef>;
    shouldUmount?: boolean;
  }): Field<T, TName> {
    const form = this.#_useFormContext({
      form: options.form,
      hookName: "useField",
    });

    const [, watcher] = useState(Symbol());

    const [state] = useState(() => {
      const shouldUmount = options.shouldUmount ?? true;
      const updateIds = {
        mount: Symbol(),
        unMount: Symbol(),
      };

      const field = (form.getRegisteredField(options.name) ||
        new Field<T, TName>({
          name: options.name,
          form,
          shouldUmount,
        })) as Field<T, TName>;

      const fieldWatcher = new FieldWatcher({
        nameOrField: field,
        watcher,
      });

      form.#_fieldWatchers.add(fieldWatcher);

      return {
        field,
        useDefaultValuesOptions: {
          defaultValues:
            options.defaultValue === undefined
              ? {}
              : { [field.props.name]: new FieldValue(options.defaultValue) },
          form,
          shouldUmount,
          updateIds,
        },
        useValidatorsOptions: {
          validators:
            options.validator === undefined
              ? {}
              : { [field.props.name]: options.validator },
          form,
          shouldUmount,
          updateIds,
        },
        fieldWatcher,
        form,
        updateIds,
      };
    });

    useEffect(() => {
      return () => {
        form.#_fieldWatchers.delete(state.fieldWatcher);

        if (state.field.shouldUmount) {
          state.form.#_values.delete(state.field.props.name);
          state.form.#_fields.delete(state.field);
          state.form.#_runFieldStateTrackers(
            state.field.props.name,
            state.updateIds.unMount
          );
        }
      };
    }, [state]);

    this.#_useDefaultValues(state.useDefaultValuesOptions);

    this.#_useValidators(state.useValidatorsOptions);

    return state.field;
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const parseFieldDef = function* <TFieldDef extends FieldDef>(
  fieldDef: TFieldDef,
  namePrefix?: string
): IterableIterator<
  [Names<TFieldDef>, PathValue<TFieldDef, Names<TFieldDef>>]
> {
  for (const key in fieldDef) {
    if (hasOwnProperty.call(fieldDef, key)) {
      const value = fieldDef[key];
      const name = namePrefix ? `${namePrefix}.${key}` : key;
      if (value instanceof FieldValue) {
        yield [name as any, value.valueOf()];
      } else {
        yield* parseFieldDef(value, name) as any;
      }
    }
  }
};
const parseValidatorDefs = function* <TFieldDef extends FieldDef>(
  validatorDef: ValidatorDefs<TFieldDef>,
  namePrefix?: string
): IterableIterator<
  [
    Names<TFieldDef>,
    (
      | Validator<PathValue<TFieldDef, Names<TFieldDef>>, Names<TFieldDef>>
      | Iterable<
          Validator<PathValue<TFieldDef, Names<TFieldDef>>, Names<TFieldDef>>
        >
    )
  ]
> {
  for (const key in validatorDef) {
    if (hasOwnProperty.call(validatorDef, key)) {
      const value = validatorDef[key];
      const name = namePrefix ? `${namePrefix}.${key}` : key;
      if (typeof value === "function" || Symbol.iterator in value) {
        yield [name, value] as any;
      } else {
        yield* parseValidatorDefs(value as any, name) as any;
      }
    }
  }
};

export interface FieldDef {
  [key: string]: FieldValue<any> | FieldDef;
}

type PathImpl<
  K extends string,
  V,
  LeafsOnly extends boolean
> = V extends FieldValue<any>
  ? `${K}`
  : V extends FieldDef
  ? LeafsOnly extends true
    ? `${K}.${Path<V, LeafsOnly>}`
    : `${K}` | `${K}.${Path<V, LeafsOnly>}`
  : never;
export type Path<T extends FieldDef, LeafsOnly extends boolean> = {
  [K in keyof T]-?: PathImpl<K & string, T[K], LeafsOnly>;
}[keyof T];
export type Names<T extends FieldDef> = Path<T, true>;

type PathValueImpl<
  T extends FieldDef,
  P extends Path<T, false>
> = T[P] extends FieldValue<infer U>
  ? U
  : P extends `${infer K}.${infer R}`
  ? T[K] extends FieldValue<infer U>
    ? U
    : T[K] extends FieldDef
    ? R extends Path<T[K], false>
      ? PathValueImpl<T[K], R>
      : never
    : never
  : never;

export type PathValue<
  T extends FieldDef,
  P extends Path<T, true>
> = T[P] extends FieldValue<infer U>
  ? U
  : P extends `${infer K}.${infer R}`
  ? T[K] extends FieldValue<infer U>
    ? U
    : T[K] extends FieldDef
    ? R extends Path<T[K], false>
      ? PathValueImpl<T[K], R>
      : never
    : never
  : never;

export type PrefixPath<
  Prefix extends string,
  T
> = Prefix extends `${infer K}.${infer R}`
  ? {
      [key in K]: PrefixPath<R, T>;
    }
  : { [key in Prefix]: T };

export type Values<T extends FieldDef> = {
  [K in keyof T]?: T[K] extends FieldValue<infer U>
    ? U
    : T[K] extends FieldDef
    ? Values<T[K]>
    : never;
};

type ValidatorDefsImpl<T extends FieldDef, P extends string> = {
  [K in keyof T as string]?: T[K] extends infer G
    ? K extends string
      ? G extends FieldValue<infer U>
        ? Validator<U, `${P}.${K}`> | Iterable<Validator<U, `${P}.${K}`>>
        : G extends FieldDef
        ? ValidatorDefsImpl<G, `${P}.${K}`>
        : never
      : never
    : never;
};
export type ValidatorDefs<T extends FieldDef> = {
  [K in keyof T]?: T[K] extends infer G
    ? K extends string
      ? G extends FieldValue<infer U>
        ? Validator<U, K> | Iterable<Validator<U, K>>
        : G extends FieldDef
        ? ValidatorDefsImpl<G, K>
        : never
      : never
    : never;
};

export interface IForm<TFieldDef extends FieldDef> extends Form<TFieldDef> {}
export interface IField<T = unknown, TName extends string = string>
  extends Field<T, TName> {}

// const f: Form<typeof obj>;

const FormContext = createContext<null | Form<any>>(null);
FormContext.displayName = "FormContext";

const ProvideForm = (
  props: PropsWithChildren<UseFormOptions<any>>
): JSX.Element => {
  const { children, ...rest } = props;
  const form = Form.useForm(rest);

  return FormProvider({ form, children });
};

export const FormProvider = (
  props:
    | PropsWithChildren<{
        form: Form<any>;
      }>
    | PropsWithChildren<UseFormOptions<any>>
): JSX.Element => {
  if ("form" in props) {
    return (
      <FormContext.Provider value={props.form}>
        {props.children}
      </FormContext.Provider>
    );
  } else {
    return <ProvideForm {...props} />;
  }
};

const NamePrefixContext = createContext<null | string>(null);
NamePrefixContext.displayName = "NamePrefixContext";

export const NamePrefixProvider = (
  props: PropsWithChildren<{ namePrefix: string }>
): JSX.Element => {
  const parentNamePrefix = useContext(NamePrefixContext);
  const namePrefix = parentNamePrefix
    ? `${parentNamePrefix}.${props.namePrefix}`
    : props.namePrefix;
  return (
    <NamePrefixContext.Provider value={namePrefix}>
      {props.children}
    </NamePrefixContext.Provider>
  );
};
