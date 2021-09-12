import React, { forwardRef, useMemo } from "react";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";
import {
  Validator,
  FieldValue,
  IsEqualFn,
  useIsEqual,
} from "../../useKISSForm/form";

export type EmailProps = Partial<
  Omit<TextFieldControlledProps<string>, "type" | "validator">
>;

const emailIsEqual: IsEqualFn<string> = (a, b) =>
  a?.trim().toLowerCase() === b?.trim().toLowerCase();

const validEmail: Validator<string> = (email?: string) => {
  if (email && !isEmail(email)) {
    return new TypeError("Invalid Email");
  }
};
const setEmailAs: NonNullable<TextFieldControlledProps["setValueAs"]> = (
  event
) => {
  const email = event.target.value.trim();
  return (isEmail(email) ? normalizeEmail(email) : email) || undefined;
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

  useIsEqual<EmailFieldDef<typeof name>>({
    isEqual: useMemo(
      () => ({
        [name]: emailIsEqual,
      }),
      [name]
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: props.form as any,
  });

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
