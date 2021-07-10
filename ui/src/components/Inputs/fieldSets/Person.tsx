import React, { Fragment } from "react";
import { TextFieldProps } from "@material-ui/core";
import { Control } from "react-hook-form";

import { Name, NameProps } from "./Name";
import { Email, EmailProps } from "../Email";
import { Phone, PhoneProps } from "../Phone";

export type PersonProps = {
  control?: Control;
  namePrefix?: string;
  name?: Omit<NameProps, "control" | "namePrefix">;
  email?: Omit<EmailProps, "control" | "namePrefix">;
  phone?: Omit<PhoneProps, "control" | "namePrefix">;
} & Pick<
  TextFieldProps,
  | "color"
  | "disabled"
  | "fullWidth"
  | "hiddenLabel"
  | "margin"
  | "required"
  | "size"
  | "variant"
>;

export const PERSON_NAME = "person";
export const Person = (props: PersonProps): JSX.Element => {
  const {
    name: nameProps = {},
    email: emailProps = {},
    phone: phoneProps = {},
    namePrefix: namePrefixProp,
    control,
    ...rest
  } = props;

  const namePrefix = namePrefixProp
    ? `${namePrefixProp}.${PERSON_NAME}`
    : PERSON_NAME;

  return (
    <Fragment>
      <Name
        {...rest}
        {...nameProps}
        control={control}
        namePrefix={namePrefix}
      />
      <Email
        {...rest}
        {...(emailProps || {})}
        control={control}
        namePrefix={namePrefix}
      />
      <Phone
        {...rest}
        {...(phoneProps || {})}
        control={control}
        namePrefix={namePrefix}
      />
    </Fragment>
  );
};
