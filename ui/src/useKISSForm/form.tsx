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
  private readonly _name_: string;
  private readonly _defaultValue_: any;

  constructor({ name, defaultValue }: { name: string; defaultValue: any }) {
    this._name_ = name;
    this._defaultValue_ = defaultValue;
  }

  get name() {
    return this._name_;
  }

  valueOf() {
    return this._defaultValue_;
  }
}

class FieldWatcher<T extends string | Field<any, string, any>> {
  private readonly _name_: string;
  private readonly _watcher_: (updateId: symbol) => void;
  private readonly _stateTracker_: () => boolean;

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
    this._watcher_ = watcher;

    if (nameOrField instanceof Field) {
      this._name_ = nameOrField.props.name;
      this._stateTracker_ = (() => {
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
              isLoading: nameOrField.state.isLoading,
              errors: nameOrField.state.errors,
            },
          });

          let prevState = getSnapShot();

          while (true) {
            const curState = getSnapShot();

            yield !(
              (
                Object.keys(prevState.props) as (keyof StateSnapShot["props"])[]
              ).every((key) => {
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
              (
                Object.keys(prevState.state) as (keyof StateSnapShot["state"])[]
              ).every((key) => {
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
      this._name_ = nameOrField;
      this._stateTracker_ = (() => {
        const stateTracker = function* (this: FieldWatcher<T>) {
          interface StateSnapShot {
            value: any;
            errors: InvalidResponse[];
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
    return this._name_;
  }

  run(updateId: symbol) {
    if (this._stateTracker_()) {
      this._watcher_(updateId);
    }
  }

  valueOf() {
    return this._watcher_;
  }
}

class FieldValidator {
  private readonly _name_: string;
  private readonly _form_: Form<any>;
  private readonly _field_: Field | undefined = undefined;
  private readonly _validators_: Validator<any>[] = [];
  private readonly _errors_: InvalidResponse[] = [];
  _validating_: Promise<boolean> | null = null;

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
      this._name_ = field.props.name;
      this._field_ = field;
    } else {
      this._name_ = field;
    }
    this._validators_.push(...validators);
    this._form_ = form;
  }

  get name() {
    return this._name_;
  }

  errors(): IterableIterator<InvalidResponse> {
    return this._errors_.values();
  }

  reset(): void {
    this._validating_ = null;
    this._errors_.splice(0);
  }

  validate(): Promise<boolean> | boolean {
    let hasPromise = false;

    const value = this._form_.getFieldValue(this._name_, true);

    const errors = this._validators_.reduce((errors, validator) => {
      const error = validator(value, {
        name: this._name_,
        form: this._form_,
        field: this._field_,
      });

      if (error instanceof Promise) {
        hasPromise = true;
        errors.push(error);
      } else if (error) {
        errors.push(error);
      }

      return errors;
    }, [] as (Promise<InvalidResponse | void | null> | InvalidResponse)[]);

    if (hasPromise) {
      const promise = Promise.all(errors).then((results) => {
        if (this._validating_ !== promise) {
          return this._validating_ || !this._errors_.length;
        }

        this._validating_ = null;
        const errors = results.filter((error) => !!error) as InvalidResponse[];
        this._errors_.splice(
          0,
          this._errors_.length,
          ...(errors as InvalidResponse[])
        );
        return !errors.length;
      }) as Promise<boolean>;

      this._validating_ = promise;

      return promise;
    } else {
      this._validating_ = null;
      this._errors_.splice(
        0,
        this._errors_.length,
        ...(errors as InvalidResponse[])
      );
      return !errors.length;
    }
  }
}

export interface InvalidResponse {
  message: string;
}

/**
 * @param value - Always the **dirty** value.
 */
export type Validator<
  T = unknown,
  Name extends string = string,
  TFieldDef extends FieldDef = any
> = (
  value: T | undefined,
  context: {
    name: Name;
    form: Form<TFieldDef>;
    field?: Field<T, Name>;
  }
) => Promise<InvalidResponse | void | null> | InvalidResponse | void | null;

export interface FieldProps<
  T = unknown,
  Name extends string = string,
  DefaultValue extends T | undefined = undefined
> {
  value: T | DefaultValue;
  name: Name;
}

export interface FieldState {
  isValid: boolean;
  isValidating: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isLoading: boolean;
  errors: InvalidResponse[];
}

class Field<
  T = unknown,
  Name extends string = string,
  DefaultValue extends T | undefined = undefined
> {
  readonly #name: Name;
  readonly #form: Form<any>;
  readonly #shouldUnregister: boolean;
  readonly #props: FieldProps<T, Name, DefaultValue> = (() => {
    const propsDef: {
      [key in keyof FieldProps<T>]: PropertyDescriptor;
    } = {
      value: {
        get: () => this.#form.getFieldValue(this.props.name, false),
        enumerable: true,
      },
      name: {
        get: () => this.#name,
        enumerable: true,
      },
    };

    return Object.create(null, propsDef);
  })();
  readonly #state: FieldState = (() => {
    const stateDef: {
      [key in keyof FieldState]: PropertyDescriptor;
    } = {
      isValid: {
        get: () => this.#form.isFieldValid(this.props.name),
        enumerable: true,
      },
      isValidating: {
        get: () => this.#form.isFieldValidating(this.props.name),
        enumerable: true,
      },
      isTouched: {
        get: () => this.#form.isFieldTouched(this),
        enumerable: true,
      },
      isDirty: {
        get: () => this.#form.isFieldDirty(this.props.name),
        enumerable: true,
      },
      isLoading: {
        get: () => this.#form.isFieldLoading(this.props.name),
        enumerable: true,
      },
      errors: {
        get: () => [...this.#form.getFieldErrors(this.props.name)],
        enumerable: true,
      },
    };
    return Object.create(null, stateDef);
  })();

  constructor({
    name,
    form,
    shouldUnregister,
  }: {
    name: Name;
    form: Form<any>;
    shouldUnregister: boolean;
  }) {
    this.#name = name;
    this.#form = form;
    this.#shouldUnregister = shouldUnregister;

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

  get props(): FieldProps<T, Name, DefaultValue> {
    return this.#props;
  }
  get state(): FieldState {
    return this.#state;
  }
  get shouldUnregister() {
    return this.#shouldUnregister;
  }
  readonly setValue = (value?: T) =>
    this.#form.setFieldValue(this.props.name, value as any);
  readonly setTouched = (touched: boolean) =>
    this.#form.setFieldTouched(this, touched);
  readonly validate = (): Promise<boolean> | boolean =>
    this.#form.validateField(this.props.name);

  readonly reset = (): void => this.#form.resetField(this.props.name);
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
          errors: Map<string, InvalidResponse[]>;
        }
      ) => Promise<void> | void;
      onSubmit: OnSubmitCb<TFieldDef>;
      onError?: (
        submitState: SubmitState<TFieldDef> & {
          error: InvalidResponse;
        }
      ) => Promise<void> | void;
      onSuccess?: OnSubmitCb<TFieldDef>;
    };

export type UseFormOptions<TFieldDef extends FieldDef> = {
  onSubmit: OnSubmit<TFieldDef>;
  defaultValues?: TFieldDef;
  validators?: ValidatorDefs<TFieldDef>;
};
export type UseFieldOptions<
  T = unknown,
  Name extends string = string,
  TFieldDef extends FieldDef = FieldDef
> = {
  name: Name;
  defaultValue?: T;
  validator?: Validator<any> | Iterable<Validator<any>>;
  form?: Form<TFieldDef>;
  shouldUnregister?: boolean;
};

export class FieldValue<T = unknown> {
  _value_: T;
  constructor(v: T) {
    this._value_ = v;
  }
  valueOf(): T {
    return this._value_;
  }
  toString(): string {
    return String(this._value_);
  }
  static value<T = unknown>(value: T): FieldValue<T> {
    return new FieldValue(value);
  }
}
export const fieldValue = FieldValue.value;

const FIELDS = new WeakMap<Form<any>, Set<Field<any>>>();
const VALUES = new WeakMap<Form<any>, Map<string, any>>();
const DEFAULT_VALUES = new WeakMap<Form<any>, Set<DefaultValue>>();
const LOADING = new WeakMap<Form<any>, Map<string, Set<symbol>>>();
const FIELD_VALIDATORS = new WeakMap<Form<any>, Set<FieldValidator>>();
const FIELD_WATCHERS = new WeakMap<Form<any>, Set<FieldWatcher<any>>>();
const FORM_WATCHERS = new WeakMap<Form<any>, Set<(updateId: symbol) => void>>();
const RUN_FIELD_STATE_TRACKERS = new WeakMap<
  Form<any>,
  (name: string, updateId: symbol) => void
>();
const RUN_FORM_STATE_TRACKER = new WeakMap<
  Form<any>,
  (updateId: symbol) => void
>();

class Form<TFieldDef extends FieldDef> {
  readonly #fields = new Set<Field<any, Names<TFieldDef>>>();
  readonly #values = new Map<string, any>();
  readonly #defaultValues = new Set<DefaultValue>();
  readonly #touchedFields = new WeakSet<Field<any, string, any>>();
  readonly #validatingFields = new Map<string, Promise<boolean>>();
  #validatingAll: Promise<boolean> | null = null;
  #submitCount = 0;
  #isSubmitting = false;
  #isSubmitted = false;
  #submissionError: InvalidResponse | null = null;
  #loading = new Map<string, Set<symbol>>();

  readonly #fieldValidators = new Set<FieldValidator>();

  readonly #fieldWatchers = new Set<FieldWatcher<any>>();
  readonly #formWatchers = new Set<(updateId: symbol) => void>();

  readonly #runFieldStateTrackers = (
    name: string,
    updateId = Symbol()
  ): void => {
    for (const fieldWatcher of this.#fieldWatchers) {
      if (fieldWatcher.name === name) {
        fieldWatcher.run(updateId);
      }
    }

    this.#runFormStateTracker(updateId);
  };

  readonly #onSubmit: Exclude<OnSubmit<TFieldDef>, OnSubmitCb<TFieldDef>>;

  constructor({ onSubmit }: { onSubmit: OnSubmit<TFieldDef> }) {
    this.#onSubmit =
      typeof onSubmit === "function"
        ? {
            onSubmit,
          }
        : onSubmit;

    FIELDS.set(this, this.#fields);
    VALUES.set(this, this.#values);
    DEFAULT_VALUES.set(this, this.#defaultValues);
    LOADING.set(this, this.#loading);
    FIELD_VALIDATORS.set(this, this.#fieldValidators);
    FIELD_WATCHERS.set(this, this.#fieldWatchers);
    FORM_WATCHERS.set(this, this.#formWatchers);
    RUN_FIELD_STATE_TRACKERS.set(this, this.#runFieldStateTrackers);
    RUN_FORM_STATE_TRACKER.set(this, this.#runFormStateTracker);

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
        "loading",
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
    return !!this.#values.size;
  }
  get isValid(): boolean {
    console.log(this);
    return !!this.errors().next().done;
  }
  get isValidating(): boolean {
    return !!this.#validatingFields.size;
  }
  get isSubmitted(): boolean {
    return this.#isSubmitted;
  }
  get isSubmitting(): boolean {
    return this.#isSubmitting;
  }
  get submitCount(): number {
    return this.#submitCount;
  }
  get submissionError(): InvalidResponse | null {
    return this.#submissionError;
  }
  get loading(): boolean {
    return !!this.#loading.size;
  }

  readonly isFieldRegistered = (name: Names<TFieldDef>): boolean =>
    !!this.getRegisteredField(name);
  readonly getRegisteredField = <Name extends Names<TFieldDef>>(
    name: Name
  ): Field<PathValue<TFieldDef, Name>, Name> | undefined => {
    for (const field of this.fields()) {
      if (field.props.name === name) {
        return field as any;
      }
    }
  };

  readonly setFieldValue = <Name extends Names<TFieldDef>>(
    name: Name,
    value: PathValue<TFieldDef, Name> | undefined
  ): void => {
    if (value == undefined) {
      this.#values.delete(name);
    } else {
      this.#values.set(name, value);
    }

    //NOTE: validateField calls state trackers
    this.validateField(name);
  };
  readonly getFieldValue = <Name extends Names<TFieldDef>>(
    name: Name,
    dirtyOnly = true
  ): PathValue<TFieldDef, Name> | undefined => {
    if (this.#values.has(name) || dirtyOnly) {
      return this.#values.get(name);
    } else {
      return this.getFieldDefaultValue(name);
    }
  };
  readonly getFieldDefaultValue = <Name extends Names<TFieldDef>>(
    name: Name
  ): PathValue<TFieldDef, Name> | undefined => {
    for (const defaultValue of this.#defaultValues) {
      if (name === defaultValue.name) {
        return defaultValue.valueOf();
      }
    }
  };

  readonly isFieldValid = (name: Names<TFieldDef>): boolean =>
    !!this.getFieldErrors(name).next().done;
  readonly isFieldValidating = (name: Names<TFieldDef>): boolean =>
    this.#validatingFields.has(name);
  readonly isFieldTouched = (field: Field<any, string, any>): boolean =>
    this.#touchedFields.has(field);
  readonly setFieldTouched = (
    field: Field<any, string, any>,
    touched: boolean,
    { updateId }: { updateId?: symbol } = {}
  ): void => {
    if (touched) {
      this.#touchedFields.add(field);
    } else {
      this.#touchedFields.delete(field);
    }
    this.#runFieldStateTrackers(field.props.name, updateId);
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
    this.#values.has(name);
  readonly isFieldLoading = (name: Names<TFieldDef>): boolean =>
    this.#loading.has(name);
  readonly getFieldErrors = function* (
    this: Form<TFieldDef>,
    name: string
  ): IterableIterator<InvalidResponse> {
    for (const fieldValidator of this.#fieldValidators) {
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

    for (const fieldValidator of this.#fieldValidators) {
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
        if (this.#validatingFields.get(name) !== promise) {
          return this.#validatingFields.get(name) || this.isFieldValid(name);
        }
        this.#validatingFields.delete(name);
        this.#runFieldStateTrackers(name, updateId);
        return results.every((result) => result);
      });

      this.#validatingFields.set(name, promise);
      this.#runFieldStateTrackers(name); // Do NOT use updateId here.
      return promise;
    } else {
      this.#validatingFields.delete(name);
      this.#runFieldStateTrackers(name, updateId);
      return results.every((result) => result);
    }
  };
  readonly validateAll = ({ updateId = Symbol() }: { updateId?: symbol } = {}):
    | Promise<boolean>
    | boolean => {
    let hasPromise = false;

    const results: (Promise<boolean> | boolean)[] = [];

    const validatedFields = new Set<string>();

    for (const { name } of this.#fieldValidators) {
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
        if (this.#validatingAll !== promise) {
          return this.#validatingAll || this.isValid;
        }
        this.#validatingAll = null;
        return results.every((result) => result);
      }) as Promise<boolean>;

      this.#validatingAll = promise;

      return promise;
    } else {
      this.#validatingAll = null;
      return results.every((result) => result);
    }
  };

  /**
   * Validates and sets all fields touched.  If there are no errors, calls the onSubmit callback.
   * @returns {Promise<Map<string, InvalidResponse[]>>} when submission fails validation.
   * @returns {Promise<InvalidResponse>} when user defined onSubmit callback throws or rejects with an error.
   */
  readonly submit = async (
    event?: React.FormEvent<HTMLFormElement>
  ): Promise<
    InvalidResponse | Map<Names<TFieldDef>, InvalidResponse[]> | undefined
  > => {
    if (this.#onSubmit.onStart) {
      this.#onSubmit.onStart({
        event,
        dirtyValues: this.getValuesObject(true),
        values: this.getValuesObject(false),
        form: this,
      });
    }

    const startUpdateId = Symbol();

    this.#isSubmitting = true;
    this.#submitCount++;
    this.setTouchedAll(true);

    const validateResult = this.validateAll({ updateId: startUpdateId });

    this.#runFormStateTracker(startUpdateId);

    const isValid =
      validateResult instanceof Promise ? await validateResult : validateResult;

    if (!isValid) {
      this.#isSubmitting = false;

      const errors = new Map(this.errors());

      this.#runFormStateTracker();

      if (this.#onSubmit.onInvalid) {
        this.#onSubmit.onInvalid({
          event,
          dirtyValues: this.getValuesObject(true),
          values: this.getValuesObject(false),
          form: this,
          errors,
        });
      }

      return errors;
    }

    try {
      const submitResult = this.#onSubmit.onSubmit({
        event,
        dirtyValues: this.getValuesObject(true),
        values: this.getValuesObject(false),
        form: this,
      });

      if (submitResult instanceof Promise) {
        await submitResult;
      }
    } catch (error) {
      this.#isSubmitting = false;

      this.#runFormStateTracker();

      if (this.#onSubmit.onError) {
        this.#onSubmit.onError({
          event,
          dirtyValues: this.getValuesObject(true),
          values: this.getValuesObject(false),
          form: this,
          error,
        });
      }

      return error;
    }

    this.#isSubmitting = false;
    this.#isSubmitted = true;

    this.#runFormStateTracker();

    if (this.#onSubmit.onSuccess) {
      this.#onSubmit.onSuccess({
        event,
        dirtyValues: this.getValuesObject(true),
        values: this.getValuesObject(false),
        form: this,
      });
    }
  };

  readonly handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    this.submit(event);
  };

  readonly fields = (): IterableIterator<
    Field<PathValue<TFieldDef, Names<TFieldDef>>>
  > => this.#fields.values();
  readonly values = function* (
    this: Form<TFieldDef>,
    dirtyOnly = true
  ): IterableIterator<
    [Names<TFieldDef>, PathValue<TFieldDef, Names<TFieldDef>>]
  > {
    const yieldedKeys = new Set<string>();

    for (const [name, value] of this.#values) {
      yieldedKeys.add(name);
      yield [name as Names<TFieldDef>, value];
    }

    if (!dirtyOnly) {
      for (const defaultValue of this.#defaultValues) {
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
  ): IterableIterator<[Names<TFieldDef>, InvalidResponse[]]> {
    const checkedFields = new Set<string>();

    for (const { name } of this.#fieldValidators) {
      if (!checkedFields.has(name)) {
        const errors = [...this.getFieldErrors(name)];
        if (errors.length) {
          yield [name as Names<TFieldDef>, errors];
        }
      }
    }
  }.bind(this);
  readonly getValuesObject = (dirtyOnly = true): Values<TFieldDef> => {
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
    for (const fieldValidator of this.#fieldValidators) {
      if (fieldValidator.name === name) {
        fieldValidator.reset();
      }
    }
    this.#runFieldStateTrackers(name, updateId);
  };

  readonly resetAllErrors = ({
    updateId = Symbol(),
  }: { updateId?: symbol } = {}): void => {
    const resetFields = new Set<string>();

    for (const validator of this.#fieldValidators) {
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

    this.#values.delete(name);

    const field = this.getRegisteredField(name);
    if (field) {
      this.setFieldTouched(field, false, { updateId });
    }

    this.#runFieldStateTrackers(name, updateId);
  };

  /**
   * Sets {@link Form.submitCount} to `0`.
   */
  readonly resetSubmitCount = ({ updateId }: { updateId?: symbol } = {}) => {
    this.#submitCount = 0;
    this.#runFormStateTracker(updateId);
  };

  /**
   * Sets {@link Form.isSubmitted} to `false`.
   */
  readonly resetSubmitted = ({ updateId }: { updateId?: symbol } = {}) => {
    this.#isSubmitted = false;
    this.#runFormStateTracker(updateId);
  };

  /**
   * Sets {@link Form.submissionError} to `null`.
   */
  readonly resetSubmissionError = ({
    updateId,
  }: { updateId?: symbol } = {}) => {
    this.#submissionError = null;
    this.#runFormStateTracker(updateId);
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
    } of this.#fields) {
      resetFields.add(name);
      this.resetField(name, { updateId });
    }

    for (const validator of this.#fieldValidators) {
      if (!resetFields.has(validator.name)) {
        resetFields.add(validator.name);
        this.resetField(validator.name as Names<TFieldDef>, { updateId });
      }
    }

    for (const name of this.#values.keys()) {
      if (!resetFields.has(name)) {
        this.resetField(name as Names<TFieldDef>, { updateId });
      }
    }

    this.resetSubmitCount({ updateId });
    this.resetSubmitted({ updateId });
    this.resetSubmissionError({ updateId });

    this.#runFormStateTracker(updateId);
  };

  readonly #runFormStateTracker = (() => {
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
        | "isFieldLoading"
        | "getFieldErrors"
        | "validateField"
        | "validateAll"
        | "submit"
        | "handleSubmit"
        | "fields"
        | "values"
        | "errors"
        | "getValuesObject"
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
        loading: this.loading,
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
        for (const formWatcher of this.#formWatchers) {
          formWatcher(updateId);
        }
      }
    };
  })();
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

