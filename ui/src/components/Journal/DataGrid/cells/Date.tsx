import React, { useCallback, useMemo } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { Box, makeStyles } from "@material-ui/core";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { isEqual, isSameDay, startOfDay } from "date-fns";

import {
  availableFilterOperations,
  AvailableFilterOperations,
  AvailableRangeFilterOperations,
  getAvailableRangeOps,
  isRangeSelector,
  RangeFilterIcons,
} from "../filters/rangeFilterUtils";
import { TableFilterCellProps } from "../plugins";
import { inlinePaddingWithSelector } from "./shared";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import { DefaultFilterOperations, Filter } from "../plugins";

export interface DateCellProps {
  formatter?: Intl.DateTimeFormat;
}

export const DateCell = (
  props: Table.DataCellProps & DateCellProps
): JSX.Element => {
  const { value, formatter, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={formatter?.format(value) || (value as Date).toLocaleString()}
    />
  );
};

const defaultKeyboardDatePickerProps: Partial<KeyboardDatePickerProps> = {
  autoOk: true,
  disableFuture: true,
  disableToolbar: true,
  format: "MM/dd/yyyy",
  fullWidth: true,
  inputVariant: "standard",
  margin: "dense",
  placeholder: "mm/dd/yyyy",
  size: "small",
  variant: "inline",
};

// Filter Cell
export type DateFilterProps = TableFilterCellProps<
  Date,
  AvailableFilterOperations
>;

const useStyles = makeStyles((theme) => ({
  keyboardDatePicker: {
    // Fix bar alignment
    position: "relative",
    top: "-1px",
    // space filter op selector
    marginLeft: theme.spacing(1),
  },
  tableCell: {
    // Align FilterSelector left
    paddingLeft: "0px !important",
  },
}));

