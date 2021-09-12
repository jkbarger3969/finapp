import React, { useMemo } from "react";

import {
  TextFieldControlled,
  TextFieldControlledProps,
  requiredValidator,
} from "../shared";
import {
  Validator,
  FieldValue,
  useNamePrefix,
  prefixName,
  useIsEqual,
  IsEqualFn,
} from "../../../useKISSForm/form";

export type NameInputProps = {
  firstName?: Partial<
    Omit<TextFieldControlledProps, "type" | "name" | "form" | "validator">
  >;
  lastName?: Partial<
    Omit<TextFieldControlledProps, "type" | "name" | "form" | "validator">
  >;
};

export type NameProps = {
  showLabels?: boolean;
  insertNamePrefix?: string;
  required?: boolean;
  shouldUnregister?: boolean;
} & NameInputProps &
  Omit<
    TextFieldControlledProps,
    "defaultValue" | "name" | "type" | "validator"
  >;

const validName: Validator<string | undefined> = (_, { form, name }) => {
  // Validate default values too
  const value = form.getFieldValue(name, false) as string | undefined;
  if (value === undefined) {
    return;
  } else if (!/^[.A-Za-z\s]+$/i.test(value)) {
    return new RangeError("Letters Only");
  } else if (value.length < 3) {
    return RangeError("Too Short");
  }
};

const nameIsEqual: IsEqualFn<string> = (a, b) => a?.trim() === b?.trim();

export type NameFieldDef = {
  name: {
    first: FieldValue<string>;
    last: FieldValue<string>;
  };
};
export const NAME_NAME: keyof NameFieldDef = "name";

export const useName = (
  props: NameProps
): {
  [Name in keyof NameInputProps as `${Name}Input`]-?: JSX.Element;
} &
  {
    [Name in keyof NameInputProps as `${Name}InputName`]-?: string;
  } => {
  const {
    showLabels,
    insertNamePrefix,
    required,
    firstName: firstNameProps = {},
    lastName: lastNameProps = {},
    ...globalProps
  } = props;

  const name = insertNamePrefix
    ? prefixName(NAME_NAME, insertNamePrefix)
    : NAME_NAME;

  const fullName = useNamePrefix(name);

  const validator = useMemo(
    () => (required ? [requiredValidator, validName] : validName),
    [required]
  );

  useIsEqual<NameFieldDef>({
    isEqual: useMemo(
      () => ({
        [prefixName("first", name)]: nameIsEqual,
        [prefixName("last", name)]: nameIsEqual,
      }),
      [name]
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: props.form as any,
  });

  return {
    firstNameInput: (
      <TextFieldControlled
        label={showLabels && "First Name"}
        {...globalProps}
        {...firstNameProps}
        validator={validator}
        name={prefixName("first", name)}
        type="text"
      />
    ),
    firstNameInputName: prefixName("first", fullName),
    lastNameInput: (
      <TextFieldControlled
        label={showLabels && "Last Name"}
        {...globalProps}
        required={required}
        {...lastNameProps}
        validator={validator}
        name={prefixName("last", name)}
        type="text"
      />
    ),
    lastNameInputName: prefixName("last", fullName),
  };
};