export type IForm<TFieldDef extends FieldDef = FieldDef> = Form<TFieldDef>;
export type IField<T = unknown, Name extends string = string> = Field<T, Name>;

const FormContext = createContext<null | Form<any>>(null);
FormContext.displayName = "FormContext";

const ProvideForm = (
  props: PropsWithChildren<UseFormOptions<any>>
): JSX.Element => {
  const { children, ...rest } = props;
  const form = useForm(rest);

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
    ? prefixName(props.namePrefix, parentNamePrefix)
    : props.namePrefix;
  return (
    <NamePrefixContext.Provider value={namePrefix}>
      {props.children}
    </NamePrefixContext.Provider>
  );
};

export const useForm = <TFieldDef extends FieldDef>({
  onSubmit,
  defaultValues,
  validators,
}: UseFormOptions<TFieldDef>): Form<TFieldDef> => {
  const [, watcher] = useState(Symbol());

  const [state] = useState(() => {
    const updateIds = {
      mount: Symbol(),
      unMount: Symbol(),
    };
    const form = new Form<TFieldDef>({ onSubmit });

    (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).add(watcher);

    return {
      form,
      useDefaultValuesOptions: {
        defaultValues: defaultValues || {},
        form,
        shouldUnregister: false,
        updateIds,
      },
      useValidatorsOptions: {
        validators: validators || {},
        form,
        shouldUnregister: false,
        updateIds,
      },
    };
  });

  useDefaultValuesUtil(state.useDefaultValuesOptions);

  useValidatorsUtil(state.useValidatorsOptions);

  return state.form;
};

