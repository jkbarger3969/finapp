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
import Fraction from "fraction.js";

enum Op {
  None = 1,
  Equal,
  GreaterThan,
  LessThan,
  GreaterThanOrEqual,
  LessThanOrEqual,
}

const op2ValidOptions = (
  total1: Fraction | null,
  op1: Op
): [Fraction | undefined, Fraction | undefined, Op[]] => {
  if (!total1) {
    return [undefined, undefined, [Op.None]];
  }

  switch (op1) {
    case Op.None:
    case Op.Equal:
      return [undefined, undefined, [Op.None]];
    case Op.GreaterThan:
    case Op.GreaterThanOrEqual:
      return [
        total1.add(new Fraction({ n: 1, d: 100 })),
        undefined,
        [Op.None, Op.LessThan, Op.LessThanOrEqual],
      ];
    case Op.LessThan:
    case Op.LessThanOrEqual:
      return [
        undefined,
        total1.sub(new Fraction({ n: 1, d: 100 })),
        [Op.None, Op.GreaterThan, Op.GreaterThanOrEqual],
      ];
  }
};

const TotalInputProps = {
  type: "number",
  startAdornment: <InputAdornment position="start">$</InputAdornment>,
} as const;

const Total = (props: { setFilter: (filter) => void }) => {
  const { setFilter: setFilterCb } = props;

  const [value, setValue] = useState("");

  const [op1, setOp1] = useState(Op.Equal);
  const [total1, setTotal1] = useState<string>("");

  const [op2, setOp2] = useState(Op.None);
  const [total2, setTotal2] = useState<string>("");

  const [minTotal, maxTotal, validOp2s] = useMemo(
    () => op2ValidOptions(total1 ? new Fraction(total1) : null, op1),
    [total1, op1]
  );

  const inputProps = useMemo(
    () => ({
      min: minTotal ? minTotal.toString() : "0.00",
      max: maxTotal ? maxTotal.toString() : undefined,
      step: "0.01",
    }),
    [minTotal, maxTotal]
  );

  const setFilter = useCallback(
    (queries: { op: Op; total: number }[]) => {
      if (queries.length === 0) {
        setValue("");
        setFilterCb({});
        return;
      }

      const $and: object[] = [];

      const values: string[] = [];

      for (const { op, total } of queries) {
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
          total: { [mongoOp]: total },
        });

        values.push(`${opSym}[${total}]`);
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

      // If op2 is no longer valid given op1, clear op2 and total2
      const [, , validOps] = op2ValidOptions(
        total1 ? new Fraction(total1) : null,
        op
      );
      const op2Valid = validOps.includes(op2);
      if (!op2Valid) {
        setOp2(Op.None);
        setTotal2("");
      }

      // If total1 is set update filters
      if (total1) {
        const total1Fraction = new Fraction(total1);

        const filters = [
          {
            op,
            total: total1Fraction.valueOf(),
          },
        ];

        // Include op2 if exists and valid
        if (op2Valid && op2 !== Op.None && op2 !== Op.Equal && total2) {
          const total2Fraction = new Fraction(total2);

          filters.push({
            op: op2,
            total: total2Fraction.valueOf(),
          });
        }

        setFilter(filters);
      }
    },
    [total1, total2, op2, setFilter]
  );

  const onChangeOp2 = useCallback<NonNullable<SelectProps["onChange"]>>(
    (event) => {
      const op = (event.target.value ?? Op.None) as Op;
      setOp2(op);
      // If op2 is set to non clear total2 and update filter
      if (op === Op.None) {
        setTotal2("");
        if (total1) {
          const total1Fraction = new Fraction(total1);

          setFilter([
            {
              op: op1,
              total: total1Fraction.valueOf(),
            },
          ]);
        } else {
          setFilter([]);
        }
      } else if (total2) {
        const total1Fraction = new Fraction(total1);
        const total2Fraction = new Fraction(total2);

        setFilter([
          {
            op: op1,
            total: total1Fraction.valueOf(),
          },
          {
            op,
            total: total2Fraction.valueOf(),
          },
        ]);
      }
    },
    [total1, total2, op1, setFilter]
  );

  const onChangeTotal1 = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      const value = event.target.value.trim();

      if (value) {
        const total = new Fraction(value).round(2);

        setValue(total.toString());

        setTotal1(value);

        const filters = [
          {
            op: op1,
            total: total.valueOf(),
          },
        ];

        // If total2 insure is still valid
        if (total2) {
          const [minTotal, maxTotal] = op2ValidOptions(total, op1);

          const total2Faction = new Fraction(total2);

          if (
            (op2 !== Op.None &&
              op2 !== Op.Equal &&
              minTotal &&
              total2Faction.compare(minTotal) >= 0) ||
            (maxTotal && total2Faction.compare(maxTotal) <= 0)
          ) {
            filters.push({
              op: op2,
              total: total2Faction.valueOf(),
            });
          } else {
            // Clear total2 if no longer valid
            setOp2(Op.None);
            setTotal2("");
          }
        }

        setFilter(filters);
      } else {
        setValue(value);

        setFilter([]); // Clear filters
        // Clear op2 and total2
        setOp2(Op.None);
        setTotal2("");
      }
    },
    [op1, total2, setFilter, op2]
  );

  const onChangeTotal2 = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (event) => {
      const value = event.target.value.trim();

      if (value) {
        const total1Faction = new Fraction(total1);

        const total = new Fraction(value).round(2);

        setTotal2(value);

        setFilter([
          { op: op1, total: total1Faction.valueOf() },
          { op: op2, total: total.valueOf() },
        ]);
      } else {
        if (total1) {
          const total1Faction = new Fraction(total1);
          setFilter([{ op: op1, total: total1Faction.valueOf() }]);
        } else {
          setFilter([]);
        }

        // Clear filters
        // Clear total2
        setTotal2("");
      }
    },
    [total1, op1, op2, setFilter]
  );

  const onClickClear = useCallback<NonNullable<IconButtonProps["onClick"]>>(
    (event) => {
      event.stopPropagation();
      setOp1(Op.Equal);
      setTotal1("");
      setOp2(Op.None);
      setTotal2("");
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
      endAdornment: total1 ? (
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
    [total1, onClickClear]
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
              <Box marginTop={2}>
                <TextField
                  placeholder="0.00"
                  label="Total"
                  type="number"
                  inputProps={inputProps}
                  InputProps={TotalInputProps}
                  value={total1}
                  onChange={onChangeTotal1}
                />
              </Box>
            </Grid>
            {!!total1 && op1 !== Op.Equal && (
              <Grid xs={12} item>
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
                <Box marginTop={2}>
                  <TextField
                    disabled={op2 === Op.None}
                    placeholder="0.00"
                    label="Total"
                    type="number"
                    inputProps={inputProps}
                    InputProps={TotalInputProps}
                    value={total2}
                    onChange={onChangeTotal2}
                  />
                </Box>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disabled={op2 === Op.None}
                    minDate={minDate || MIN_DATE}
                    maxDate={maxDate || MAX_DATE}
                    onChange={onChangeTotal2}
                    value={total2}
                    format="MM/dd/yyyy"
                    placeholder={"mm/dd/yyyy"}
                    margin="none"
                    label="Date"
                    animateYearScrolling={true}
                    disableToolbar={true}
                    autoOk={true}
                    variant={"inline"}
                  />
                </MuiPickersUtilsProvider> */}
              </Grid>
            )}
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
};

export default Total;
