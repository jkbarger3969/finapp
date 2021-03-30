import React, { useCallback, useMemo, useState } from "react";
import { ApolloError } from "@apollo/client";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import { treeSelectProps } from "./shared";

import PaymentMethodInput, {
  PayMethodInputPropsWithGetOptions,
  PayMethodInputOpt,
} from "../../../Inputs/PaymentMethodInput";

import { Filter, LogicFilter } from "./FilterColumnsState";
import { FilterCellProps } from "./FilterColumnsStateProvider";
import { GridEntryFragment as GridEntry } from "../../../../apollo/graphTypes";

export const columnExtension: IntegratedFiltering.ColumnExtension = {
  columnName: "paymentMethod",
  predicate: (_, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          ((filter as unknown) as Filter<PayMethodInputOpt>).value.id ===
          (row as GridEntry).paymentMethod.id
        );
      case "notEqual":
        return (
          ((filter as unknown) as Filter<PayMethodInputOpt>).value.id !==
          (row as GridEntry).paymentMethod.id
        );
      default:
        return false;
    }
  },
};

type PayMethodInputProps = PayMethodInputPropsWithGetOptions<
  true,
  false,
  false
>;
export const PayMethodFilter = (props: FilterCellProps): JSX.Element => {
  const {
    payMethodFilterOpts,
    changeColumnFilter,
    column,
    colSpan,
    rowSpan,
  } = props;

  const [{ error, value }, setState] = useState<{
    error?: ApolloError;
    value: PayMethodInputOpt[];
  }>({ value: [] });

  const columnName = column.name;

  const getOptions = useCallback<
    NonNullable<PayMethodInputProps["getOptions"]>
  >(() => payMethodFilterOpts || [], [payMethodFilterOpts]);

  const onChange = useCallback<PayMethodInputProps["onChange"]>(
    (value) => {
      setState((state) => ({
        ...state,
        value,
      }));

      if (value.length === 0) {
        changeColumnFilter({
          columnName,
          config: null,
        });
      } else {
        const logicFilter: LogicFilter<PayMethodInputOpt> = {
          operator: "or",
          filters: [],
        };

        for (const categoryOpt of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: categoryOpt,
          });
        }

        changeColumnFilter({
          columnName,
          config: {
            filters: [logicFilter],
          },
        });
      }
    },
    [changeColumnFilter, columnName, setState]
  );

  const onGQLError = useCallback<PayMethodInputProps["onGQLError"]>(
    (error) => {
      setState((state) => ({
        ...state,
        error,
      }));
    },
    [setState]
  );

  const textFieldProps = useMemo<
    NonNullable<PayMethodInputProps["textFieldProps"]>
  >(() => {
    if (error) {
      return {
        error: true,
        helperText: `Payment Method Options Fetch Error: ${error.message}`,
      };
    } else {
      return {};
    }
  }, [error]);

  return (
    <TableCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      size="small"
      variant="head"
      padding="checkbox"
    >
      <PaymentMethodInput<true, false, false>
        {...treeSelectProps}
        onChange={onChange}
        onGQLError={onGQLError}
        disabled={
          !!error || !payMethodFilterOpts || payMethodFilterOpts.length === 0
        }
        textFieldProps={textFieldProps}
        value={value}
        getOptions={getOptions}
        multiple
      />
    </TableCell>
  );
};

export default PayMethodFilter;