export const useFormContext = <TFieldDef extends FieldDef = FieldDef>(
  formContext?: Form<TFieldDef>
): Form<TFieldDef> | null => {
  const form = useFormContextUtil({
    form: formContext,
    hookName: "useFormContext",
  });

  const [, watcher] = useState(Symbol());

  useEffect(
    () => () => {
      if (form) {
        (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).delete(
          watcher
        );
      }
    },

    [form]
  );

  return useMemo(() => {
    if (form) {
      (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).add(watcher);
    }
    return form;
  }, [form]);
};

const useFormContextUtil = ({
  form,
  hookName,
}: {
  form?: Form<any>;
  hookName: string;
}): Form<any> => {
  const _context = useContext(FormContext);

  const context = form || _context;

  if (process.env.NODE_ENV !== "production") {
    if (context === null) {
      throw new TypeError(
        `"FormContext" does exists in the react tree nor provided to "${hookName}" via the "form" argument.`
      );
    }
  }
  return context as Form<any>;
};

/**
 * Dot-notate prepends `name` with `prefix`.
 */
export const prefixName = <Name extends string, TPrefix extends string>(
  name: Name,
  prefix: TPrefix
): `${TPrefix}.${Name}` => {
  return `${prefix}.${name}`;
};

/**
 * @param name is dot-notate appended to the name prefix when provided.
 */
