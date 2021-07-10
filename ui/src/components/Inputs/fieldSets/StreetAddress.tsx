import React, { Fragment, useMemo } from "react";
import { MenuItem, TextFieldProps } from "@material-ui/core";
import { Control, UseControllerProps } from "react-hook-form";
import isAscii from "validator/lib/isAscii";
import isPostalCode from "validator/lib/isPostalCode";

import { TextFieldControlled, TextFieldControlledProps } from "../shared";

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

export type StreetAddressProps = {
  required?: boolean;
  namePrefix?: string;
  control?: Control;
  addressLine1?: Omit<
    TextFieldControlledProps,
    "rules" | "name" | "control" | "type" | "setValueAs" | "select"
  >;
  addressLine2?: Omit<
    TextFieldControlledProps,
    "rules" | "name" | "control" | "type" | "setValueAs" | "select"
  >;
  city?: Omit<
    TextFieldControlledProps,
    "rules" | "name" | "control" | "type" | "setValueAs" | "select"
  >;
  state?: Omit<
    TextFieldControlledProps,
    "rules" | "name" | "control" | "type" | "setValueAs" | "select"
  >;
  zip?: Omit<
    TextFieldControlledProps,
    "rules" | "name" | "control" | "type" | "setValueAs" | "select"
  >;
} & Omit<
  TextFieldControlledProps,
  "rules" | "name" | "control" | "type" | "setValueAs" | "select"
>;

export type StreetAddressNames =
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "zip";

export const STREET_ADDRESS_NAME = "streetAddress";
export const streetAddressNamePrefix = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${STREET_ADDRESS_NAME}` : STREET_ADDRESS_NAME;
export const streetAddressName = (
  fieldName: StreetAddressNames,
  namePrefix?: string
): string => `${streetAddressNamePrefix(namePrefix)}.${fieldName}`;

export const StreetAddress = (props: StreetAddressProps): JSX.Element => {
  const {
    required,
    control,
    namePrefix,
    addressLine1: addressLine1Props = {},
    addressLine2: addressLine2Props = {},
    city: cityProps = {},
    state: stateProps = {},
    zip: zipProps = {},
    ...rest
  } = props;

  return (
    <Fragment>
      <TextFieldControlled
        {...rest}
        {...addressLine1Props}
        type="text"
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={streetAddressName("addressLine1", namePrefix) as any}
        rules={useMemo<NonNullable<UseControllerProps["rules"]>>(
          () => ({
            minLength: {
              value: 5,
              message: "Too Short",
            },
            validate: (value: string) => {
              if (!isAscii(value)) {
                return "ASCII Characters Only";
              }
            },
            ...(required ? { required: "Required" } : {}),
          }),
          [required]
        )}
      />
      <TextFieldControlled
        {...rest}
        {...addressLine2Props}
        type="text"
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={streetAddressName("addressLine2", namePrefix) as any}
        rules={useMemo<NonNullable<UseControllerProps["rules"]>>(
          () => ({
            validate: (value: string) => {
              if (!isAscii(value)) {
                return "ASCII Characters Only";
              }
            },
          }),
          []
        )}
      />
      <TextFieldControlled
        {...rest}
        {...cityProps}
        type="text"
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={streetAddressName("city", namePrefix) as any}
        rules={useMemo<NonNullable<UseControllerProps["rules"]>>(
          () => ({
            minLength: {
              value: 2,
              message: "Too Short",
            },
            validate: (value: string) => {
              if (!isAscii(value)) {
                return "ASCII Characters Only";
              }
            },
            ...(required ? { required: "Required" } : {}),
          }),
          [required]
        )}
      />
      <TextFieldControlled
        {...rest}
        {...stateProps}
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={streetAddressName("state", namePrefix) as any}
        select
        rules={useMemo<NonNullable<UseControllerProps["rules"]>>(
          () => ({
            ...(required ? { required: "Required" } : {}),
          }),
          [required]
        )}
      >
        {STATES}
      </TextFieldControlled>
      <TextFieldControlled
        {...rest}
        {...zipProps}
        type="text"
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={streetAddressName("zip", namePrefix) as any}
        rules={useMemo<NonNullable<UseControllerProps["rules"]>>(
          () => ({
            ...(required ? { required: "Required" } : {}),
            validate: (value: string) => {
              if (!isPostalCode(value, "US")) {
                return "Invalid Zip";
              }
            },
          }),
          [required]
        )}
      />
    </Fragment>
  );
};
