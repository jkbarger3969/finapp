/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useEffect,
  PropsWithChildren,
  useRef,
  useCallback,
} from "react";
import { set } from "lodash";

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
  private _validating_: Promise<boolean> | null = null;
  private _hasRun_ = false;

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
    this._hasRun_ = false;
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
        this._hasRun_ = true;
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
      this._hasRun_ = true;
      this._errors_.splice(
        0,
        this._errors_.length,
        ...(errors as InvalidResponse[])
      );
      return !errors.length;
    }
  }

  get hasRun(): boolean {
    return this._hasRun_;
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
  FieldDef extends Record<string, unknown> = any
> = (
  value: T | undefined,
  context: {
    name: Name;
    form: Form<FieldDef>;
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

  readonly #shouldUnregister: boolean;

  constructor({
    name,
    form,
    shouldUnregister = false,
  }: {
    name: Name;
    form: Form<any>;
    shouldUnregister?: boolean;
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
  get shouldUnregister(): boolean {
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

export type ValidateOn = "change" | "blur" | "submit" | "touched" | "all";

export interface SubmitState<FieldDef extends Record<string, unknown>> {
  event?:
    | React.FormEvent<HTMLFormElement>
    | React.FormEvent<HTMLButtonElement>
    | React.FormEvent<HTMLInputElement>;
  dirtyValues: ValuesObject<FieldDef>;
  values: ValuesObject<FieldDef>;
  form: Form<FieldDef>;
}
export type OnSubmitCb<FieldDef extends Record<string, unknown>> = (
  submitState: SubmitState<FieldDef>
) => Promise<void> | void;

export type OnSubmit<FieldDef extends Record<string, unknown>> =
  | OnSubmitCb<FieldDef>
  | {
      onStart?: OnSubmitCb<FieldDef>;
      onInvalid?: (
        submitState: SubmitState<FieldDef> & {
          errors: ErrorsObject<FieldDef>;
        }
      ) => Promise<void> | void;
      onSubmit: OnSubmitCb<FieldDef>;
      onError?: (
        submitState: SubmitState<FieldDef> & {
          error: InvalidResponse;
        }
      ) => Promise<void> | void;
      onSuccess?: OnSubmitCb<FieldDef>;
      finally?: OnSubmitCb<FieldDef>;
    };

export class FieldValue<T = unknown> {
  readonly #value: T;
  constructor(value: T) {
    this.#value = value;
  }
  valueOf(): T {
    return this.#value;
  }
  toString(): string {
    return String(this.#value);
  }
  static value<T = unknown>(value: T): FieldValue<T> {
    return new FieldValue(value);
  }
}
export const fieldValue = FieldValue.value;

const FIELDS = new WeakMap<Form<any>, Map<string, Field<any, string>>>();
const VALUES = new WeakMap<Form<any>, Map<string, any>>();
const DEFAULT_VALUES = new WeakMap<Form<any>, Map<symbol, Map<string, any>>>();
const IS_EQUAL_FNS = new WeakMap<
  Form<any>,
  Map<symbol, Map<string, IsEqualFn<any>>>
>();
const LOADING = new WeakMap<Form<any>, Map<string, Set<symbol>>>();
const FIELD_VALIDATORS = new WeakMap<
  Form<any>,
  Map<string, Set<FieldValidator>>
>();
const FIELD_WATCHERS = new WeakMap<
  Form<any>,
  Map<string, Set<FieldWatcher<any>>>
>();
const FORM_WATCHERS = new WeakMap<Form<any>, Set<(updateId: symbol) => void>>();
const RUN_FIELD_STATE_TRACKERS = new WeakMap<
  Form<any>,
  (name: string, updateId: symbol) => void
>();
const RUN_FORM_STATE_TRACKER = new WeakMap<
  Form<any>,
  (updateId: symbol) => void
>();

const DEFAULT_VALUE_EQUALITY = (a: any, b: any) => a === b;

class Form<FieldDef extends Record<string, unknown>> {
  readonly #fields = new Map<Names<FieldDef>, Field<any, Names<FieldDef>>>();
  readonly #values = new Map<string, any>();
  readonly #clearedValues = new Set<Names<FieldDef>>();
  readonly #defaultValues = new Map<symbol, Map<string, any>>();
  readonly #isEqualFns = new Map<symbol, Map<string, IsEqualFn<any>>>();
  readonly #touchedFields = new WeakSet<Field<any, string, any>>();
  readonly #validatingFields = new Map<string, Promise<boolean>>();
  readonly #validateOn: ValidateOn;
  #validatingAll: Promise<boolean> | null = null;
  #submitCount = 0;
  #isSubmitting = false;
  #isSubmitted = false;
  #submissionError: InvalidResponse | null = null;
  #loading = new Map<string, Set<symbol>>();

  readonly #fieldValidators = new Map<Names<FieldDef>, Set<FieldValidator>>();

  readonly #fieldWatchers = new Map<Names<FieldDef>, Set<FieldWatcher<any>>>();
  readonly #formWatchers = new Set<(updateId: symbol) => void>();

  readonly #runFieldStateTrackers = (
    name: string,
    updateId = Symbol()
  ): void => {
    for (const fieldWatcher of this.#fieldWatchers
      .get(name as Names<FieldDef>)
      ?.values() || []) {
      fieldWatcher.run(updateId);
    }

    this.#runFormStateTracker(updateId);
  };

  readonly #onSubmit: Exclude<OnSubmit<FieldDef>, OnSubmitCb<FieldDef>>;

  constructor({
    onSubmit,
    validateOn,
  }: {
    onSubmit: OnSubmit<FieldDef>;
    validateOn: ValidateOn;
  }) {
    this.#onSubmit =
      typeof onSubmit === "function"
        ? {
            onSubmit,
          }
        : onSubmit;
    this.#validateOn = validateOn;
    FIELDS.set(this, this.#fields);
    VALUES.set(this, this.#values);
    DEFAULT_VALUES.set(this, this.#defaultValues);
    IS_EQUAL_FNS.set(this, this.#isEqualFns);
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
    return !!this.#values.size || !!this.#clearedValues.size;
  }
  get isValid(): boolean {
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
  get validateOn(): ValidateOn {
    return this.#validateOn;
  }

  readonly isFieldRegistered = (name: Names<FieldDef>): boolean =>
    !!this.getRegisteredField(name);
  readonly getRegisteredField = <Name extends Names<FieldDef>>(
    name: Name
  ): Field<PathValue<FieldDef, Name>, Name> | undefined =>
    this.#fields.get(name) as Field<PathValue<FieldDef, Name>, Name>;

  readonly setFieldValue = <Name extends Names<FieldDef>>(
    name: Name,
    value: PathValue<FieldDef, Name> | undefined
  ): void => {
    if (value == undefined) {
      this.#clearedValues.add(name);
      this.#values.delete(name);
    } else {
      // Do NOT set equal values.  Include defaults.
      const curValue = this.getFieldValue(name, true);
      const defaultValue = this.getFieldDefaultValue(name);
      const isEqual = this.getFieldIsEqual(name);
      if (curValue !== undefined && isEqual(value, curValue)) {
        return;
      } else if (defaultValue !== undefined && isEqual(value, defaultValue)) {
        // Allow default to fall through
        this.#values.delete(name);
      } else {
        this.#values.set(name, value);
      }

      this.#clearedValues.delete(name);
    }

    switch (this.#validateOn) {
      case "submit":
        if (this.submitCount > 0 && !this.isFieldValid(name)) {
          //NOTE: validateField calls state trackers
          this.validateField(name);
          return;
        }
        break;
      case "blur":
        // If field is NOT registered validation will occur on change
        if (!this.isFieldRegistered(name)) {
          //NOTE: validateField calls state trackers
          this.validateField(name);
          return;
        }
        break;
      case "touched":
        {
          // If field is NOT registered validation will occur on change
          const field = this.getRegisteredField(name);
          if (!field || this.isFieldTouched(field)) {
            //NOTE: validateField calls state trackers
            this.validateField(name);
            return;
          }
        }
        break;
      case "all":
      case "change":
        //NOTE: validateField calls state trackers
        this.validateField(name);
        return;
    }
    // If validateField is NOT called, run field state tracker.
    this.#runFieldStateTrackers(name);
  };
  readonly getFieldValue = <Name extends Names<FieldDef>>(
    name: Name,
    dirtyOnly = true
  ): PathValue<FieldDef, Name> | undefined => {
    if (this.#values.has(name) || dirtyOnly) {
      return this.#values.get(name);
    } else if (!this.#clearedValues.has(name)) {
      return this.getFieldDefaultValue(name);
    }
  };
  readonly getFieldDefaultValue = <Name extends Names<FieldDef>>(
    name: Name
  ): PathValue<FieldDef, Name> | undefined => {
    for (const defaultValues of this.#defaultValues.values()) {
      if (defaultValues.has(name)) {
        return defaultValues.get(name);
      }
    }
  };
  readonly getFieldIsEqual = <Name extends Names<FieldDef>>(
    name: Name
  ): IsEqualFn<PathValue<FieldDef, Name>> => {
    for (const valueEquality of this.#isEqualFns.values()) {
      if (valueEquality.has(name)) {
        return valueEquality.get(name) as IsEqualFn<PathValue<FieldDef, Name>>;
      }
    }
    return DEFAULT_VALUE_EQUALITY;
  };

  readonly isFieldValid = (name: Names<FieldDef>): boolean =>
    !!this.getFieldErrors(name).next().done;
  readonly isFieldValidating = (name: Names<FieldDef>): boolean =>
    this.#validatingFields.has(name);
  readonly isFieldTouched = (field: Field<any, string, any>): boolean =>
    this.#touchedFields.has(field);
  readonly setFieldTouched = (
    field: Field<any, string, any>,
    touched: boolean,
    { updateId }: { updateId?: symbol } = {}
  ): void => {
    if (touched) {
      const isNotTouched = !this.isFieldTouched(field);
      if (isNotTouched) {
        this.#touchedFields.add(field);
      }
      switch (this.#validateOn) {
        case "blur":
        case "all":
          this.validateField(field.props.name as Names<FieldDef>, {
            updateId,
          });
          return;
        case "touched":
          if (isNotTouched) {
            this.validateField(field.props.name as Names<FieldDef>, {
              updateId,
            });
            return;
          }
          break;
        default:
          break;
      }
      this.#runFieldStateTrackers(field.props.name, updateId);
    } else if (this.isFieldTouched(field)) {
      this.#touchedFields.delete(field);
      this.#runFieldStateTrackers(field.props.name, updateId);
    }
  };
  readonly setTouchedAll = (
    touched: boolean,
    { updateId = Symbol() }: { updateId?: symbol } = {}
  ): void => {
    for (const field of this.fields()) {
      this.setFieldTouched(field, touched, { updateId });
    }
  };

  readonly isFieldDirty = (name: Names<FieldDef>): boolean =>
    this.#values.has(name) || this.#clearedValues.has(name);
  readonly isFieldLoading = (name: Names<FieldDef>): boolean =>
    this.#loading.has(name);
  readonly isFieldCleared = (name: Names<FieldDef>): boolean =>
    this.#clearedValues.has(name);
  readonly getFieldErrors = function* (
    this: Form<FieldDef>,
    name: Names<FieldDef>
  ): IterableIterator<InvalidResponse> {
    for (const fieldValidator of this.#fieldValidators.get(name)?.values() ||
      []) {
      yield* fieldValidator.errors();
    }
  }.bind(this);

  readonly validateField = (
    name: Names<FieldDef>,
    { updateId }: { updateId?: symbol } = {}
  ): Promise<boolean> | boolean => {
    let hasPromise = false;

    const results: (Promise<boolean> | boolean)[] = [];
    for (const fieldValidator of this.#fieldValidators.get(name)?.values() ||
      []) {
      const result = fieldValidator.validate();

      if (result instanceof Promise) {
        hasPromise = true;
        results.push(result);
      } else {
        results.push(result);
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

    for (const name of this.#fieldValidators.keys()) {
      const result = this.validateField(name, {
        updateId,
      });
      if (result instanceof Promise) {
        hasPromise = true;
      }
      results.push(result);
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
    event?:
      | React.FormEvent<HTMLFormElement>
      | React.FormEvent<HTMLButtonElement>
      | React.FormEvent<HTMLInputElement>
  ): Promise<InvalidResponse | ErrorsObject<FieldDef> | undefined> => {
    if (this.#onSubmit.onStart) {
      await this.#onSubmit.onStart({
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

      const errors = this.getErrorsObject();

      this.#runFormStateTracker();

      if (this.#onSubmit.onInvalid) {
        await this.#onSubmit.onInvalid({
          event,
          dirtyValues: this.getValuesObject(true),
          values: this.getValuesObject(false),
          form: this,
          errors,
        });
      }

      if (this.#onSubmit.finally) {
        await this.#onSubmit.finally({
          event,
          dirtyValues: this.getValuesObject(true),
          values: this.getValuesObject(false),
          form: this,
        });
      }

      return errors;
    }

    try {
      await this.#onSubmit.onSubmit({
        event,
        dirtyValues: this.getValuesObject(true),
        values: this.getValuesObject(false),
        form: this,
      });
    } catch (error: any) {
      this.#submissionError = (() => {
        if (error) {
          return "message" in error ? error : new Error(String(error));
        }

        return new Error("Unknown Submission Error.");
      })();

      this.#isSubmitting = false;

      this.#runFormStateTracker();

      if (this.#onSubmit.onError) {
        await this.#onSubmit.onError({
          event,
          dirtyValues: this.getValuesObject(true),
          values: this.getValuesObject(false),
          form: this,
          error,
        });
      }
      if (this.#onSubmit.finally) {
        await this.#onSubmit.finally({
          event,
          dirtyValues: this.getValuesObject(true),
          values: this.getValuesObject(false),
          form: this,
        });
      }
      return error;
    }

    this.#isSubmitting = false;
    this.#isSubmitted = true;

    this.#runFormStateTracker();

    if (this.#onSubmit.onSuccess) {
      await this.#onSubmit.onSuccess({
        event,
        dirtyValues: this.getValuesObject(true),
        values: this.getValuesObject(false),
        form: this,
      });
    }

    if (this.#onSubmit.finally) {
      await this.#onSubmit.finally({
        event,
        dirtyValues: this.getValuesObject(true),
        values: this.getValuesObject(false),
        form: this,
      });
    }
  };

  readonly handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    this.submit(event);
  };

  readonly fields = (): IterableIterator<
    Field<PathValue<FieldDef, Names<FieldDef>>>
  > => this.#fields.values();
  readonly values = function* (
    this: Form<FieldDef>,
    dirtyOnly = true
  ): IterableIterator<[Names<FieldDef>, PathValue<FieldDef, Names<FieldDef>>]> {
    const yieldedKeys = new Set<string>();

    for (const [name, value] of this.#values) {
      yieldedKeys.add(name);
      yield [name as Names<FieldDef>, value];
    }
    if (!dirtyOnly) {
      for (const name of this.#clearedValues) {
        yieldedKeys.add(name);
      }

      for (const defaultValues of this.#defaultValues.values()) {
        for (const [name, defaultValue] of defaultValues) {
          if (!yieldedKeys.has(name)) {
            yieldedKeys.add(name);
            yield [name as Names<FieldDef>, defaultValue.valueOf()];
          }
        }
      }
    }
  }.bind(this);

  readonly clearedFields = (): IterableIterator<Names<FieldDef>> =>
    this.#clearedValues.values();

  readonly errors = function* (
    this: Form<FieldDef>
  ): IterableIterator<[Names<FieldDef>, InvalidResponse[]]> {
    for (const name of this.#fieldValidators.keys()) {
      const errors = [...this.getFieldErrors(name)];
      if (errors.length) {
        yield [name as Names<FieldDef>, errors];
      }
    }
  }.bind(this);
  readonly getValuesObject = (dirtyOnly = true): ValuesObject<FieldDef> => {
    const valueObj = {} as ValuesObject<FieldDef>;

    for (const [name, value] of this.values(dirtyOnly)) {
      set(valueObj, name, value);
    }

    return valueObj;
  };
  readonly getErrorsObject = (): ErrorsObject<FieldDef> => {
    const errorsObj = {} as ErrorsObject<FieldDef>;

    for (const [name, value] of this.errors()) {
      set(errorsObj, name, value);
    }

    return errorsObj;
  };

  readonly resetFieldErrors = (
    name: Names<FieldDef>,
    { updateId }: { updateId?: symbol } = {}
  ): void => {
    for (const fieldValidator of this.#fieldValidators.get(name)?.values() ||
      []) {
      fieldValidator.reset();
    }
    this.#runFieldStateTrackers(name, updateId);
  };

  readonly resetErrors = ({
    updateId = Symbol(),
  }: { updateId?: symbol } = {}): void => {
    for (const name of this.#fieldValidators.keys()) {
      this.resetFieldErrors(name, { updateId });
    }
  };

  readonly resetField = (
    name: Names<FieldDef>,
    { updateId = Symbol() }: { updateId?: symbol } = {}
  ): void => {
    // Reset Errors
    this.resetFieldErrors(name, { updateId });

    this.#values.delete(name);

    this.#clearedValues.delete(name);

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
  readonly reset = ({
    updateId = Symbol(),
  }: { updateId?: symbol } = {}): void => {
    const resetFields = new Set<string>();

    for (const {
      props: { name },
    } of this.#fields.values()) {
      resetFields.add(name);
      this.resetField(name, { updateId });
    }

    for (const name of this.#fieldValidators.keys()) {
      this.resetField(name, { updateId });
    }

    for (const name of this.#values.keys()) {
      if (!resetFields.has(name)) {
        this.resetField(name as Names<FieldDef>, { updateId });
      }
    }

    this.resetSubmitCount({ updateId });
    this.resetSubmitted({ updateId });
    this.resetSubmissionError({ updateId });

    this.#runFormStateTracker(updateId);
  };

  readonly #runFormStateTracker = (() => {
    const stateTracker = function* (this: Form<FieldDef>) {
      type StateSnapShot = Omit<
        Form<FieldDef>,
        | "isFieldRegistered"
        | "getRegisteredField"
        | "setFieldValue"
        | "getFieldValue"
        | "getFieldDefaultValue"
        | "getFieldIsEqual"
        | "isFieldValid"
        | "isFieldValidating"
        | "isFieldTouched"
        | "setFieldTouched"
        | "isFieldDirty"
        | "isFieldLoading"
        | "isFieldCleared"
        | "getFieldErrors"
        | "clearedFields"
        | "validateField"
        | "validateAll"
        | "submit"
        | "handleSubmit"
        | "fields"
        | "values"
        | "errors"
        | "getValuesObject"
        | "getErrorsObject"
        | "setTouchedAll"
        | "resetFieldErrors"
        | "resetErrors"
        | "resetField"
        | "reset"
        | "resetSubmitCount"
        | "resetSubmitted"
        | "resetSubmissionError"
        | "validateOn"
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
export const parseFieldDef = function* <
  FieldDef extends Record<string, unknown>
>(
  fieldDef: FieldDef,
  namePrefix?: string
): IterableIterator<[Names<FieldDef>, PathValue<FieldDef, Names<FieldDef>>]> {
  for (const key in fieldDef) {
    if (hasOwnProperty.call(fieldDef, key)) {
      const value = fieldDef[key];
      const name = namePrefix ? `${namePrefix}.${key}` : key;
      if (value instanceof FieldValue) {
        yield [name as any, value.valueOf()];
      } else {
        yield* parseFieldDef(value as Record<string, unknown>, name) as any;
      }
    }
  }
};
const parseValidatorDefs = function* <FieldDef extends Record<string, unknown>>(
  validatorDef: ValidatorDefs<FieldDef>,
  namePrefix?: string
): IterableIterator<
  [
    Names<FieldDef>,
    (
      | Validator<PathValue<FieldDef, Names<FieldDef>>, Names<FieldDef>>
      | Iterable<
          Validator<PathValue<FieldDef, Names<FieldDef>>, Names<FieldDef>>
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

const parseIsEqualDef = function* <FieldDef extends Record<string, unknown>>(
  isEqualDef: IsEqualDef<FieldDef>,
  namePrefix?: string
): IterableIterator<
  [Names<FieldDef>, IsEqualFn<PathValue<FieldDef, Names<FieldDef>>>]
> {
  for (const key in isEqualDef) {
    if (hasOwnProperty.call(isEqualDef, key)) {
      const value = isEqualDef[key];
      const name = namePrefix ? `${namePrefix}.${key}` : key;
      if (typeof value === "function") {
        yield [name as any, value];
      } else {
        yield* parseIsEqualDef(value as any, name);
      }
    }
  }
};

type PathImpl<
  K extends string,
  V,
  LeafsOnly extends boolean
> = V extends FieldValue<any>
  ? `${K}`
  : V extends Record<string, unknown>
  ? LeafsOnly extends true
    ? `${K}.${Path<V, LeafsOnly>}`
    : `${K}` | `${K}.${Path<V, LeafsOnly>}`
  : never;
export type Path<
  T extends Record<string, unknown>,
  LeafsOnly extends boolean
> = {
  [K in keyof T]-?: PathImpl<K & string, T[K], LeafsOnly>;
}[keyof T];
export type Names<T extends Record<string, unknown>> = Path<T, true>;

type PathValueImpl<
  T extends Record<string, unknown>,
  P extends Path<T, false>
> = T[P] extends FieldValue<infer U>
  ? U
  : P extends `${infer K}.${infer R}`
  ? T[K] extends FieldValue<infer U>
    ? U
    : T[K] extends Record<string, unknown>
    ? R extends Path<T[K], false>
      ? PathValueImpl<T[K], R>
      : never
    : never
  : never;
export type PathValue<
  T extends Record<string, unknown>,
  P extends Path<T, true>
> = T[P] extends FieldValue<infer U>
  ? U
  : P extends `${infer K}.${infer R}`
  ? T[K] extends FieldValue<infer U>
    ? U
    : T[K] extends Record<string, unknown>
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

export type ValuesObject<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K] extends FieldValue<infer U>
    ? U
    : T[K] extends Record<string, unknown>
    ? ValuesObject<T[K]>
    : never;
};

export type ErrorsObject<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K] extends FieldValue
    ? InvalidResponse[]
    : T[K] extends Record<string, unknown>
    ? ErrorsObject<T[K]>
    : never;
};