export const useNamePrefix = (name?: string): string => {
  const namePrefix = useContext(NamePrefixContext);
  if (namePrefix) {
    return name ? prefixName(name, namePrefix) : namePrefix;
  } else {
    return name || "";
  }
};

const useDefaultValuesUtil = (options: {
  defaultValues: FieldDef;
  shouldUnregister?: boolean;
  form?: Form<any>;
  updateIds?: {
    mount: symbol;
    unMount: symbol;
  };
}): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useDefaultValues",
  });

  const namePrefix = useNamePrefix();

  const [state] = useState(() => {
    const defaultValues: DefaultValue[] = [];
    for (const [name, defaultValue] of parseFieldDef(options.defaultValues)) {
      defaultValues.push(
        new DefaultValue({
          name: namePrefix ? prefixName(name, namePrefix) : name,
          defaultValue,
        })
      );
    }
    return {
      defaultValues,
      shouldUnregister: options.shouldUnregister ?? true,
      form,
      updateIds: options.updateIds || {
        mount: Symbol(),
        unMount: Symbol(),
      },
    };
  });

  useEffect(() => {
    state.defaultValues.forEach((defaultValue) => {
      (DEFAULT_VALUES.get(state.form) as Set<DefaultValue>).add(defaultValue);
      (
        RUN_FIELD_STATE_TRACKERS.get(state.form) as (
          name: string,
          updateId: symbol
        ) => void
      )(defaultValue.name, state.updateIds.mount);
    });

    return () => {
      if (state.shouldUnregister) {
        state.defaultValues.forEach((defaultValue) => {
          (DEFAULT_VALUES.get(state.form) as Set<DefaultValue>).delete(
            defaultValue
          );
          (
            RUN_FIELD_STATE_TRACKERS.get(state.form) as (
              name: string,
              updateId: symbol
            ) => void
          )(defaultValue.name, state.updateIds.unMount);
        });
      }
    };
  }, [state]);
};

