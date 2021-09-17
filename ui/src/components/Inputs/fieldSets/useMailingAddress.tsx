import React, { useMemo } from "react";
import { MenuItem } from "@material-ui/core";
import isAscii from "validator/lib/isAscii";
import isPostalCode from "validator/lib/isPostalCode";

import {
  requiredValidator,
  TextFieldControlled,
  TextFieldControlledProps,
} from "../shared";
import {
  FieldValue,
  IsEqualFn,
  prefixName,
  useIsEqual,
  useNamePrefix,
  Validator,
} from "../../../useKISSForm/form";

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
].map((state, i) => (
  <MenuItem key={i} value={state}>
    {state}
  </MenuItem>
));

export type MailingAddressInputProps = {
  addressLine1?: Omit<
    TextFieldControlledProps,
    "type" | "name" | "form" | "validator"
  >;
  addressLine2?: Omit<
    TextFieldControlledProps,
    "type" | "name" | "form" | "validator"
  >;
  city?: Omit<TextFieldControlledProps, "type" | "name" | "form" | "validator">;
  state?: Omit<
    TextFieldControlledProps,
    "type" | "name" | "form" | "validator"
  >;
  zip?: Omit<TextFieldControlledProps, "type" | "name" | "form" | "validator">;
};

export type MailingAddressProps = {
  showLabels?: boolean;
  insertNamePrefix?: string;
  required?: boolean;
  shouldUnregister?: boolean;
} & MailingAddressInputProps &
  Omit<
    TextFieldControlledProps,
    "defaultValue" | "name" | "type" | "validator"
  >;

export type MailingAddressFieldDef = {
  mailingAddress: {
    addressLine1: FieldValue<string>;
    addressLine2: FieldValue<string>;
    city: FieldValue<string>;
    state: FieldValue<string>;
    zip: FieldValue<string>;
  };
};
export const MAILING_ADDRESS_NAME: keyof MailingAddressFieldDef =
  "mailingAddress";

const asciiOnly: Validator<string> = (value) => {
  if (value && !isAscii(value)) {
    return new RangeError("ASCII Characters Only");
  }
};

const validAddressLine1: Validator<string> = (value) => {
  if (value && value.length < 5) {
    return new RangeError("Too short");
  }
};

const validPostalCode: Validator<string> = (value) => {
  if (value && !isPostalCode(value, "US")) {
    return new TypeError("Invalid Postal Code");
  }
};

const isEqual: IsEqualFn<string> = (a, b) => a?.trim() === b?.trim();

export const useMailingAddress = (
  props: MailingAddressProps
): {
  [Name in keyof MailingAddressInputProps as `${Name}Input`]-?: JSX.Element;
} &
  {
    [Name in keyof MailingAddressInputProps as `${Name}InputName`]-?: string;
  } => {
  const {
    showLabels,
    insertNamePrefix,
    required,
    addressLine1: addressLine1Props,
    addressLine2: addressLine2Props,
    city: cityProps,
    state: stateProps,
    zip: zipProps,
    ...globalProps
  } = props;

  const name = insertNamePrefix
    ? prefixName(MAILING_ADDRESS_NAME, insertNamePrefix)
    : MAILING_ADDRESS_NAME;

  const fullName = useNamePrefix(name);

  useIsEqual<MailingAddressFieldDef>({
    isEqual: useMemo(
      () => ({
        [prefixName("addressLine1", name)]: isEqual,
        [prefixName("addressLine2", name)]: isEqual,
        [prefixName("city", name)]: isEqual,
        [prefixName("state", name)]: isEqual,
        [prefixName("zip", name)]: isEqual,
        [prefixName("first", name)]: isEqual,
      }),
      [name]
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: props.form as any,
  });

  return {
    addressLine1Input: (
      <TextFieldControlled
        label={showLabels && "Address 1"}
        {...globalProps}
        {...addressLine1Props}
        validator={useMemo(() => {
          return required
            ? [requiredValidator, validAddressLine1, asciiOnly]
            : [validAddressLine1, asciiOnly];
        }, [required])}
        name={prefixName("addressLine1", name)}
        type="text"
      />
    ),
    addressLine1InputName: prefixName("addressLine1", fullName),
    addressLine2Input: (
      <TextFieldControlled
        label={showLabels && "Address 2"}
        {...globalProps}
        {...addressLine2Props}
        validator={asciiOnly}
        name={prefixName("addressLine2", name)}
        type="text"
      />
    ),
    addressLine2InputName: prefixName("addressLine2", fullName),
    cityInput: (
      <TextFieldControlled
        label={showLabels && "City"}
        {...globalProps}
        {...cityProps}
        validator={useMemo(() => {
          return required ? [requiredValidator, asciiOnly] : [asciiOnly];
        }, [required])}
        name={prefixName("cotu", name)}
        type="text"
      />
    ),
    cityInputName: prefixName("city", fullName),
    stateInput: (
      <TextFieldControlled
        label={showLabels && "State"}
        {...globalProps}
        {...stateProps}
        validator={useMemo(() => {
          return required
            ? [requiredValidator, validPostalCode]
            : [validPostalCode];
        }, [required])}
        name={prefixName("state", name)}
        select
      >
        {STATES}
      </TextFieldControlled>
    ),
    stateInputName: prefixName("state", fullName),
    zipInput: (
      <TextFieldControlled
        label={showLabels && "Zip"}
        {...globalProps}
        {...zipProps}
        validator={useMemo(() => {
          return required
            ? [requiredValidator, validPostalCode]
            : [validPostalCode];
        }, [required])}
        name={prefixName("zip", name)}
        type="text"
      />
    ),
    zipInputName: prefixName("zip", fullName),
  };
};