type ValidatorDefsImpl<T extends Record<string, unknown>, P extends string> = {
  [K in keyof T]?: T[K] extends infer G
    ? K extends string
      ? G extends FieldValue<infer U>
        ? Validator<U, `${P}.${K}`> | Iterable<Validator<U, `${P}.${K}`>>
        : G extends Record<string, unknown>
        ? ValidatorDefsImpl<G, `${P}.${K}`>
        : never
      : never
    : never;
};
export type ValidatorDefs<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K] extends infer G
    ? K extends string
      ? G extends FieldValue<infer U>
        ? Validator<U, K> | Iterable<Validator<U, K>>
        : G extends Record<string, unknown>
        ? ValidatorDefsImpl<G, K>
        : never
      : never
    : never;
};

export type DefaultValuesDef<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K] extends infer G
    ? K extends string
      ? G extends FieldValue<infer U>
        ? FieldValue<U>
        : G extends Record<string, unknown>
        ? DefaultValuesDef<G>
        : never
      : never
    : never;
} &
  {
    [K in Path<T, true>]?: FieldValue<PathValue<T, K>>;
  };

export type IsEqualFn<T = unknown> = (a: T, b: T) => boolean;
export type IsEqualDef<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K] extends infer G
    ? K extends string
      ? G extends FieldValue<infer U>
        ? IsEqualFn<U>
        : G extends Record<string, unknown>
        ? IsEqualDef<G>
        : never
      : never
    : never;
} &
  {
    [K in Path<T, true>]?: IsEqualFn<PathValue<T, K>>;
  };

