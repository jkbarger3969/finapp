import React, { useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  FormControlProps,
  MenuItem,
  MenuItemProps
} from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Skeleton from "@material-ui/lab/Skeleton";
import { useField } from "formik";

import { PAY_METHOD_ENTRY_OPT_FRAGMENT } from "./upsertEntry.gql";
import { Values } from "../UpsertEntry";

const PAY_METHOD_ENTRY_OPTS = gql`
  query PayMethodEntryOpts {
    paymentMethods {
      ...PayMethodEntryOptFragment
    }
  }
  ${PAY_METHOD_ENTRY_OPT_FRAGMENT}
`;

const validate = (value: string) => {
  if (!value) {
    return "Method Required";
  }
};

const PaymentMethod = (
  props: {
    variant?: "filled" | "outlined";
    autoFocus?: boolean;
  } & Omit<FormControlProps, "required" | "disabled" | "error" | "variant">
) => {
  const { variant = "filled", autoFocus = false, ...formControlProps } = props;

  const { loading, error: gqlError, data } = useQuery(PAY_METHOD_ENTRY_OPTS);

  const [field, meta] = useField<Values["paymentMethod"]>({
    name: "paymentMethod",
    validate
  });

  const { error, touched } = meta;

  const hasError = !!gqlError || (touched && !!error);

  const children = useMemo(
    () =>
      (data?.paymentMethods || []).map(({ id, method }) => (
        <MenuItem
          {...(({
            value: id,
            key: id,
            children: `${method[0].toUpperCase()}${method.substr(1)}`
          } as MenuItemProps) as any)}
        />
      )),
    [data]
  );

  if (loading) {
    return <Skeleton variant="rect" height={56} />;
  } else if (gqlError) {
    return <pre>{JSON.stringify(gqlError, null, 2)}</pre>;
  }

  return (
    <FormControl
      {...formControlProps}
      required
      disabled={loading}
      error={hasError}
      variant={variant}
    >
      <InputLabel>Method</InputLabel>
      <Select {...field} autoFocus={autoFocus} children={children} />
      {hasError && <FormHelperText children={error} />}
    </FormControl>
  );
};

export default PaymentMethod;
