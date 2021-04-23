import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import { GridPaymentMethodFragment } from "../../../../apollo/graphTypes";
import { composeAlias } from "../../../../utils/alias";
import { OnFilter } from "../plugins/TableCell";
import { LogicFilter } from "../plugins";
import { PayMethodInputOpt } from "../../../Inputs/paymentMethodInputUtils";

export const payMethodToStr = (
  payMethod: GridPaymentMethodFragment
): string => {
  const { aliases } = payMethod;
  return aliases.length
    ? composeAlias(aliases, payMethod.name)
    : payMethod.name;
};

export const PayMethodCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={payMethodToStr(value as GridPaymentMethodFragment)}
    />
  );
};

// Filter Cell
export type PayMethodFilterProps = Omit<
  TableFilterRow.CellProps,
  "onFilter"
> & {
  onFilter: OnFilter<PayMethodInputOpt, "equal">;
  payMethodFilterOpts?: PayMethodInputOpt[];
};

const renderInput: AutocompleteProps<
  PayMethodInputOpt,
  true,
  false,
  false
>["renderInput"] = (params) => {
  const props = {
    ...params,
    InputProps: {
      ...params.InputProps,
      margin: "dense",
    },
  } as TextFieldProps;

  return <TextField {...props} />;
};

const getOptionLabel: NonNullable<
  AutocompleteProps<PayMethodInputOpt, true, false, false>["getOptionLabel"]
> = (option) => payMethodToStr(option);

export const PayMethodFilter = (props: PayMethodFilterProps): JSX.Element => {
  const { payMethodFilterOpts, ...rest } = props;

  const options = useMemo(() => payMethodFilterOpts || [], [
    payMethodFilterOpts,
  ]);

  const columnName = props.column.name;

  type Props = AutocompleteProps<PayMethodInputOpt, true, false, false>;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value.length) {
        const logicFilter: LogicFilter<PayMethodInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const option of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: option,
          });
        }

        props.onFilter({
          columnName,
          filters: [logicFilter],
        });
      } else {
        props.onFilter(null);
      }
    },
    [columnName, props.onFilter]
  );

  return (
    <TableFilterRow.Cell {...(rest as TableFilterRow.CellProps)}>
      <Autocomplete
        fullWidth
        getOptionLabel={getOptionLabel}
        multiple
        renderInput={renderInput}
        size="small"
        onChange={onChange}
        options={options}
      />
    </TableFilterRow.Cell>
  );
};