export const useDefaultValues = <TFieldDef extends FieldDef>(options: {
  defaultValues: TFieldDef;
  shouldUnregister?: boolean;
  form?: Form<TFieldDef>;
}): void => {
  return useDefaultValuesUtil(options);
};

const useValidatorsUtil = (options: {
  validators: ValidatorDefs<any>;
  shouldUnregister?: boolean;
  form?: Form<any>;
  updateIds?: {
    mount: symbol;
    unMount: symbol;
  };
}): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useValidators",
  });

  const namePrefix = useNamePrefix();

  const [state] = useState(() => {
    const fieldValidators: FieldValidator[] = [];

    for (const [name, validators] of parseValidatorDefs(options.validators)) {
      fieldValidators.push(
        new FieldValidator({
          field: namePrefix ? prefixName(name, namePrefix) : name,
          form,
          validators:
            typeof validators === "function" ? [validators] : validators,
        })
      );
    }

    return {
      fieldValidators,
      shouldUnregister: options.shouldUnregister ?? true,
      form,
      updateIds: options.updateIds || {
        mount: Symbol(),
        unMount: Symbol(),
      },
    };
  });

  useEffect(() => {
    state.fieldValidators.forEach((fieldValidators) => {
      (FIELD_VALIDATORS.get(state.form) as Set<FieldValidator>).add(
        fieldValidators
      );
      state.form.validateField(fieldValidators.name, {
        updateId: state.updateIds.mount,
      });
    });

    return () => {
      if (state.shouldUnregister) {
        state.fieldValidators.forEach((fieldValidators) => {
          (FIELD_VALIDATORS.get(state.form) as Set<FieldValidator>).delete(
            fieldValidators
          );
          state.form.validateField(fieldValidators.name, {
            updateId: state.updateIds.unMount,
          });
        });
      }
    };
  }, [state]);
};

