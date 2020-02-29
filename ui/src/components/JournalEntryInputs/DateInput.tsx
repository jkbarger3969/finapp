import React, { useMemo, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider
} from "@material-ui/pickers";
import moment, { Moment } from "moment";
import MomentUtils from "@date-io/moment";

import { Root } from "../../redux/reducers/root";
import {
  setDateValue,
  clearDateValue,
  validateDate
} from "../../redux/actions/journalEntryUpsert";
import {
  getDate,
  isRequired,
  getDateError,
  getType
} from "../../redux/selectors/journalEntryUpsert";

const inputProps = {
  inputMode: "numeric"
} as const;

interface SelectorResult {
  disabled: boolean;
  date: Date | null;
  required: boolean;
  hasError: boolean;
  errorMsg: string | null;
}

export interface DateInputProps {
  entryUpsertId: string;
  autoFocus?: boolean;
  variant?: "filled" | "outlined";
}

const DateInput = function(props: DateInputProps) {
  const {
    entryUpsertId,
    autoFocus = false,
    variant: inputVariant = "filled"
  } = props;

  const dispatch = useDispatch();

  // const [] = useField(props);

  const { disabled, date, required, hasError, errorMsg } = useSelector<
    Root,
    SelectorResult
  >(state => {
    const error = getDateError(state, entryUpsertId);

    return {
      disabled: getType(state, entryUpsertId) === null,
      date: getDate(state, entryUpsertId),
      required: isRequired(state, entryUpsertId),
      hasError: !!error,
      errorMsg: error?.message || null
    };
  }, shallowEqual);

  const value = useMemo(() => (date ? moment(date) : null), [date]);

  const validate = useCallback(() => {
    dispatch(validateDate(entryUpsertId));
  }, [entryUpsertId, dispatch]);

  const onChange = useCallback(
    (date: Moment | null) => {
      if (date?.isValid()) {
        dispatch(setDateValue(entryUpsertId, date.toDate()));
        if (hasError) {
          validate();
        }
      } else {
        dispatch(clearDateValue(entryUpsertId));
      }
    },
    [entryUpsertId, dispatch, hasError, validate]
  );

  const dataPickerProps: KeyboardDatePickerProps = {
    disabled,
    error: hasError,
    helperText: errorMsg,
    required,
    onBlur: validate as any,
    onClose: validate as any,
    animateYearScrolling: true,
    disableToolbar: true,
    disableFuture: true,
    inputVariant,
    variant: "inline",
    format: "MM/DD/YYYY",
    margin: "none",
    label: "Date",
    initialFocusedDate: value || moment(),
    value,
    onChange,
    autoOk: true,
    InputProps: useMemo(
      () => ({
        autoFocus
      }),
      [autoFocus]
    ),
    inputProps,
    placeholder: "mm/dd/yyyy"
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker {...dataPickerProps} />
    </MuiPickersUtilsProvider>
  );
};

export default DateInput;
