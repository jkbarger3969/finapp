import React from "react";

import { TextFieldControlled, TextFieldControlledProps } from "../shared";
import {
  Validator,
  FieldValue,
  useNamePrefix,
  prefixName,
} from "../../../useKISSForm/form";

export type NameInputProps = {
  firstName?: Partial<
    Omit<
      TextFieldControlledProps,
      "type" | "name" | "form" | "shouldUnregister" | "validator"
    >
  >;
  lastName?: Partial<
    Omit<
      TextFieldControlledProps,
      "type" | "name" | "form" | "shouldUnregister" | "validator"
    >
  >;
};

export type NameProps = {
  showLabels?: boolean;
} & NameInputProps &
  Omit<
    TextFieldControlledProps,
    "defaultValue" | "name" | "type" | "validator"
  >;

const validName: Validator<string | undefined> = (value) => {
  if (value === undefined) {
    return;
  } else if (!/^[.A-Za-z\s]+$/i.test(value)) {
    return new RangeError("Letters Only");
  } else if (value.length < 3) {
    return RangeError("Too Short");
  }
};

export const NAME_NAME = "name";
export type NameFieldDef = {
  [NAME_NAME]: {
    first: FieldValue<string>;
    last: FieldValue<string>;
  };
};

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
    firstName: firstNameProps = {},
    lastName: lastNameProps = {},
    ...globalProps
  } = props;

  const namePrefix = useNamePrefix(NAME_NAME);

  return {
    firstNameInput: (
      <TextFieldControlled
        label={showLabels && "First Name"}
        {...globalProps}
        {...firstNameProps}
        validator={validName}
        name={prefixName("first", NAME_NAME)}
        type="text"
      />
    ),
    firstNameInputName: prefixName("first", namePrefix),
    lastNameInput: (
      <TextFieldControlled
        label={showLabels && "Last Name"}
        {...globalProps}
        {...lastNameProps}
        validator={validName}
        name={prefixName("last", NAME_NAME)}
        type="text"
      />
    ),
    lastNameInputName: prefixName("last", namePrefix),
  };
};