export type IForm<FieldDef extends Record<string, unknown> = any> =
  Form<FieldDef>;
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

export type UseFormOptions<FieldDef extends Record<string, unknown>> = {
  onSubmit: OnSubmit<FieldDef>;
  defaultValues?: FieldDef;
  validators?: ValidatorDefs<FieldDef>;
  isEqual?: IsEqualDef<FieldDef>;
  validateOn?: ValidateOn;
};
export const useForm = <FieldDef extends Record<string, unknown>>({
  onSubmit,
  defaultValues,
  validators,
  isEqual,
  validateOn = "submit",
}: UseFormOptions<FieldDef>): Form<FieldDef> => {
  const [, watcher] = useState(Symbol());

  const [form] = useState(() => {
    const form = new Form<FieldDef>({ onSubmit, validateOn });

    (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).add(watcher);

    return form;
  });

  useDefaultValuesUtil(
    useMemo(
      () => ({
        defaultValues: defaultValues || {},
        form,
        updateIds: {
          mount: Symbol(),
          unMount: Symbol(),
        },
      }),
      [defaultValues, form]
    )
  );

  useValidatorsUtil(
    useMemo(
      () => ({
        validators: validators || {},
        form,
        updateIds: {
          mount: Symbol(),
          unMount: Symbol(),
        },
      }),
      [form, validators]
    )
  );

  useIsEqual(
    useMemo(
      () => ({
        isEqual: isEqual || {},
        form,
      }),
      [form, isEqual]
    )
  );

  return form;
};

