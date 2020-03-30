import React, { useMemo, useCallback } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import FormControl, { FormControlProps } from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Box from "@material-ui/core/Box";
import Select, { SelectProps } from "@material-ui/core/Select";
import MenuItem, { MenuItemProps } from "@material-ui/core/MenuItem";
import Skeleton from "@material-ui/lab/Skeleton";
import { capitalCase } from "change-case";
import gql from "graphql-tag";

import { PayMethodInput_1Query as PayMethodInputQuery } from "../../apollo/graphTypes";
import { Root } from "../../redux/reducers/root";
import { useDebounceDispatch } from "../../redux/hooks";
import {
  setPayMethodValue,
  clearPayMethodValue,
  validatePayMethod
} from "../../redux/actions/journalEntryUpsert";
import {
  getPayMethod,
  isRequired,
  getPayMethodError,
  getType
} from "../../redux/selectors/journalEntryUpsert";

const PAY_METHOD_INPUT_QUERY = gql`
  query PayMethodInput_1 {
    paymentMethods {
      __typename
      id
      name
      active
    }
  }
`;

interface SelectorResult {
  disabled: boolean;
  required: boolean;
  value: string;
  hasError: boolean;
  errorMsg: string | null;
}

export interface PaymentMethodInputProps {
  entryUpsertId: string;
  autoFocus?: boolean;
  variant?: "filled" | "outlined";
}

const PaymentMethod = function(props: PaymentMethodInputProps) {
  const { entryUpsertId, autoFocus = false, variant = "filled" } = props;

  const dispatch = useDebounceDispatch();

  const { disabled, value, required, hasError, errorMsg } = useSelector<
    Root,
    SelectorResult
  >(state => {
    const error = getPayMethodError(state, entryUpsertId);
    return {
      disabled: getType(state, entryUpsertId) === null,
      required: isRequired(state, entryUpsertId),
      value: getPayMethod(state, entryUpsertId),
      hasError: !!error,
      errorMsg: error?.message || null
    };
  }, shallowEqual);

  const validate = useCallback(() => {
    dispatch(validatePayMethod(entryUpsertId));
  }, [dispatch, entryUpsertId]);

  const { loading, error, data } = useQuery<PayMethodInputQuery>(
    PAY_METHOD_INPUT_QUERY
  );

  const paymentMethods = useMemo(() => {
    return (data?.paymentMethods || []).filter(p => p.active);
  }, [data]);

  const formControlProps: FormControlProps = useMemo(
    () => ({
      disabled,
      required,
      fullWidth: true,
      variant,
      error: hasError
    }),
    [required, variant, hasError, disabled]
  );

  const onChange = useCallback(
    event => {
      const value = (event?.target?.value as string) || null;
      if (value) {
        dispatch(setPayMethodValue(entryUpsertId, value));
        if (hasError) {
          validate();
        }
      } else {
        dispatch(clearPayMethodValue(entryUpsertId));
      }
    },
    [dispatch, entryUpsertId, hasError, validate]
  );

  const children = useMemo(
    () =>
      paymentMethods.map(({ id, name }) => (
        <MenuItem
          {...(({
            value: id,
            key: id,
            children: name
          } as MenuItemProps) as any)}
        />
      )),
    [paymentMethods]
  );

  if (loading) {
    return <Skeleton variant="rect" height={56} />;
  } else if (error) {
    console.error(error);
    return <p>{error?.message}</p>;
  }

  const selectProps: SelectProps = {
    autoFocus,
    children,
    onChange,
    value
  };

  return (
    <FormControl {...formControlProps}>
      <InputLabel>Method</InputLabel>
      <Select {...selectProps} />
      {hasError && <FormHelperText>{errorMsg}</FormHelperText>}
    </FormControl>
  );
};

export default PaymentMethod;
