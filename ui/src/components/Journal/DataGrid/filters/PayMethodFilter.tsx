import React, { useCallback, useMemo } from "react";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import TreeSelect, { TreeSelectProps } from "mui-tree-select";

import { treeSelectProps } from "./shared";
import {
  PayMethodInputOpt,
  getOptionLabel,
  getOptionSelected,
} from "../../../Inputs/paymentMethodInputUtils";
import { Filter, LogicFilter } from "../plugins/FilterColumnsState";
import { GridPaymentMethodFragment } from "../../../../apollo/graphTypes";
import { FilterCellComponentProps } from "../plugins";

export const columnExtension = (
  columnName: string,
  toString: (value: GridPaymentMethodFragment) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          ((filter as unknown) as Filter<PayMethodInputOpt>).value.id ===
          (value as GridPaymentMethodFragment).id
        );
      case "notEqual":
        return (
          ((filter as unknown) as Filter<PayMethodInputOpt>).value.id !==
          (value as GridPaymentMethodFragment).id
        );
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as GridPaymentMethodFragment),
          filter,
          row
        );
    }
  },
});

const onBranchChange = () => void undefined;

export const PayMethodFilter = (
  props: FilterCellComponentProps<{
    payMethodFilterOpts: PayMethodInputOpt[];
  }>
): JSX.Element => {
  const {
    payMethodFilterOpts,
    changeColumnFilter,
    column,
    colSpan,
    rowSpan,
  } = props;

  const columnName = column.name;

  const options = useMemo<PayMethodInputOpt[]>(
    () => payMethodFilterOpts || [],
    [payMethodFilterOpts]
  );

  const onChange = useCallback<
    NonNullable<
      TreeSelectProps<PayMethodInputOpt, true, false, false>["onChange"]
    >
  >(
    (_, value) => {
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

        for (const paymentMethodOpt of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: paymentMethodOpt,
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
    [changeColumnFilter, columnName]
  );

  return (
    <TableCell
      colSpan={colSpan}
      padding="checkbox"
      rowSpan={rowSpan}
      size="small"
      variant="head"
    >
      <TreeSelect<PayMethodInputOpt, true, false, false>
        {...treeSelectProps}
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        onBranchChange={onBranchChange}
        multiple
        onChange={onChange}
        options={options}
      />
    </TableCell>
  );
};

export default PayMethodFilter;