export const useFormContext = <
  FieldDef extends Record<string, unknown> = Record<string, unknown>
>(
  formContext?: Form<FieldDef>
): Form<FieldDef> | undefined => {
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
    return form || undefined;
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

const useDefaultValuesUtil = (
  options: UseDefaultValuesOptions<any> & {
    updateIds?: {
      mount: symbol;
      unMount: symbol;
    };
  }
): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useDefaultValues",
  });

  const [state] = useState(() => {
    const id = Symbol();
    const defaultValuesMap = new Map<string, any>();
    (DEFAULT_VALUES.get(form) as Map<symbol, Map<string, any>>).set(
      id,
      defaultValuesMap
    );

    return { id, defaultValuesMap };
  });

  const namePrefix = useNamePrefix();

  const updateIdsRef = useRef<{
    mount: symbol;
    unMount: symbol;
  }>();
  updateIdsRef.current = options.updateIds;

  const modifiedFields = useMemo(() => {
    const { defaultValuesMap } = state;

    const modifiedFields = new Set<string>(defaultValuesMap.keys());

    defaultValuesMap.clear();

    for (const [_name, defaultValue] of parseFieldDef(options.defaultValues)) {
      const name = namePrefix ? prefixName(_name, namePrefix) : _name;
      modifiedFields.add(name);
      defaultValuesMap.set(name, defaultValue);
    }

    return modifiedFields;
  }, [namePrefix, options.defaultValues, state]);

  useEffect(() => {
    const updateId = updateIdsRef.current?.mount || Symbol();

    const fieldStateTracker = RUN_FIELD_STATE_TRACKERS.get(form) as (
      name: string,
      updateId: symbol
    ) => void;

    for (const name of modifiedFields) {
      fieldStateTracker(name, updateId);
    }
  }, [form, modifiedFields]);

  useEffect(
    () => () => {
      const { defaultValuesMap, id } = state;

      (DEFAULT_VALUES.get(form) as Map<symbol, Map<string, any>>).delete(id);

      const updateId = updateIdsRef.current?.unMount || Symbol();

      const fieldStateTracker = RUN_FIELD_STATE_TRACKERS.get(form) as (
        name: string,
        updateId: symbol
      ) => void;

      for (const name of defaultValuesMap.keys()) {
        fieldStateTracker(name, updateId);
      }
    },
    [form, state]
  );
};
export type UseDefaultValuesOptions<FieldDef extends Record<string, unknown>> =
  {
    defaultValues: DefaultValuesDef<FieldDef>;
    form?: Form<FieldDef>;
  };
