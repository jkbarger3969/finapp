import React, { useCallback, useMemo, useState } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { Box, makeStyles } from "@material-ui/core";
import {
  availableFilterOperations,
  AvailableFilterOperations,
  AvailableRangeFilterOperations,
  getAvailableRangeOps,
  RangeFilterIcons,
} from "../filters/rangeFilterUtils";
import { addDays, differenceInDays, startOfDay, subDays } from "date-fns";
import { OnFilter } from "../plugins/TableCell";
import { LogicFilter } from "../plugins";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

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

// Filter Cell
export type DateFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter<Date, AvailableFilterOperations>;
};

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

const isIntervalValid = (
  opA: AvailableFilterOperations,
  dateA: Date,
  opB: AvailableRangeFilterOperations,
  dateB: Date
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

      return differenceInDays(dateB, dateA) > 0;

    case "greaterThanOrEqual":
      if (opB === "greaterThan" || opB === "greaterThanOrEqual") {
        // Inequalities CANNOT have the SAME direction.
        return false;
      } else if (opB === "lessThanOrEqual") {
        // When both ops are inclusive, equal dates are valid.
        return differenceInDays(dateB, dateA) >= 0;
      }

      return differenceInDays(dateB, dateA) > 0;

    case "lessThan":
      // Inequalities CANNOT have the SAME direction.
      if (opB === "lessThan" || opB === "lessThanOrEqual") {
        return false;
      }

      return differenceInDays(dateA, dateB) > 0;

    case "lessThanOrEqual":
      if (opB === "lessThan" || opB === "lessThanOrEqual") {
        // Inequalities CANNOT have the SAME direction.
        return false;
      } else if (opB === "greaterThanOrEqual") {
        // When both ops are inclusive, equal dates are valid .
        return differenceInDays(dateA, dateB) >= 0;
      }

      return differenceInDays(dateA, dateB) > 0;
  }
};

const getOnFilterArgs = (
  columnName: string,
  opA: AvailableFilterOperations,
  dateA: Date | null,
  opB: AvailableRangeFilterOperations | undefined,
  dateB: Date | null
): Parameters<OnFilter<Date, AvailableFilterOperations>> => {
  if (!dateA) {
    return [null];
  }

  const logicFilter: LogicFilter<Date, AvailableFilterOperations> = {
    operator: "and",
    filters: [
      {
        operation: opA,
        value: dateA,
      },
    ],
  };

  if (opB && dateB) {
    logicFilter.filters.push({
      operation: opB,
      value: dateB,
    });
  }

  return [
    {
      columnName,
      filters: [logicFilter],
    },
  ];
};