export const useValidators = <TFieldDef extends FieldDef>(options: {
  validators: ValidatorDefs<TFieldDef>;
  shouldUnregister?: boolean;
  form?: Form<TFieldDef>;
}): void => {
  return useValidatorsUtil(options);
};

export const useWatcher = function <
  T = unknown,
  TFieldDef extends FieldDef = any
>(options: {
  name: string | Field<any, string, any>;
  form?: Form<TFieldDef>;
}): {
  value: T | undefined;
  defaultValue: T | undefined;
  errors: InvalidResponse[];
} {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useWatcher",
  });

  const namePrefix = useNamePrefix();

  const [updateId, watcher] = useState(Symbol());

  const [state] = useState(() => {
    const name = options.name;
    const fieldWatcher = new FieldWatcher({
      nameOrField:
        name instanceof Field || !namePrefix
          ? name
          : prefixName(name, namePrefix),
      form,
      watcher,
    });

    (FIELD_WATCHERS.get(form) as Set<FieldWatcher<any>>).add(fieldWatcher);

    return {
      form,
      fieldWatcher,
    };
  });

  useEffect(
    () => () => {
      (FIELD_WATCHERS.get(state.form) as Set<FieldWatcher<any>>).delete(
        state.fieldWatcher
      );
    },
    [state]
  );

  return useMemo(
    () => ({
      value: state.form.getFieldValue(state.fieldWatcher.name) as T,
      defaultValue: state.form.getFieldDefaultValue(
        state.fieldWatcher.name
      ) as T,
      errors: [...state.form.getFieldErrors(state.fieldWatcher.name)],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, updateId]
  );
};