export const useDefaultValues = <FieldDef extends Record<string, unknown>>(
  options: UseDefaultValuesOptions<FieldDef>
): void => {
  return useDefaultValuesUtil(options);
};

const useValidatorsUtil = (
  options: {
    updateIds?: {
      mount: symbol;
      unMount: symbol;
    };
  } & UseValidatorOptions<any>
): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useValidators",
  });

  const namePrefix = useNamePrefix();

  const updateIdsRef = useRef<{
    mount: symbol;
    unMount: symbol;
  }>();
  updateIdsRef.current = options.updateIds;

  const fieldValidators = useMemo(
    () =>
      function* () {
        for (const [name, validators] of parseValidatorDefs(
          options.validators
        )) {
          yield new FieldValidator({
            field: namePrefix ? prefixName(name, namePrefix) : name,
            form,
            validators:
              typeof validators === "function" ? [validators] : validators,
          });
        }
      },
    [form, namePrefix, options.validators]
  );

  useEffect(() => {
    const fieldValidatorsMap = FIELD_VALIDATORS.get(form) as Map<
      string,
      Set<FieldValidator>
    >;

    const updateId = updateIdsRef.current?.mount || Symbol();

    const fieldValidatorsForRemoval: FieldValidator[] = [];

    for (const fieldValidator of fieldValidators()) {
      fieldValidatorsForRemoval.push(fieldValidator);

      const shouldRunValidation = (() => {
        if (options.shouldRunValidation === "auto") {
          for (const curFieldValidator of fieldValidatorsMap.get(
            fieldValidator.name
          ) || []) {
            if (curFieldValidator.hasRun) {
              return true;
            }
          }
          return false;
        } else {
          return options.shouldRunValidation ?? false;
        }
      })();

      if (fieldValidatorsMap.has(fieldValidator.name)) {
        (
          fieldValidatorsMap.get(fieldValidator.name) as Set<FieldValidator>
        ).add(fieldValidator);
      } else {
        fieldValidatorsMap.set(fieldValidator.name, new Set([fieldValidator]));
      }

      if (shouldRunValidation) {
        form.validateField(fieldValidator.name, {
          updateId,
        });
      }
    }

    return () => {
      for (const fieldValidator of fieldValidatorsForRemoval) {
        const fieldValidators = fieldValidatorsMap.get(fieldValidator.name);
        if (fieldValidators) {
          fieldValidators.delete(fieldValidator);
          if (!fieldValidators.size) {
            fieldValidatorsMap.delete(fieldValidator.name);
          }
        }
      }
    };
  }, [fieldValidators, form, options.shouldRunValidation]);
};