export const DateFilter = (props: DateFilterProps): JSX.Element => {
  const { filteringEnabled, getMessage } = props;

  const columnName = props.column.name;

  const classes = useStyles();

  const [state, setState] = useState<{
    date: Date | null;
    boundDate: Date | null;
    selectorValue: AvailableFilterOperations;
    rangeSelectorValue?: AvailableRangeFilterOperations;
    availableRangeValues?: AvailableRangeFilterOperations[];
  }>({
    date: null,
    boundDate: null,
    selectorValue: "equal",
  });

  const onChangeDate = useCallback<KeyboardDatePickerProps["onChange"]>(
    (date) => {
      if (
        date &&
        state.rangeSelectorValue &&
        state.boundDate &&
        !isIntervalValid(
          state.selectorValue,
          date,
          state.rangeSelectorValue,
          state.boundDate
        )
      ) {
        const availableRangeValues = getAvailableRangeOps(state.selectorValue);

        setState((state) => ({
          ...state,
          date,
          boundDate: null,
          rangeSelectorValue: undefined,
          availableRangeValues,
        }));
      } else {
        setState((state) => ({
          ...state,
          date,
        }));
      }

      props.onFilter(
        ...getOnFilterArgs(
          columnName,
          state.selectorValue,
          date,
          state.rangeSelectorValue,
          state.boundDate
        )
      );
    },
    [
      setState,
      state.selectorValue,
      state.rangeSelectorValue,
      columnName,
      state.boundDate,
      props.onFilter,
    ]
  );

  const onChangeBoundDate = useCallback<KeyboardDatePickerProps["onChange"]>(
    (boundDate) => {
      setState((state) => ({
        ...state,
        boundDate,
        rangeSelectorValue: boundDate ? state.rangeSelectorValue : undefined,
      }));

      props.onFilter(
        ...getOnFilterArgs(
          columnName,
          state.selectorValue,
          state.date,
          state.rangeSelectorValue,
          boundDate
        )
      );
    },
    [
      setState,
      state.selectorValue,
      state.date,
      state.rangeSelectorValue,
      columnName,
      props.onFilter,
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
        state.date &&
        state.rangeSelectorValue &&
        state.boundDate &&
        !isIntervalValid(
          selectorValue as AvailableFilterOperations,
          state.date,
          state.rangeSelectorValue,
          state.boundDate
        )
      ) {
        // Reset bounded range if new interval is Invalid
        setState((state) => ({
          ...state,
          selectorValue: selectorValue as AvailableFilterOperations,
          boundDate: null,
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
              boundDate: null,
              rangeSelectorValue: undefined,
              availableRangeValues,
            }));
        }
      }

      props.onFilter(
        ...getOnFilterArgs(
          columnName,
          selectorValue as AvailableFilterOperations,
          state.date,
          state.rangeSelectorValue,
          state.boundDate
        )
      );
    },
    [
      setState,
      state.date,
      state.rangeSelectorValue,
      state.boundDate,
      columnName,
      props.onFilter,
    ]
  );

  const onChangeRangeFilterOp = useCallback<
    TableFilterRow.FilterSelectorProps["onChange"]
  >(
    (rangeSelectorValue) => {
      if (
        state.date &&
        state.boundDate &&
        !isIntervalValid(
          state.selectorValue as AvailableFilterOperations,
          state.date,
          rangeSelectorValue as AvailableRangeFilterOperations,
          state.boundDate
        )
      ) {
        // Reset bounded date if new interval is Invalid
        setState((state) => ({
          ...state,
          rangeSelectorValue: rangeSelectorValue as AvailableRangeFilterOperations,
          boundDate: null,
        }));
      } else {
        setState((state) => ({
          ...state,
          rangeSelectorValue: rangeSelectorValue as AvailableRangeFilterOperations,
        }));
      }

      props.onFilter(
        ...getOnFilterArgs(
          columnName,
          state.selectorValue as AvailableFilterOperations,
          state.date,
          rangeSelectorValue as AvailableRangeFilterOperations,
          state.boundDate
        )
      );
    },
    [
      setState,
      state.date,
      state.boundDate,
      state.selectorValue,
      columnName,
      props.onFilter,
    ]
  );

  const minDate = useMemo<KeyboardDatePickerProps["minDate"]>(() => {
    if (!state.date) {
      return undefined;
    }

    switch (state.selectorValue) {
      case "greaterThan":
        return addDays(state.date, 1);
      case "greaterThanOrEqual":
        if (state.rangeSelectorValue === "lessThanOrEqual") {
          return state.date;
        }
        return addDays(state.date, 1);
      default:
        return undefined;
    }
  }, [state.selectorValue, state.rangeSelectorValue, state.date]);

  const maxDate = useMemo<KeyboardDatePickerProps["maxDate"]>(() => {
    if (!state.date) {
      return undefined;
    }

    switch (state.selectorValue) {
      case "lessThan":
        return subDays(state.date, 1);
      case "lessThanOrEqual":
        if (state.rangeSelectorValue === "greaterThanOrEqual") {
          return state.date;
        }
        return subDays(state.date, 1);
      default:
        return undefined;
    }
  }, [state.selectorValue, state.rangeSelectorValue, state.date]);

  const isRangeOp =
    state.selectorValue !== "equal" && state.selectorValue !== "notEqual";

  return (
    <TableFilterRow.Cell {...(props as TableFilterRow.CellProps)}>
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
              onChange={onChangeFilterOp}
              toggleButtonComponent={TableFilterRow.ToggleButton}
              value={state.selectorValue}
            />
            <KeyboardDatePicker
              className={classes.keyboardDatePicker}
              autoOk
              disabled={!filteringEnabled}
              disableFuture
              disableToolbar
              format="MM/dd/yyyy"
              fullWidth
              initialFocusedDate={startOfDay(new Date()).toISOString()}
              inputVariant="standard"
              margin="dense"
              onChange={onChangeDate}
              placeholder={"mm/dd/yyyy"}
              size="small"
              value={state.date}
              variant="inline"
            />
          </MuiPickersUtilsProvider>
        </Box>
        {isRangeOp && !!state.date && (
          <Box display="flex" alignItems="center">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <TableFilterRow.FilterSelector
                availableValues={state.availableRangeValues || []}
                disabled={!filteringEnabled || !isRangeOp}
                getMessage={getMessage}
                iconComponent={RangeFilterIcons}
                onChange={onChangeRangeFilterOp}
                toggleButtonComponent={TableFilterRow.ToggleButton}
                value={state.rangeSelectorValue || "addRangeBound"}
              />
              <KeyboardDatePicker
                autoOk
                disabled={
                  !filteringEnabled || !isRangeOp || !state.rangeSelectorValue
                }
                disableFuture
                disableToolbar
                className={classes.keyboardDatePicker}
                format="MM/dd/yyyy"
                fullWidth
                initialFocusedDate={startOfDay(new Date()).toISOString()}
                inputVariant="standard"
                margin="dense"
                maxDate={maxDate}
                minDate={minDate}
                onChange={onChangeBoundDate}
                placeholder={"mm/dd/yyyy"}
                size="small"
                value={state.boundDate}
                variant="inline"
              />
            </MuiPickersUtilsProvider>
          </Box>
        )}
      </Box>
    </TableFilterRow.Cell>
  );
};
