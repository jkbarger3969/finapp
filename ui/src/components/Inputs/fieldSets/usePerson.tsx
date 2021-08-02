import React from "react";
import { TextFieldProps } from "@material-ui/core";

import { useName, NameProps } from "./useName";
import { Email, EmailProps, EMAIL_NAME } from "../Email";
import { Phone, PhoneProps, PHONE_NAME } from "../Phone";
import {
  NamePrefixProvider,
  prefixName,
  UseFieldOptions,
  useNamePrefix,
} from "../../../useKISSForm/form";

export type PersonProps = {
  showLabels?: boolean;
  name?: Omit<NameProps, "form" | "shouldUnregister">;
  email?: Omit<EmailProps, "form" | "shouldUnregister" | "name">;
  phone?: Omit<PhoneProps, "form" | "shouldUnregister" | "name">;
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
> &
  Pick<UseFieldOptions, "form" | "shouldUnregister">;

export const PERSON_NAME_PREFIX = "person";

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
    ...rest
  } = props;

  const namePrefix = useNamePrefix(PERSON_NAME_PREFIX);

  const name = useName({
    showLabels,
    ...rest,
    ...nameProps,
  });

  return {
    name: {
      ...name,
      firstNameInput: (
        <NamePrefixProvider namePrefix={PERSON_NAME_PREFIX}>
          {name.firstNameInput}
        </NamePrefixProvider>
      ),
      lastNameInput: (
        <NamePrefixProvider namePrefix={PERSON_NAME_PREFIX}>
          {name.lastNameInput}
        </NamePrefixProvider>
      ),
    },
    emailInput: (
      <NamePrefixProvider namePrefix={PERSON_NAME_PREFIX}>
        <Email
          label={showLabels && "Email"}
          {...rest}
          {...(emailProps || {})}
        />
      </NamePrefixProvider>
    ),
    emailInputName: prefixName(EMAIL_NAME, namePrefix),
    phoneInput: (
      <NamePrefixProvider namePrefix={PERSON_NAME_PREFIX}>
        <Phone
          label={showLabels && "Phone"}
          {...rest}
          {...(phoneProps || {})}
        />
      </NamePrefixProvider>
    ),
    phoneInputName: prefixName(PHONE_NAME, namePrefix),
  };
};