export const DateFilter = (props: DateFilterProps): JSX.Element => {
  const { filteringEnabled, getMessage, filter, onFilter } = props;

  const columnName = props.column.name;

  const classes = useStyles();

  type DateFilterState = {
    date: Date | null;
    dateSelector: AvailableFilterOperations;
    rangeDate: Date | null;
    rangeDateSelector?: AvailableRangeFilterOperations;
    availableRangeDateSelectors?: AvailableRangeFilterOperations[];
    maxRangeDate?: Date;
    minRangeDate?: Date;
  };

  const {
    date,
    dateSelector,
    rangeDate,
    rangeDateSelector,
    availableRangeDateSelectors,
    maxRangeDate,
    minRangeDate,
  } = useMemo<DateFilterState>(() => {
    const dateFilterState: DateFilterState = {
      date: null,
      dateSelector: "equal",
      rangeDate: null,
    };

    // Default;
    if (!filter) {
      return dateFilterState;
    }

    if ("operation" in filter) {
      dateFilterState.date = filter.value || null;
      dateFilterState.dateSelector = filter.operation;
    } else {
      const [dateOp, rangeDateOp] = filter.filters;

      if ("operation" in dateOp) {
        dateFilterState.date = dateOp.value || null;
        dateFilterState.dateSelector = dateOp.operation;
      }

      if ("operation" in rangeDateOp) {
        dateFilterState.rangeDate = rangeDateOp.value || null;
        dateFilterState.rangeDateSelector =
          rangeDateOp.operation as AvailableRangeFilterOperations;
      }
    }

    // Set available range selectors
    dateFilterState.availableRangeDateSelectors = getAvailableRangeOps(
      dateFilterState.dateSelector
    );

    // Set max or min range dates
    switch (dateFilterState.dateSelector) {
      case "greaterThan":
      case "greaterThanOrEqual":
        dateFilterState.minRangeDate = dateFilterState.date || undefined;
        break;
      case "lessThan":
      case "lessThanOrEqual":
        dateFilterState.maxRangeDate = dateFilterState.date || undefined;
        break;
      default:
        break;
    }

    return dateFilterState;
  }, [filter]);

  const handleDateChange = useCallback<KeyboardDatePickerProps["onChange"]>(
    (newDate) => {
      if (
        (newDate !== null && date !== null && isEqual(newDate, date)) ||
        newDate === date
      ) {
        return;
      }

      if (!newDate) {
        onFilter(null);
      } else if (rangeDate && rangeDateSelector) {
        onFilter({
          columnName,
          operator: "and",
          filters: [
            { operation: dateSelector, value: newDate },
            { operation: rangeDateSelector, value: rangeDate },
          ],
        });
      } else {
        onFilter({
          columnName,
          operation: dateSelector,
          value: newDate || undefined,
        });
      }
    },
    [date, rangeDate, rangeDateSelector, onFilter, columnName, dateSelector]
  );

  const handleDateRangeChange = useCallback<
    KeyboardDatePickerProps["onChange"]
  >(
    (newRangeDate) => {
      if (
        (newRangeDate !== null &&
          rangeDate !== null &&
          isEqual(newRangeDate, rangeDate)) ||
        newRangeDate === rangeDate
      ) {
        return;
      }

      onFilter({
        columnName,
        operator: "and",
        filters: [
          { operation: dateSelector, value: date as Date },
          {
            operation: rangeDateSelector as AvailableRangeFilterOperations,
            value: newRangeDate || undefined,
          },
        ],
      });
    },
    [rangeDate, onFilter, columnName, dateSelector, date, rangeDateSelector]
  );

  const handleDateSelectorChange = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (newDateSelector) => {
      if (newDateSelector === dateSelector) {
        return;
      }

      onFilter({
        columnName,
        operation: newDateSelector as AvailableFilterOperations,
        value: date || undefined,
      });
    },
    [columnName, date, dateSelector, onFilter]
  );

  const handleRangeDateSelectorChange = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (newRangeDateSelector) => {
      if (newRangeDateSelector === rangeDateSelector) {
        return;
      }

      onFilter({
        columnName,
        operator: "and",
        filters: [
          { operation: dateSelector, value: date as Date },
          {
            operation: newRangeDateSelector as AvailableRangeFilterOperations,
            value: rangeDate || undefined,
          },
        ],
      });
    },
    [columnName, date, dateSelector, onFilter, rangeDate, rangeDateSelector]
  );

  const isRangeOp = isRangeSelector(dateSelector);

  return (
    <TableFilterRow.Cell
      {...(props as TableFilterRow.CellProps)}
      style={inlinePaddingWithSelector}
    >
      <Box width="100%">
        <Box display="flex" alignItems="end" justifyItems="flex-start">
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <TableFilterRow.FilterSelector
              availableValues={
                availableFilterOperations as AvailableFilterOperations[]
              }
              disabled={!filteringEnabled}
              getMessage={getMessage}
              iconComponent={RangeFilterIcons}
              onChange={handleDateSelectorChange}
              toggleButtonComponent={TableFilterRow.ToggleButton}
              value={dateSelector}
            />
            <KeyboardDatePicker
              {...defaultKeyboardDatePickerProps}
              className={classes.keyboardDatePicker}
              disabled={!filteringEnabled}
              initialFocusedDate={startOfDay(new Date()).toISOString()}
              onChange={handleDateChange}
              value={date}
              // maxDate={maxDate}
              // minDate={minDate}
            />
          </MuiPickersUtilsProvider>
        </Box>
        {isRangeOp && !!date && (
          <Box display="flex" alignItems="center">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <TableFilterRow.FilterSelector
                availableValues={availableRangeDateSelectors || []}
                disabled={!filteringEnabled}
                getMessage={getMessage}
                iconComponent={RangeFilterIcons}
                onChange={handleRangeDateSelectorChange}
                toggleButtonComponent={TableFilterRow.ToggleButton}
                value={rangeDateSelector || "addRangeBound"}
              />
              <KeyboardDatePicker
                {...defaultKeyboardDatePickerProps}
                disabled={!filteringEnabled || !rangeDateSelector}
                className={classes.keyboardDatePicker}
                initialFocusedDate={startOfDay(new Date()).toISOString()}
                inputVariant="standard"
                maxDate={maxRangeDate}
                minDate={minRangeDate}
                onChange={handleDateRangeChange}
                value={rangeDate}
              />
            </MuiPickersUtilsProvider>
          </Box>
        )}
      </Box>
    </TableFilterRow.Cell>
  );
};

export const dateFilterColumnExtension = (
  columnName: string,
  toString: (value: Date) => string
): IntegratedFiltering.ColumnExtension => {
  return {
    columnName,
    predicate: (value, filter, row): boolean => {
      const filterDate = (filter as unknown as Filter<Date>).value;

      if (filterDate === undefined) {
        return true;
      }

      switch (filter.operation as DefaultFilterOperations) {
        case "equal":
          return isSameDay(value as Date, filterDate);
        case "notEqual":
          return !isSameDay(value as Date, filterDate);
        case "greaterThan":
          return startOfDay(value as Date) > startOfDay(filterDate);
        case "greaterThanOrEqual":
          return startOfDay(value as Date) >= startOfDay(filterDate);
        case "lessThan":
          return startOfDay(value as Date) < startOfDay(filterDate);
        case "lessThanOrEqual":
          return startOfDay(value as Date) <= startOfDay(filterDate);
        default:
          return IntegratedFiltering.defaultPredicate(
            toString(value as Date),
            filter,
            row
          );
      }
    },
  };
};