export type UseValidatorOptions<FieldDef extends Record<string, unknown>> = {
  validators: ValidatorDefs<FieldDef>;
  form?: Form<FieldDef>;
  /**
   * @default ["auto"]
   * `"auto"` will run the {@link UseValidatorOptions.validators} on first mount when current validators on the same field have already run.
   */
  shouldRunValidation?: boolean | "auto";
};
export const useValidators = <FieldDef extends Record<string, unknown>>(
  options: UseValidatorOptions<FieldDef>
): void => {
  return useValidatorsUtil(options);
};

export type UseIsEqualOptions<FieldDef extends Record<string, unknown>> = {
  isEqual: IsEqualDef<FieldDef>;
  form?: Form<FieldDef>;
};
export const useIsEqual = <FieldDef extends Record<string, unknown>>(
  options: UseIsEqualOptions<FieldDef>
): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useIsEqual",
  });

  const [state] = useState(() => {
    const id = Symbol();
    const isEqualFnsMap = new Map<string, IsEqualFn<any>>();
    (IS_EQUAL_FNS.get(form) as Map<symbol, Map<string, any>>).set(
      id,
      isEqualFnsMap
    );

    return { id, isEqualFnsMap };
  });

  const namePrefix = useNamePrefix();

  useMemo(() => {
    const { isEqualFnsMap } = state;

    isEqualFnsMap.clear();

    for (const [_name, isEqual] of parseIsEqualDef(options.isEqual)) {
      const name = namePrefix ? prefixName(_name, namePrefix) : _name;
      isEqualFnsMap.set(name, isEqual);
    }
  }, [namePrefix, options.isEqual, state]);

  useEffect(
    () => () => {
      const { id } = state;

      (IS_EQUAL_FNS.get(form) as Map<symbol, Map<string, any>>).delete(id);
    },
    [form, state]
  );
};

