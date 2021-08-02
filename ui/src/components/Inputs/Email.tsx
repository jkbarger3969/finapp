import React, { forwardRef } from "react";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";
import { Validator, FieldValue } from "../../useKISSForm/form";

export type EmailProps = Partial<
  Omit<TextFieldControlledProps<string>, "type" | "validator">
>;

const validEmail: Validator<string> = (email?: string) => {
  if (!isEmail(email ?? "")) {
    return new TypeError("Invalid Email");
  }
};
const setEmailAs: NonNullable<TextFieldControlledProps["setValueAs"]> = (
  event
) => {
  const email = event.target.value.trim();
  return isEmail(email) ? normalizeEmail(email) : email || undefined;
};
export const EMAIL_NAME = "email";
export type EmailFieldDef<TName extends string = typeof EMAIL_NAME> = {
  [key in TName]: FieldValue<string>;
};
export const Email = forwardRef(function Email(
  props: EmailProps,
  ref: TextFieldControlledProps["ref"]
): JSX.Element {
  const { name = EMAIL_NAME, ...rest } = props;

  return (
    <TextFieldControlled
      setValueAs={setEmailAs}
      {...rest}
      name={name}
      validator={validEmail}
      ref={ref}
      type="email"
    />
  );
});
