import React, { useMemo } from "react";
import { TextFieldProps } from "@material-ui/core";

import { useName, NameProps } from "./useName";
import { Email, EmailProps, EMAIL_NAME } from "../Email";
import { Phone, PhoneProps, PHONE_NAME } from "../Phone";
import {
  NamePrefixProvider,
  prefixName,
  UseFieldOptions,
  useNamePrefix,
  useValidators,
  Validator,
} from "../../../useKISSForm/form";

export type PersonProps = {
  showLabels?: boolean;
  insertNamePrefix?: string;
  required?: boolean;
  shouldUnregister?: boolean;
  name?: Omit<NameProps, "form">;
  email?: Omit<EmailProps, "form" | "name">;
  phone?: Omit<PhoneProps, "form" | "name">;
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
  Pick<UseFieldOptions, "form">;

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
    insertNamePrefix,
    required,
    form,
    name: nameProps = {},
    email: emailProps = {},
    phone: phoneProps = {},
    ...rest
  } = props;

  const personNamePrefix = insertNamePrefix
    ? prefixName(PERSON_NAME_PREFIX, insertNamePrefix)
    : PERSON_NAME_PREFIX;

  const fullName = useNamePrefix(personNamePrefix);

  const name = useName({
    showLabels,
    insertNamePrefix: personNamePrefix,
    required,
    form,
    ...rest,
    ...nameProps,
  });

  const emailInputName = prefixName(EMAIL_NAME, fullName);
  const phoneInputName = prefixName(PHONE_NAME, fullName);

  useValidators(
    useMemo(() => {
      if (required) {
        const emailRequiredError = new Error("Email or Phone Required");
        const phoneRequiredError = new Error("Phone or Email Required");

        return {
          validators: {
            [prefixName(EMAIL_NAME, personNamePrefix)]: ((
              _,
              { form, name }
            ) => {
              const email = (
                form.getFieldValue(name, false) as string | undefined
              )?.trim();

              const phone = (
                form.getFieldValue(phoneInputName, false) as string | undefined
              )?.trim();

              if (!phone && !email) {
                return emailRequiredError;
              } else if (!form.isFieldValid(phoneInputName) && !phone) {
                form.validateField(phoneInputName);
              }
            }) as Validator<string>,
            [prefixName(PHONE_NAME, personNamePrefix)]: ((
              _,
              { form, name }
            ) => {
              const phone = (
                form.getFieldValue(name, false) as string | undefined
              )?.trim();

              const email = (
                form.getFieldValue(emailInputName, false) as string | undefined
              )?.trim();

              if (!phone && !email) {
                return phoneRequiredError;
              } else if (!form.isFieldValid(emailInputName) && !email) {
                form.validateField(emailInputName);
              }
            }) as Validator<string>,

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          form,
        };
      }

      return {
        validators: {},
        form,
      };
    }, [emailInputName, form, personNamePrefix, phoneInputName, required])
  );

  return {
    name,
    emailInput: (
      <NamePrefixProvider namePrefix={personNamePrefix}>
        <Email
          label={showLabels && "Email"}
          {...rest}
          {...(emailProps || {})}
        />
      </NamePrefixProvider>
    ),
    emailInputName,
    phoneInput: (
      <NamePrefixProvider namePrefix={personNamePrefix}>
        <Phone
          label={showLabels && "Phone"}
          {...rest}
          {...(phoneProps || {})}
        />
      </NamePrefixProvider>
    ),
    phoneInputName,
  };
};
