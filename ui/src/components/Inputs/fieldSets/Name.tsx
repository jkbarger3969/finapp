import React, { Fragment, useMemo } from "react";
import { UseControllerProps } from "react-hook-form";

import { TextFieldControlled, TextFieldControlledProps } from "../shared";

export type NameProps = {
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
  namePrefix?: string;
} & Omit<TextFieldControlledProps, "name" | "defaultValue" | "type">;

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
export const Name = (props: NameProps): JSX.Element => {
  const {
    firstName: firstNameProps = {},
    lastName: lastNameProps = {},
    namePrefix,
    ...globalProps
  } = props;

  const name = namePrefix ? `${namePrefix}.${NAME_NAME}` : NAME_NAME;

  return (
    <Fragment>
      <TextFieldControlled
        label="First Name"
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
      <TextFieldControlled
        label="Last Name"
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
    </Fragment>
  );
};
