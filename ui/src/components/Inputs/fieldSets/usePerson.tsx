import React from "react";
import { TextFieldProps } from "@material-ui/core";
import { Control } from "react-hook-form";

import { useName, NameProps } from "./useName";
import { Email, EmailProps, emailName } from "../Email";
import { Phone, PhoneProps, phoneName } from "../Phone";

export type PersonProps = {
  showLabels?: boolean;
  control?: Control;
  namePrefix?: string;
  name?: Omit<NameProps, "control" | "namePrefix">;
  email?: Omit<EmailProps, "control" | "namePrefix">;
  phone?: Omit<PhoneProps, "control" | "namePrefix">;
} & Partial<
  Pick<
    TextFieldProps,
    | "color"
    | "disabled"
    | "fullWidth"
    | "hiddenLabel"
    | "margin"
    | "required"
    | "size"
    | "variant"
  >
>;

export const PERSON_NAME_PREFIX = "person";
export const personNamePrefix = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${PERSON_NAME_PREFIX}` : PERSON_NAME_PREFIX;

export const usePerson = (
  props: PersonProps
): {
  name: ReturnType<typeof useName>;
} & {
  [Name in keyof Pick<
    PersonProps,
    "email" | "phone"
  > as `${Name}Input`]-?: JSX.Element;
} &
  {
    [Name in keyof Pick<
      PersonProps,
      "email" | "phone"
    > as `${Name}InputName`]-?: string;
  } => {
  const {
    showLabels,
    name: nameProps = {},
    email: emailProps = {},
    phone: phoneProps = {},
    namePrefix: namePrefixProp,
    control,
    ...rest
  } = props;

  const namePrefix = personNamePrefix(namePrefixProp);

  return {
    name: useName({
      showLabels,
      ...rest,
      ...nameProps,
      control,
      namePrefix,
    }),
    emailInput: (
      <Email
        label={showLabels && "Email"}
        {...rest}
        {...(emailProps || {})}
        control={control}
        namePrefix={namePrefix}
      />
    ),
    emailInputName: emailName(namePrefix),
    phoneInput: (
      <Phone
        label={showLabels && "Phone"}
        {...rest}
        {...(phoneProps || {})}
        control={control}
        namePrefix={namePrefix}
      />
    ),
    phoneInputName: phoneName(namePrefix),
  };
};