/**
 * @returns the **same** {@link Field} instance for every call to with matching `name` and {@link Form}.  The fist call creates the {@link Field} instance.
 */
export const useField = function <
  T = unknown,
  Name extends string = string,
  TFieldDef extends FieldDef = FieldDef
>(options: UseFieldOptions<T, Name, TFieldDef>): Field<T, Name> {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useField",
  });

  const namePrefix = useNamePrefix();

  const [, watcher] = useState(Symbol());

  const [state] = useState(() => {
    const shouldUnregister = options.shouldUnregister ?? true;
    const updateIds = {
      mount: Symbol(),
      unMount: Symbol(),
    };

    const name = namePrefix
      ? prefixName(options.name, namePrefix)
      : options.name;

    const field = (form.getRegisteredField(name) ||
      new Field<T, string>({
        name,
        form,
        shouldUnregister,
      })) as Field<T, string>;

    const fieldWatcher = new FieldWatcher({
      nameOrField: field,
      watcher,
    });

    (FIELDS.get(form) as Set<Field<any>>).add(field);
    (FIELD_WATCHERS.get(form) as Set<FieldWatcher<any>>).add(fieldWatcher);

    return {
      field,
      useDefaultValuesOptions: {
        defaultValues:
          options.defaultValue === undefined
            ? {}
            : // Name prefix will be added by _useDefaultValues_
              { [options.name]: new FieldValue(options.defaultValue) },
        form,
        shouldUnregister,
        updateIds,
      },
      useValidatorsOptions: {
        validators:
          options.validator === undefined
            ? {}
            : // Name prefix will be added by _useValidators_
              { [options.name]: options.validator },
        form,
        shouldUnregister,
        updateIds,
      },
      fieldWatcher,
      form,
      updateIds,
    };
  });

  useEffect(
    () => () => {
      (FIELD_WATCHERS.get(state.form) as Set<FieldWatcher<any>>).delete(
        state.fieldWatcher
      );

      if (state.field.shouldUnregister) {
        (VALUES.get(state.form) as Map<string, any>).delete(
          state.field.props.name
        );
        (FIELDS.get(state.form) as Set<Field<any>>).delete(state.field);
        (
          RUN_FIELD_STATE_TRACKERS.get(state.form) as (
            name: string,
            updateId: symbol
          ) => void
        )(state.field.props.name, state.updateIds.unMount);
      }
    },
    [state]
  );

  useDefaultValuesUtil(state.useDefaultValuesOptions);

  useValidatorsUtil(state.useValidatorsOptions);

  return state.field as Field<T, Name>;
};

