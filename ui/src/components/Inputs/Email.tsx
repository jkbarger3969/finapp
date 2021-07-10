import React, { forwardRef, useMemo } from "react";
import { UseControllerProps } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";

export type EmailProps = {
  namePrefix?: string;
} & Partial<Omit<TextFieldControlledProps, "type" | "name">>;

const emailRules: NonNullable<UseControllerProps["rules"]> = {
  validate: (email: string) => {
    if (!isEmail(email)) {
      return "Invalid Email";
    }
  },
};
const setEmailAs: NonNullable<TextFieldControlledProps["setValueAs"]> = (
  event
) => {
  const email = event.target.value.trim();
  return isEmail(email) ? normalizeEmail(email) : event;
};
export const EMAIL_NAME = "email";
export const emailName = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${EMAIL_NAME}` : EMAIL_NAME;
export const Email = forwardRef(function Email(
  props: EmailProps,
  ref: TextFieldControlledProps["ref"]
): JSX.Element {
  const { rules = {}, namePrefix = "email", ...rest } = props;

  return (
    <TextFieldControlled
      setValueAs={setEmailAs}
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name={emailName(namePrefix) as any}
      rules={useMemo(
        () => ({
          ...emailRules,
          ...rules,
        }),
        [rules]
      )}
      ref={ref}
      type="email"
    />
  );
});
