import React, { forwardRef } from "react";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { MarkOptional } from "ts-essentials";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";
import { Validator, FieldValue } from "../../useKISSForm/form";

export type PhoneProps = Omit<
  MarkOptional<TextFieldControlledProps<string>, "name">,
  "type" | "validator"
>;

const validPhone: Validator<string> = (phone?: string) => {
  if (!isValidPhoneNumber(phone ?? "", "US")) {
    return new TypeError("Invalid Phone Number");
  }
};

const setPhoneAs: NonNullable<TextFieldControlledProps["setValueAs"]> = (
  event
) => {
  const phone = event.target.value.trim();
  return phone
    ? parsePhoneNumberFromString(phone, "US")?.format("NATIONAL") || phone
    : undefined;
};
export const PHONE_NAME = "phone";
export type PhoneFieldDef<TName extends string = typeof PHONE_NAME> = {
  [key in TName]: FieldValue<string>;
};
export const Phone = forwardRef(function Phone(
  props: PhoneProps,
  ref: TextFieldControlledProps["ref"]
): JSX.Element {
  const { name = PHONE_NAME, ...rest } = props;

  return (
    <TextFieldControlled
      setValueAs={setPhoneAs}
      {...rest}
      name={name}
      validator={validPhone}
      ref={ref}
      type="tel"
    />
  );
});