/**
 * @param options.shouldUnregister `true` (default) sets loading to false for this invocation of {@link Form.useLoading} when it is unmounted.
 */
export const useLoading = <TFieldDef extends FieldDef = any>(options: {
  loading: boolean;
  name: string | Field<any, string, any>;
  shouldUnregister?: boolean;
  form?: Form<TFieldDef>;
}): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useLoading",
  });

  const namePrefix = useNamePrefix();

  const [state] = useState(() => {
    const id = Symbol();

    const fieldName =
      options.name instanceof Field ? options.name.props.name : options.name;

    const name = namePrefix ? prefixName(fieldName, namePrefix) : fieldName;

    return {
      setLoading: (loading: boolean) => {
        const loadingMap = LOADING.get(form) as Map<string, Set<symbol>>;
        if (loading) {
          if (loadingMap.has(name)) {
            (loadingMap.get(name) as Set<symbol>).add(id);
          } else {
            loadingMap.set(name, new Set([id]));
          }
        } else {
          if (loadingMap.has(name)) {
            (loadingMap.get(name) as Set<symbol>).delete(id);
            if (!loadingMap.size) {
              loadingMap.delete(name);
            }
          }
        }
        const updateId = Symbol();
        (
          RUN_FIELD_STATE_TRACKERS.get(form) as (
            name: string,
            updateId: symbol
          ) => void
        )(name, updateId);
        (RUN_FORM_STATE_TRACKER.get(form) as (updateId: symbol) => void)(
          updateId
        );
      },
      shouldUnregister: options.shouldUnregister ?? true,
    };
  });

  useEffect(() => {
    state.setLoading(options.loading);
  }, [options.loading, state]);

  useEffect(
    () => () => {
      if (state.shouldUnregister) {
        state.setLoading(false);
      }
    },
    [state]
  );
};

export const useWatchAll = <TFieldDef extends FieldDef = any>(options: {
  form?: Form<TFieldDef>;
}): Pick<SubmitState<TFieldDef>, "dirtyValues" | "values"> => {
  const _form = useFormContextUtil({
    form: options.form,
    hookName: "useWatchAll",
  });

  const [updateId, watchAllCb] = useState(Symbol());
  const [form] = useState(() => {
    (FORM_WATCHERS.get(_form) as Set<(updateId: symbol) => void>).add(
      watchAllCb
    );
    return _form;
  });

  useEffect(
    () => () => {
      (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).delete(
        watchAllCb
      );
    },
    [form]
  );

  return useMemo(
    () => ({
      values: form.getValuesObject(false),
      dirtyValues: form.getValuesObject(true),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateId]
  );
};
