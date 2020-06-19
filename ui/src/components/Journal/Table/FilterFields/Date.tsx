import React, { useMemo, useCallback, useState } from "react";
import {
  Popover,
  Box,
  Select,
  InputAdornment,
  TextField,
  SelectProps,
  InputProps as InputPropsType,
  TextFieldProps,
  MenuItem,
  Grid,
  IconButton,
  IconButtonProps,
  Tooltip,
} from "@material-ui/core";
import {
  FilterList as FilterListIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Clear as ClearIcon,
} from "@material-ui/icons";
import {
  Equal as EqualIcon,
  GreaterThan as GreaterThanIcon,
  LessThan as LessThanIcon,
  GreaterThanOrEqual as GreaterThanOrEqualIcon,
  LessThanOrEqual as LessThanOrEqualIcon,
} from "mdi-material-ui";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {
  format as dateFormat,
  startOfDay,
  addDays,
  subDays,
  isValid as isDateValid,
} from "date-fns";

enum Op {
  None = 1,
  Equal,
  GreaterThan,
  LessThan,
  GreaterThanOrEqual,
  LessThanOrEqual,
}

const op2ValidOptions = (
  date1: Date | null,
  op1: Op
): [Date | undefined, Date | undefined, Op[]] => {
  if (!date1) {
    return [undefined, undefined, [Op.None]];
  }

  switch (op1) {
    case Op.None:
    case Op.Equal:
      return [undefined, undefined, [Op.None]];
    case Op.GreaterThan:
    case Op.GreaterThanOrEqual:
      return [
        addDays(date1, 1),
        undefined,
        [Op.None, Op.LessThan, Op.LessThanOrEqual],
      ];
    case Op.LessThan:
    case Op.LessThanOrEqual:
      return [
        undefined,
        subDays(date1, 1),
        [Op.None, Op.GreaterThan, Op.GreaterThanOrEqual],
      ];
  }
};

const MAX_DATE = new Date(8640000000000000);
const MIN_DATE = new Date(-8640000000000000);

