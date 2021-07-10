import React, { forwardRef, useMemo } from "react";
import { UseControllerProps } from "react-hook-form";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";

export type PhoneProps = {
  namePrefix?: string;
} & Partial<Omit<TextFieldControlledProps, "type" | "name">>;

const phoneRules: NonNullable<UseControllerProps["rules"]> = {
  validate: (phone: string) => {
    if (!isValidPhoneNumber(phone, "US")) {
      return "Invalid Phone Number";
    }
  },
};
const setPhoneAs: NonNullable<TextFieldControlledProps["setValueAs"]> = (
  event
) => {
  const phone = event.target.value.trim();
  return parsePhoneNumberFromString(phone, "US")?.format("NATIONAL") || phone;
};
export const PHONE_NAME = "phone";
export const phoneName = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${PHONE_NAME}` : PHONE_NAME;
export const Phone = forwardRef(function Phone(
  props: PhoneProps,
  ref: TextFieldControlledProps["ref"]
): JSX.Element {
  const { rules = {}, namePrefix, ...rest } = props;

  return (
    <TextFieldControlled
      setValueAs={setPhoneAs}
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name={phoneName(namePrefix) as any}
      rules={useMemo(
        () => ({
          ...phoneRules,
          ...rules,
        }),
        [rules]
      )}
      ref={ref}
      type="tel"
    />
  );
});