export const useWatcher = function <
  T = unknown,
  FieldDef extends Record<string, unknown> = any
>(options: {
  name: string | Field<any, string, any>;
  form?: Form<FieldDef>;
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

  const fieldWatcher = useMemo(() => {
    const name = options.name;
    return new FieldWatcher({
      nameOrField:
        name instanceof Field || !namePrefix
          ? name
          : prefixName(name, namePrefix),
      form,
      watcher,
    });
  }, [form, namePrefix, options.name]);

  useEffect(() => {
    const fieldWatchersMap = FIELD_WATCHERS.get(form) as Map<
      string,
      Set<FieldWatcher<any>>
    >;

    if (fieldWatchersMap.has(fieldWatcher.name)) {
      (fieldWatchersMap.get(fieldWatcher.name) as Set<FieldWatcher<any>>).add(
        fieldWatcher
      );
    } else {
      fieldWatchersMap.set(fieldWatcher.name, new Set([fieldWatcher]));
    }

    return () => {
      const fieldWatchers = fieldWatchersMap.get(fieldWatcher.name);
      if (fieldWatchers) {
        fieldWatchers.delete(fieldWatcher);
        if (!fieldWatchers.size) {
          fieldWatchersMap.delete(fieldWatcher.name);
        }
      }
    };
  }, [fieldWatcher, form]);

  return useMemo(
    () => ({
      value: form.getFieldValue(fieldWatcher.name) as T,
      defaultValue: form.getFieldDefaultValue(fieldWatcher.name) as T,
      errors: [...form.getFieldErrors(fieldWatcher.name)],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldWatcher, form, updateId]
  );
};

export type UseFieldOptions<
  T = unknown,
  Name extends string = string,
  FieldDef extends Record<string, unknown> = Record<string, unknown>
> = {
  name: Name;
  defaultValue?: T;
  isEqual?: IsEqualFn<T>;
  validator?: Validator<any> | Iterable<Validator<any>>;
  /**
   * @see UseValidatorOptions.shouldRunValidation
   */
  shouldRunValidation?: boolean | "auto";
  shouldUnregister?: boolean;
  form?: Form<FieldDef>;
};

const FIELDS_REF_COUNT = new WeakMap<Field<any, string, undefined>, number>();
/**
 * @returns the **same** {@link Field} instance for every call to with matching `name` and {@link Form}.  The fist call creates the {@link Field} instance.
 */
export const useField = function <
  T = unknown,
  Name extends string = string,
  FieldDef extends Record<string, unknown> = Record<string, unknown>
>(options: UseFieldOptions<T, Name, FieldDef>): Field<T, Name> {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useField",
  });

  const namePrefix = useNamePrefix();

  const [, watcher] = useState(Symbol());

  const shouldUnregisterRef = useRef<boolean>();
  shouldUnregisterRef.current = options.shouldUnregister;

  const field = useMemo(() => {
    const name = namePrefix
      ? prefixName(options.name, namePrefix)
      : options.name;

    const field = (form.getRegisteredField(name) ||
      new Field<T, string>({
        name,
        form,
        shouldUnregister: shouldUnregisterRef.current,
      })) as Field<T, string>;

    FIELDS_REF_COUNT.set(field, (FIELDS_REF_COUNT.get(field) ?? 0) + 1);

    // Set immediately so that any sync useField calls will get the same field
    (FIELDS.get(form) as Map<string, Field<any, string, undefined>>).set(
      field.props.name,
      field
    );

    return field;
  }, [form, namePrefix, options.name]);

  const updateIdsRef = useRef() as React.MutableRefObject<{
    mount: symbol;
    unMount: symbol;
  }>;
  updateIdsRef.current = {
    mount: Symbol(),
    unMount: Symbol(),
  };

  const defaultValuesOpts = useMemo(
    () => ({
      defaultValues:
        options.defaultValue === undefined
          ? {}
          : // Name prefix will be added by useDefaultValuesUtil
            { [options.name]: new FieldValue(options.defaultValue) },
      form,
      updateIds: updateIdsRef.current,
    }),
    [form, options.defaultValue, options.name]
  );

  const validatorDef = useMemo(
    () =>
      options.validator === undefined
        ? {}
        : // Name prefix will be added by _useValidators_
          { [options.name]: options.validator },
    [options.name, options.validator]
  );

  const validatorOps = useMemo(
    () => ({
      validators: validatorDef,
      form,
      updateIds: updateIdsRef.current,
      shouldRunValidation: options.shouldRunValidation,
    }),
    [form, options.shouldRunValidation, validatorDef]
  );

  const isEqualOpts = useMemo<UseIsEqualOptions<FieldDef>>(
    () =>
      ({
        isEqual: options.isEqual
          ? {
              [options.name as string]: options.isEqual,
            }
          : {},
        form,
      } as any),
    [form, options.isEqual, options.name]
  );

  useEffect(() => {
    const fieldWatchersMap = FIELD_WATCHERS.get(form) as Map<
      string,
      Set<FieldWatcher<any>>
    >;

    const fieldWatcher = new FieldWatcher({
      nameOrField: field,
      watcher,
    });

    if (fieldWatchersMap.has(fieldWatcher.name)) {
      (fieldWatchersMap.get(fieldWatcher.name) as Set<FieldWatcher<any>>).add(
        fieldWatcher
      );
    } else {
      fieldWatchersMap.set(field.props.name, new Set([fieldWatcher]));
    }

    return () => {
      const fieldWatchers = fieldWatchersMap.get(fieldWatcher.name);
      if (fieldWatchers) {
        fieldWatchers.delete(fieldWatcher);
        if (!fieldWatchers.size) {
          fieldWatchersMap.delete(fieldWatcher.name);
        }
      }

      const refCount = (FIELDS_REF_COUNT.get(field) as number) - 1;
      FIELDS_REF_COUNT.set(field, refCount);

      if (refCount === 0) {
        (FIELDS.get(form) as Map<string, Field<any, string, undefined>>).delete(
          field.props.name
        );

        if (field.shouldUnregister) {
          field.reset();
        }
      }
    };
  }, [field, form]); // NOTE if the form changes, the field changes.

  useDefaultValuesUtil(defaultValuesOpts as any);

  useValidatorsUtil(validatorOps);

  useIsEqual(isEqualOpts);

  return field as Field<T, Name>;
};

