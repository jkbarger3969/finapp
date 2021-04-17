import React, { useCallback, useState } from "react";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";

import { makeStyles } from "@material-ui/core/styles";
import Fraction from "fraction.js";
import { Box, TableCell } from "@material-ui/core";

import {
  Filter,
  LogicFilter,
  DefaultFilterOperations,
  ChangeColumnFilter,
} from "../plugins/FilterColumnsState";
import {
  AvailableFilterOperations,
  availableFilterOperations,
  AvailableRangeFilterOperations,
  getAvailableRangeOps,
  RangeFilterIcons,
} from "./rangeFilterUtils";
import {
  RationalInput,
  RationalInputProps,
} from "../../../Inputs/RationalInput";
import { inputProps } from "./shared";
import { FilterCellComponentProps } from "../plugins";

export const columnExtension = (
  columnName: string,
  toString: (value: Fraction) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    const filterTotal = ((filter as unknown) as Filter<Fraction>).value;

    switch (filter.operation as DefaultFilterOperations) {
      case "equal":
        return (value as Fraction).equals(filterTotal);
      case "notEqual":
        return !(value as Fraction).equals(filterTotal);
      case "greaterThan":
        return (value as Fraction).compare(filterTotal) > 0;
      case "greaterThanOrEqual":
        return (value as Fraction).compare(filterTotal) >= 0;
      case "lessThan":
        return (value as Fraction).compare(filterTotal) < 0;
      case "lessThanOrEqual":
        return (value as Fraction).compare(filterTotal) <= 0;
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as Fraction),
          filter,
          row
        );
    }
  },
});

const useStyles = makeStyles({
  tableCell: {
    // Align FilterSelector left
    paddingLeft: "0px !important",
  },
});

const isIntervalValid = (
  opA: AvailableFilterOperations,
  totalA: Fraction,
  opB: AvailableRangeFilterOperations,
  totalB: Fraction
): boolean => {
  if (opA === "equal" || opA === "notEqual") {
    // All ops MUST be inequalities.
    return false;
  }

  // Inequalities CANNOT have the SAME direction.
  switch (opA) {
    case "greaterThan":
      if (opB === "greaterThan" || opB === "greaterThanOrEqual") {
        // Inequalities CANNOT have the SAME direction.
        return false;
      }

      return totalB.compare(totalA) > 0;

    case "greaterThanOrEqual":
      if (opB === "greaterThan" || opB === "greaterThanOrEqual") {
        // Inequalities CANNOT have the SAME direction.
        return false;
      } else if (opB === "lessThanOrEqual") {
        // When both ops are inclusive, equal totals are valid.
        return totalB.compare(totalA) >= 0;
      }

      return totalB.compare(totalA) > 0;

    case "lessThan":
      // Inequalities CANNOT have the SAME direction.
      if (opB === "lessThan" || opB === "lessThanOrEqual") {
        return false;
      }
      return totalA.compare(totalB) > 0;

    case "lessThanOrEqual":
      if (opB === "lessThan" || opB === "lessThanOrEqual") {
        // Inequalities CANNOT have the SAME direction.
        return false;
      } else if (opB === "greaterThanOrEqual") {
        // When both ops are inclusive, equal totals are valid .
        return totalA.compare(totalB) >= 0;
      }

      return totalA.compare(totalB) > 0;
  }
};

const getColumnFilter = (
  columnName: string,
  opA: AvailableFilterOperations,
  totalA: Fraction | null,
  opB: AvailableRangeFilterOperations | undefined,
  totalB: Fraction | null
): Parameters<ChangeColumnFilter<Fraction, AvailableFilterOperations>> => {
  if (!totalA) {
    return [
      {
        columnName,
        config: null,
      },
    ];
  }

  const logicFilter: LogicFilter<Fraction, AvailableFilterOperations> = {
    operator: "and",
    filters: [
      {
        operation: opA,
        value: totalA,
      },
    ],
  };

  if (opB && totalB) {
    logicFilter.filters.push({
      operation: opB,
      value: totalB,
    });
  }

  return [
    {
      columnName,
      config: {
        filters: [logicFilter],
      },
    },
  ];
};

