import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import Fraction from "fraction.js";
import { Box } from "@material-ui/core";

import {
  availableFilterOperations,
  AvailableFilterOperations,
  AvailableRangeFilterOperations,
  getAvailableRangeOps,
  isRangeSelector,
  RangeFilterIcons,
} from "../filters/rangeFilterUtils";
import {
  RationalInputBase,
  RationalInputBaseProps,
} from "../../../Inputs/RationalInput";
import { TableFilterCellProps } from "../plugins";
import { DefaultFilterOperations, Filter, OnFilter } from "../plugins";
import { inlineInputProps, inlinePaddingWithSelector } from "./shared";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

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
export type RationalFilterProps = TableFilterCellProps<
  Fraction,
  AvailableFilterOperations
> & {
  onFilter: OnFilter;
  rationalInputProps?: RationalInputBaseProps;
};

export const RationalFilter = (props: RationalFilterProps): JSX.Element => {
  const { rationalInputProps: rationalInputPropsProp, ...rest } = props;

  const { filteringEnabled, getMessage, filter, onFilter } = props;

  const columnName = props.column.name;

  type RationalFilterState = {
    rational: Fraction | null;
    rationalSelector: AvailableFilterOperations;
    rangeRational: Fraction | null;
    rangeRationalSelector?: AvailableRangeFilterOperations;
    availableRangeRationalSelectors?: AvailableRangeFilterOperations[];
    maxRangeRational?: Fraction;
    minRangeRational?: Fraction;
  };

  const {
    rational,
    rationalSelector,
    rangeRational,
    rangeRationalSelector,
    availableRangeRationalSelectors,
    // maxRangeRational,
    // minRangeRational,
  } = useMemo<RationalFilterState>(() => {
    const rationalFilterState: RationalFilterState = {
      rational: null,
      rationalSelector: "equal",
      rangeRational: null,
    };

    if (!filter) {
      return rationalFilterState;
    } else if ("operation" in filter) {
      rationalFilterState.rational = filter.value || null;
      rationalFilterState.rationalSelector = filter.operation;
    } else {
      const [rationalOp, rangeRationalOp] = filter.filters;

      if ("operation" in rationalOp) {
        rationalFilterState.rational = rationalOp.value || null;
        rationalFilterState.rationalSelector = rationalOp.operation;
      }

      if ("operation" in rangeRationalOp) {
        rationalFilterState.rangeRational = rangeRationalOp.value || null;
        rationalFilterState.rangeRationalSelector =
          rangeRationalOp.operation as AvailableRangeFilterOperations;
      }
    }

    // Set available range selectors
    rationalFilterState.availableRangeRationalSelectors = getAvailableRangeOps(
      rationalFilterState.rationalSelector
    );

    // Set max or min range rationals
    switch (rationalFilterState.rationalSelector) {
      case "greaterThan":
      case "greaterThanOrEqual":
        rationalFilterState.minRangeRational =
          rationalFilterState.rational || undefined;
        break;
      case "lessThan":
      case "lessThanOrEqual":
        rationalFilterState.maxRangeRational =
          rationalFilterState.rational || undefined;
        break;
      default:
        break;
    }

    return rationalFilterState;
  }, [filter]);

  const handleRationalChange = useCallback<
    NonNullable<RationalInputBaseProps["onChange"]>
  >(
    (_, newRational) => {
      if (
        (newRational !== null &&
          rational !== null &&
          newRational.equals(rational)) ||
        newRational === rational
      ) {
        return;
      }

      if (!newRational) {
        onFilter(null);
      } else if (rangeRational && rangeRationalSelector) {
        onFilter({
          columnName,
          operator: "and",
          filters: [
            { operation: rationalSelector, value: newRational },
            { operation: rangeRationalSelector, value: rangeRational },
          ],
        });
      } else {
        onFilter({
          columnName,
          operation: rationalSelector,
          value: newRational || undefined,
        });
      }

      // if(newRational)
    },
    [
      columnName,
      onFilter,
      rangeRational,
      rangeRationalSelector,
      rational,
      rationalSelector,
    ]
  );

  const handleRangeRationalChange = useCallback<
    NonNullable<RationalInputBaseProps["onChange"]>
  >(
    (_, newRangeRational) => {
      if (
        (newRangeRational !== null &&
          rangeRational !== null &&
          newRangeRational.equals(rangeRational)) ||
        newRangeRational === rangeRational
      ) {
        return;
      }

      onFilter({
        columnName,
        operator: "and",
        filters: [
          { operation: rationalSelector, value: rational as Fraction },
          {
            operation: rangeRationalSelector as AvailableRangeFilterOperations,
            value: newRangeRational || undefined,
          },
        ],
      });
    },
    [
      rangeRational,
      onFilter,
      columnName,
      rationalSelector,
      rational,
      rangeRationalSelector,
    ]
  );

  const handleRationalSelectorChange = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (newRationalSelector) => {
      if (newRationalSelector === rationalSelector) {
        return;
      }

      onFilter({
        columnName,
        operation: newRationalSelector as AvailableFilterOperations,
        value: rational || undefined,
      });
    },
    [columnName, rational, rationalSelector, onFilter]
  );

  const handleRangeRationalSelectorChange = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (newRangeRationalSelector) => {
      if (newRangeRationalSelector === rangeRationalSelector) {
        return;
      }

      onFilter({
        columnName,
        operator: "and",
        filters: [
          { operation: rationalSelector, value: rational as Fraction },
          {
            operation:
              newRangeRationalSelector as AvailableRangeFilterOperations,
            value: rangeRational || undefined,
          },
        ],
      });
    },
    [
      columnName,
      rational,
      rationalSelector,
      onFilter,
      rangeRational,
      rangeRationalSelector,
    ]
  );

  const rationalInputProps = useMemo(() => {
    if (rationalInputPropsProp) {
      return {
        ...rationalInputPropsProp,
        InputProps: {
          ...inlineInputProps,
          ...(rationalInputPropsProp.InputProps || {}),
        },
      };
    } else {
      return {
        InputProps: inlineInputProps,
      };
    }
  }, [rationalInputPropsProp]);

  const isRangeOp = isRangeSelector(rationalSelector);

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePaddingWithSelector}
    >
      <Box width="100%">
        <Box display="flex" alignItems="center">
          <TableFilterRow.FilterSelector
            availableValues={
              availableFilterOperations as AvailableFilterOperations[]
            }
            disabled={!filteringEnabled}
            getMessage={getMessage}
            iconComponent={RangeFilterIcons}
            onChange={handleRationalSelectorChange}
            toggleButtonComponent={TableFilterRow.ToggleButton}
            value={rationalSelector}
          />
          <RationalInputBase
            disabled={!filteringEnabled}
            fullWidth
            onChange={handleRationalChange}
            size="small"
            value={rational}
            {...rationalInputProps}
          />
        </Box>
        {isRangeOp && !!rational && (
          <Box display="flex" alignItems="center">
            <TableFilterRow.FilterSelector
              availableValues={availableRangeRationalSelectors || []}
              disabled={!filteringEnabled}
              getMessage={getMessage}
              iconComponent={RangeFilterIcons}
              onChange={handleRangeRationalSelectorChange}
              toggleButtonComponent={TableFilterRow.ToggleButton}
              value={rangeRationalSelector || "addRangeBound"}
            />
            <RationalInputBase
              disabled={!filteringEnabled || !rangeRationalSelector}
              fullWidth
              onChange={handleRangeRationalChange}
              size="small"
              value={rangeRational}
              {...(rationalInputProps || {})}
            />
          </Box>
        )}
      </Box>
    </TableFilterRow.Cell>
  );
};

export const rationalFilterColumnExtension = (
  columnName: string,
  toString: (value: Fraction) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    const filterTotal = (filter as unknown as Filter<Fraction>).value;

    if (filterTotal === undefined) {
      return true;
    }

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