const DateFilter = (props: { setFilter: (filter) => void }) => {
  const { setFilter: setFilterCb } = props;

  const [value, setValue] = useState("");

  const [op1, setOp1] = useState(Op.Equal);
  const [date1, setDate1] = useState<Date | null>(null);

  const [op2, setOp2] = useState(Op.None);
  const [date2, setDate2] = useState<Date | null>(null);

  const [minDate, maxDate, validOp2s] = useMemo(
    () => op2ValidOptions(date1, op1),
    [date1, op1]
  );

  const setFilter = useCallback(
    (queries: { op: Op; date: Date }[]) => {
      if (queries.length === 0) {
        setValue("");
        setFilterCb({});
        return;
      }

      const $and: object[] = [];

      const values: string[] = [];

      for (const { op, date } of queries) {
        const [mongoOp, opSym] = (() => {
          switch (op) {
            case Op.Equal:
              return ["$eq", "="];
            case Op.GreaterThan:
              return ["$gt", ">"];
            case Op.GreaterThanOrEqual:
              return ["$gte", ">="];
            case Op.LessThan:
              return ["$lt", "<"];
            case Op.LessThanOrEqual:
              return ["$lte", "<="];
          }
        })();
        $and.push({
          date: { [mongoOp]: startOfDay(date) },
        });

        values.push(`${opSym}[${dateFormat(date, "d/M/yy")}]`);
      }

      setValue(values.join(" & "));
      setFilterCb({ $and });
    },
    [setFilterCb]
  );

  const onChangeOp1 = useCallback<NonNullable<SelectProps["onChange"]>>(
    (event) => {
      const op = (event.target.value ?? Op.Equal) as Op;
      setOp1(op);

      // If op2 is no longer valid given op1, clear op2 and date2
      const [, , validOps] = op2ValidOptions(date1, op);
      const op2Valid = validOps.includes(op2);
      if (!op2Valid) {
        setOp2(Op.None);
        setDate2(null);
      }

      // If date1 is set update filters
      if (date1) {
        const filters = [
          {
            op,
            date: date1,
          },
        ];

        // Include op2 if exists and valid
        if (op2Valid && op2 !== Op.None && op2 !== Op.Equal && date2) {
          filters.push({
            op: op2,
            date: date2,
          });
        }

        setFilter(filters);
      }
    },
    [date1, date2, op2, setFilter]
  );

  const onChangeOp2 = useCallback<NonNullable<SelectProps["onChange"]>>(
    (event) => {
      const op = (event.target.value ?? Op.None) as Op;
      setOp2(op);
      // If op2 is set to non clear date2 and update filter
      if (op === Op.None) {
        setDate2(null);
        if (date1) {
          setFilter([
            {
              op: op1,
              date: date1,
            },
          ]);
        } else {
          setFilter([]);
        }
      } else if (date2) {
        setFilter([
          {
            op: op1,
            date: date1 as Date,
          },
          {
            op,
            date: date2,
          },
        ]);
      }
    },
    [date1, date2, op1, setFilter]
  );

  const onChangeDate1 = useCallback<KeyboardDatePickerProps["onChange"]>(
    (date, value) => {
      if (date && !isDateValid(date)) {
        return;
      }

      setDate1(date);

      if (date) {
        const filters = [
          {
            op: op1,
            date,
          },
        ];

        // If date2 insure is still valid
        if (date2) {
          const [minDate, maxDate] = op2ValidOptions(date, op1);

          if (
            (op2 !== Op.None &&
              op2 !== Op.Equal &&
              minDate &&
              date2 >= minDate) ||
            (maxDate && date2 <= maxDate)
          ) {
            filters.push({
              op: op2,
              date: date2,
            });
            // Clear date2 if no longer valid
          } else {
            setOp2(Op.None);
            setDate2(null);
          }
        }

        setFilter(filters);
      } else {
        setFilter([]); // Clear filters
        // Clear op2 and date2
        setOp2(Op.None);
        setDate2(null);
      }
    },
    [date2, op1, op2, setFilter]
  );

  const onChangeDate2 = useCallback<KeyboardDatePickerProps["onChange"]>(
    (date, value) => {
      if (date && !isDateValid(date)) {
        return;
      }

      setDate2(date);

      if (date) {
        setFilter([
          { op: op1, date: date1 as Date },
          { op: op2, date },
        ]);
      } else {
        setFilter(date1 ? [{ op: op1, date: date1 as Date }] : []); // Clear filters
        // Clear date2
        setDate2(null);
      }
    },
    [date1, op1, op2, setFilter]
  );

  const onClickClear = useCallback<NonNullable<IconButtonProps["onClick"]>>(
    (event) => {
      event.stopPropagation();
      setOp1(Op.Equal);
      setDate1(null);
      setOp2(Op.None);
      setDate2(null);
      setFilter([]);
    },
    [setFilter]
  );

  const InputProps = useMemo<InputPropsType>(
    () => ({
      startAdornment: (
        <InputAdornment disablePointerEvents position="start">
          <FilterListIcon />
        </InputAdornment>
      ),
      endAdornment: date1 ? (
        <InputAdornment position="end">
          <IconButton onClick={onClickClear}>
            <ClearIcon />
          </IconButton>
        </InputAdornment>
      ) : (
        <InputAdornment disablePointerEvents position="end">
          <ArrowDropDownIcon />
        </InputAdornment>
      ),
    }),
    [date1, onClickClear]
  );

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const onClick = useCallback<NonNullable<TextFieldProps["onClick"]>>(
    (event) => void setAnchorEl(event.currentTarget),
    []
  );

  const onClose = useCallback((event) => void setAnchorEl(null), []);

  return (
    <Box>
      <Tooltip title={value || "No Filter"}>
        <Box maxWidth={250}>
          <TextField
            fullWidth
            value={value}
            InputProps={InputProps}
            onClick={onClick}
          ></TextField>
        </Box>
      </Tooltip>

      <Popover onClose={onClose} open={!!anchorEl} anchorEl={anchorEl}>
        <Box maxWidth={350} margin={2} clone>
          <Grid container spacing={2}>
            <Grid xs={12} item>
              <Box marginTop={1}>
                <Select value={op1} onChange={onChangeOp1}>
                  <MenuItem value={Op.Equal}>
                    <EqualIcon />
                  </MenuItem>
                  <MenuItem value={Op.GreaterThan}>
                    <GreaterThanIcon />
                  </MenuItem>
                  <MenuItem value={Op.LessThan}>
                    <LessThanIcon />
                  </MenuItem>
                  <MenuItem value={Op.GreaterThanOrEqual}>
                    <GreaterThanOrEqualIcon />
                  </MenuItem>
                  <MenuItem value={Op.LessThanOrEqual}>
                    <LessThanOrEqualIcon />
                  </MenuItem>
                </Select>
              </Box>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  onChange={onChangeDate1}
                  value={date1}
                  format="MM/dd/yyyy"
                  placeholder={"mm/dd/yyyy"}
                  margin="none"
                  label="Date"
                  animateYearScrolling={true}
                  disableToolbar={true}
                  autoOk={true}
                  variant={"inline"}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            {!!date1 && op1 !== Op.Equal && (
              <Grid xs={12} item>
                <Box marginTop={1}>
                  <Select value={op2} onChange={onChangeOp2}>
                    <MenuItem value={Op.None}>{"None"}</MenuItem>
                    <MenuItem style={{ display: "None" }} value={Op.Equal}>
                      <EqualIcon />
                    </MenuItem>
                    <MenuItem
                      style={
                        validOp2s.includes(Op.GreaterThan)
                          ? undefined
                          : { display: "none" }
                      }
                      disabled={!validOp2s.includes(Op.GreaterThan)}
                      value={Op.GreaterThan}
                    >
                      <GreaterThanIcon />
                    </MenuItem>
                    <MenuItem
                      style={
                        validOp2s.includes(Op.LessThan)
                          ? undefined
                          : { display: "none" }
                      }
                      disabled={!validOp2s.includes(Op.LessThan)}
                      value={Op.LessThan}
                    >
                      <LessThanIcon />
                    </MenuItem>
                    <MenuItem
                      style={
                        validOp2s.includes(Op.GreaterThanOrEqual)
                          ? undefined
                          : { display: "none" }
                      }
                      disabled={!validOp2s.includes(Op.GreaterThanOrEqual)}
                      value={Op.GreaterThanOrEqual}
                    >
                      <GreaterThanOrEqualIcon />
                    </MenuItem>
                    <MenuItem
                      style={
                        validOp2s.includes(Op.LessThanOrEqual)
                          ? undefined
                          : { display: "none" }
                      }
                      disabled={!validOp2s.includes(Op.LessThanOrEqual)}
                      value={Op.LessThanOrEqual}
                    >
                      <LessThanOrEqualIcon />
                    </MenuItem>
                  </Select>
                </Box>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disabled={op2 === Op.None}
                    minDate={minDate || MIN_DATE}
                    maxDate={maxDate || MAX_DATE}
                    onChange={onChangeDate2}
                    value={date2}
                    format="MM/dd/yyyy"
                    placeholder={"mm/dd/yyyy"}
                    margin="none"
                    label="Date"
                    animateYearScrolling={true}
                    disableToolbar={true}
                    autoOk={true}
                    variant={"inline"}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            )}
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateFilter;
