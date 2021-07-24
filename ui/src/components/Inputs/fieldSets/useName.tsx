import React, { useMemo } from "react";
import { UseControllerProps } from "react-hook-form";

import { TextFieldControlled, TextFieldControlledProps } from "../shared";

export type NameInputProps = {
  firstName?: Partial<
    Omit<
      TextFieldControlledProps,
      "type" | "control" | "name" | "shouldUnregister"
    >
  >;
  lastName?: Partial<
    Omit<
      TextFieldControlledProps,
      "type" | "control" | "name" | "shouldUnregister"
    >
  >;
};

export type NameProps = {
  showLabels?: boolean;
  namePrefix?: string;
} & NameInputProps &
  Omit<TextFieldControlledProps, "name" | "defaultValue" | "type">;

const nameRules: NonNullable<UseControllerProps["rules"]> = {
  minLength: {
    value: 2,
    message: "Too Short",
  },
  pattern: {
    value: /^[.A-Za-z]+$/i,
    message: "Letters Only",
  },
};

export const NAME_NAME = "name";

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
    namePrefix,
    ...globalProps
  } = props;

  const name = namePrefix ? `${namePrefix}.${NAME_NAME}` : NAME_NAME;

  return {
    firstNameInput: (
      <TextFieldControlled
        label={showLabels && "First Name"}
        {...globalProps}
        {...firstNameProps}
        rules={useMemo(
          () => ({
            ...nameRules,
            ...(globalProps.rules || {}),
            ...(firstNameProps.rules || {}),
          }),
          [firstNameProps.rules, globalProps.rules]
        )}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={`${name}.first` as any}
        type="text"
      />
    ),
    firstNameInputName: `${name}.first`,
    lastNameInput: (
      <TextFieldControlled
        label={showLabels && "Last Name"}
        {...globalProps}
        {...lastNameProps}
        rules={useMemo(
          () => ({
            ...nameRules,
            ...(globalProps.rules || {}),
            ...(lastNameProps.rules || {}),
          }),
          [globalProps.rules, lastNameProps.rules]
        )}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={`${name}.last` as any}
        type="text"
      />
    ),
    lastNameInputName: `${name}.last`,
  };
};
