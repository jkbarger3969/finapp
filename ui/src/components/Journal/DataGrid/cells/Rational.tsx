import React, { useCallback, useState } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import Fraction from "fraction.js";
import { Box } from "@material-ui/core";
import {
  availableFilterOperations,
  AvailableFilterOperations,
  AvailableRangeFilterOperations,
  getAvailableRangeOps,
  RangeFilterIcons,
} from "../filters/rangeFilterUtils";
import {
  RationalInput,
  RationalInputProps,
} from "../../../Inputs/RationalInput";
import { LogicFilter } from "../plugins/FilterColumnsState";
import { OnFilter } from "../plugins/TableCell";

// Data Cell
export interface RationalCellProps {
  formatter?: Intl.NumberFormat;
}

export const RationalCell = (
  props: Table.DataCellProps & RationalCellProps
): JSX.Element => {
  const { value, formatter, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={
        formatter?.format((value as Fraction).valueOf()) ||
        (value as Fraction).valueOf()
      }
    />
  );
};

// Filter Cell
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

const getOnFilterArgs = (
  columnName: string,
  opA: AvailableFilterOperations,
  totalA: Fraction | null,
  opB: AvailableRangeFilterOperations | undefined,
  totalB: Fraction | null
): Parameters<OnFilter<Fraction, AvailableFilterOperations>> => {
  if (!totalA) {
    return [null];
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
      filters: [logicFilter],
    },
  ];
};

export type RationalFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter;
  rationalInputProps?: RationalInputProps;
};

export const RationalFilter = (props: RationalFilterProps): JSX.Element => {
  const { rationalInputProps, ...rest } = props;

  const { filteringEnabled, getMessage, onFilter, column } = props;

  const columnName = column.name;

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

  const onChangeRational = useCallback<
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

      onFilter(
        ...getOnFilterArgs(
          columnName,
          state.selectorValue,
          total,
          state.rangeSelectorValue,
          state.boundTotal
        )
      );
    },
    [
      columnName,
      onFilter,
      setState,
      state.selectorValue,
      state.rangeSelectorValue,
      state.boundTotal,
    ]
  );

  const onChangeBoundRational = useCallback<
    NonNullable<RationalInputProps["onChange"]>
  >(
    (_, boundTotal) => {
      setState((state) => ({
        ...state,
        boundTotal,
        rangeSelectorValue: boundTotal ? state.rangeSelectorValue : undefined,
      }));

      onFilter(
        ...getOnFilterArgs(
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
      onFilter,
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

      onFilter(
        ...getOnFilterArgs(
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
      onFilter,
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

      onFilter(
        ...getOnFilterArgs(
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
      onFilter,
    ]
  );

  const isRangeOp =
    state.selectorValue !== "equal" && state.selectorValue !== "notEqual";

  return (
    <TableFilterRow.Cell {...(rest as TableFilterRow.CellProps)}>
      <Box width="100%">
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
            onChange={onChangeRational}
            size="small"
            {...(rationalInputProps || {})}
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
              onChange={onChangeBoundRational}
              size="small"
              {...(rationalInputProps || {})}
            />
          </Box>
        )}
      </Box>
    </TableFilterRow.Cell>
  );
};