/**
 * @param options.shouldUnregister `true` (default) sets loading to false for this invocation of {@link Form.useLoading} when it is unmounted.
 */
export const useLoading = <
  FieldDef extends Record<string, unknown> = any
>(options: {
  loading: boolean;
  name: string | Field<any, string, any> | (string | Field<any, string, any>)[];
  form?: Form<FieldDef>;
}): void => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useLoading",
  });

  const namePrefix = useNamePrefix();

  const [id] = useState(Symbol());

  const setLoading = useCallback(
    (loading: boolean) => {
      const namesOrFields = Array.isArray(options.name)
        ? options.name
        : [options.name];

      const loadingMap = LOADING.get(form) as Map<string, Set<symbol>>;

      const updateId = Symbol();

      const runFieldStateTrackers = RUN_FIELD_STATE_TRACKERS.get(form) as (
        name: string,
        updateId: symbol
      ) => void;

      for (const nameOrField of namesOrFields) {
        const fieldName =
          nameOrField instanceof Field ? nameOrField.props.name : nameOrField;

        const name = namePrefix ? prefixName(fieldName, namePrefix) : fieldName;

        if (loading) {
          if (loadingMap.has(name)) {
            (loadingMap.get(name) as Set<symbol>).add(id);
          } else {
            loadingMap.set(name, new Set([id]));
          }
        } else {
          if (loadingMap.has(name)) {
            const fieldLoading = loadingMap.get(name) as Set<symbol>;
            fieldLoading.delete(id);
            if (!fieldLoading.size) {
              loadingMap.delete(name);
            }
          }
        }
        runFieldStateTrackers(name, updateId);
      }

      (RUN_FORM_STATE_TRACKER.get(form) as (updateId: symbol) => void)(
        updateId
      );
    },
    [form, id, namePrefix, options.name]
  );

  useEffect(() => {
    setLoading(options.loading);
  }, [options.loading, setLoading]);

  useEffect(
    () => () => {
      setLoading(false);
    },
    [setLoading]
  );
};

export const useWatchAll = <
  FieldDef extends Record<string, unknown> = any
>(options: {
  form?: Form<FieldDef>;
}): Pick<SubmitState<FieldDef>, "dirtyValues" | "values"> & {
  errors: ErrorsObject<FieldDef>;
} => {
  const form = useFormContextUtil({
    form: options.form,
    hookName: "useWatchAll",
  });

  const [updateId, watchAllCb] = useState(Symbol());

  useEffect(() => {
    (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).add(
      watchAllCb
    );
    return () => {
      (FORM_WATCHERS.get(form) as Set<(updateId: symbol) => void>).delete(
        watchAllCb
      );
    };
  }, [form]);

  return useMemo(
    () => ({
      values: form.getValuesObject(false),
      dirtyValues: form.getValuesObject(true),
      errors: form.getErrorsObject(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateId, form]
  );
};