export const RationalFilter = (
  props: FilterCellComponentProps
): JSX.Element => {
  const {
    changeColumnFilter,
    column,
    colSpan,
    getMessage,
    rowSpan,
    filteringEnabled,
  } = props;

  const columnName = column.name;

  const classes = useStyles();

  const [state, setState] = useState<{
    total: Fraction | null;
    boundTotal: Fraction | null;
    selectorValue: AvailableFilterOperations;
    rangeSelectorValue?: AvailableRangeFilterOperations;
    availableRangeValues?: AvailableRangeFilterOperations[];
  }>({
    total: null,
    boundTotal: null,
    selectorValue: "equal",
  });

  const onChangeTotal = useCallback<
    NonNullable<RationalInputProps["onChange"]>
  >(
    (_, total) => {
      if (
        total &&
        state.rangeSelectorValue &&
        state.boundTotal &&
        !isIntervalValid(
          state.selectorValue,
          total,
          state.rangeSelectorValue,
          state.boundTotal
        )
      ) {
        const availableRangeValues = getAvailableRangeOps(state.selectorValue);

        setState((state) => ({
          ...state,
          total,
          boundTotal: null,
          rangeSelectorValue: undefined,
          availableRangeValues,
        }));
      } else {
        setState((state) => ({
          ...state,
          total,
        }));
      }

      changeColumnFilter(
        ...getColumnFilter(
          columnName,
          state.selectorValue,
          total,
          state.rangeSelectorValue,
          state.boundTotal
        )
      );
    },
    [
      setState,
      state.selectorValue,
      state.rangeSelectorValue,
      columnName,
      state.boundTotal,
      changeColumnFilter,
    ]
  );

  const onChangeBoundDate = useCallback<
    NonNullable<RationalInputProps["onChange"]>
  >(
    (_, boundTotal) => {
      setState((state) => ({
        ...state,
        boundTotal,
        rangeSelectorValue: boundTotal ? state.rangeSelectorValue : undefined,
      }));

      changeColumnFilter(
        ...getColumnFilter(
          columnName,
          state.selectorValue,
          state.total,
          state.rangeSelectorValue,
          boundTotal
        )
      );
    },
    [
      setState,
      state.selectorValue,
      state.total,
      state.rangeSelectorValue,
      columnName,
      changeColumnFilter,
    ]
  );

  const onChangeFilterOp = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (selectorValue) => {
      const availableRangeValues = getAvailableRangeOps(
        selectorValue as AvailableFilterOperations
      );

      if (
        state.total &&
        state.rangeSelectorValue &&
        state.boundTotal &&
        !isIntervalValid(
          selectorValue as AvailableFilterOperations,
          state.total,
          state.rangeSelectorValue,
          state.boundTotal
        )
      ) {
        // Reset bounded range if new interval is Invalid
        setState((state) => ({
          ...state,
          selectorValue: selectorValue as AvailableFilterOperations,
          boundTotal: null,
          rangeSelectorValue: undefined,
          availableRangeValues,
        }));
      } else {
        switch (selectorValue as AvailableFilterOperations) {
          case "greaterThan":
          case "greaterThanOrEqual":
            setState((state) => ({
              ...state,
              selectorValue: selectorValue as AvailableFilterOperations,
              availableRangeValues,
            }));
            break;
          case "lessThan":
          case "lessThanOrEqual":
            setState((state) => ({
              ...state,
              selectorValue: selectorValue as AvailableFilterOperations,
              availableRangeValues,
            }));
            break;
          default:
            setState((state) => ({
              ...state,
              selectorValue: selectorValue as AvailableFilterOperations,
              boundTotal: null,
              rangeSelectorValue: undefined,
              availableRangeValues,
            }));
        }
      }

      changeColumnFilter(
        ...getColumnFilter(
          columnName,
          selectorValue as AvailableFilterOperations,
          state.total,
          state.rangeSelectorValue,
          state.boundTotal
        )
      );
    },
    [
      setState,
      state.total,
      state.rangeSelectorValue,
      state.boundTotal,
      columnName,
      changeColumnFilter,
    ]
  );

  const onChangeRangeFilterOp = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (rangeSelectorValue) => {
      if (
        state.total &&
        state.boundTotal &&
        !isIntervalValid(
          state.selectorValue as AvailableFilterOperations,
          state.total,
          rangeSelectorValue as AvailableRangeFilterOperations,
          state.boundTotal
        )
      ) {
        // Reset bounded total if new interval is Invalid
        setState((state) => ({
          ...state,
          rangeSelectorValue: rangeSelectorValue as AvailableRangeFilterOperations,
          boundTotal: null,
        }));
      } else {
        setState((state) => ({
          ...state,
          rangeSelectorValue: rangeSelectorValue as AvailableRangeFilterOperations,
        }));
      }

      changeColumnFilter(
        ...getColumnFilter(
          columnName,
          state.selectorValue as AvailableFilterOperations,
          state.total,
          rangeSelectorValue as AvailableRangeFilterOperations,
          state.boundTotal
        )
      );
    },
    [
      setState,
      state.total,
      state.boundTotal,
      state.selectorValue,
      columnName,
      changeColumnFilter,
    ]
  );

  const isRangeOp =
    state.selectorValue !== "equal" && state.selectorValue !== "notEqual";

  return (
    <TableCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      size="small"
      variant="head"
      padding="checkbox"
      className={classes.tableCell}
    >
      <Box display="flex" alignItems="center">
        <TableFilterRow.FilterSelector
          availableValues={
            availableFilterOperations as AvailableFilterOperations[]
          }
          disabled={!filteringEnabled}
          getMessage={getMessage}
          iconComponent={RangeFilterIcons}
          onChange={onChangeFilterOp}
          toggleButtonComponent={TableFilterRow.ToggleButton}
          value={state.selectorValue}
        />
        <RationalInput
          disabled={!filteringEnabled}
          fullWidth
          InputProps={inputProps}
          onChange={onChangeTotal}
          size="small"
        />
      </Box>
      {isRangeOp && !!state.total && (
        <Box display="flex" alignItems="center">
          <TableFilterRow.FilterSelector
            availableValues={state.availableRangeValues || []}
            disabled={!filteringEnabled || !isRangeOp}
            getMessage={getMessage}
            iconComponent={RangeFilterIcons}
            onChange={onChangeRangeFilterOp}
            toggleButtonComponent={TableFilterRow.ToggleButton}
            value={state.rangeSelectorValue || "addRangeBound"}
          />
          <RationalInput
            disabled={
              !filteringEnabled || !isRangeOp || !state.rangeSelectorValue
            }
            fullWidth
            InputProps={inputProps}
            onChange={onChangeBoundDate}
            size="small"
          />
        </Box>
      )}
    </TableCell>
  );
};
