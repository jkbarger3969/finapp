import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {KeyboardDatePicker, KeyboardDatePickerProps, MuiPickersUtilsProvider
} from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import MomentUtils from '@date-io/moment';

import {Root} from "../../redux/reducers/root";
import {setDateValue, clearDateValue
} from "../../redux/actions/journalEntryUpsert";
import {getDate, isRequired } from "../../redux/selectors/journalEntryUpsert";

const inputProps = {
  inputMode:"numeric",
} as const;

export interface DateInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const DateInput = function(props:DateInputProps) {

  const {entryUpsertId, autoFocus = false, 
    variant:inputVariant = 'filled'} = props;
  
  const dispatch = useDispatch();
  
  const {date, required} = useSelector<Root, {
    date:Date | null, required:boolean}>((state) => ({
      date:getDate(state, entryUpsertId),
      required:isRequired(state, entryUpsertId)
    }), shallowEqual);
  
  const value = useMemo(()=> date ? moment(date) : null ,[date]);

  const onChange = useCallback((date:Moment | null) => {
      date?.isValid() ? dispatch(setDateValue(entryUpsertId, date.toDate())) 
        : dispatch(clearDateValue(entryUpsertId));
  }, [entryUpsertId, dispatch]);

  const dataPickerProps:KeyboardDatePickerProps = {
    required,
    animateYearScrolling:true,
    disableToolbar:true,
    disableFuture:true,
    inputVariant,
    variant:"inline",
    format:"MM/DD/YYYY",
    margin:"none",
    label:"Date",
    initialFocusedDate:value || moment(),
    value,
    onChange,
    autoOk:true,
    InputProps:useMemo(()=>({
      autoFocus
    }),[autoFocus]),
    inputProps,
    placeholder:'mm/dd/yyyy',
  };

  return <MuiPickersUtilsProvider utils={MomentUtils}>
    <KeyboardDatePicker {...dataPickerProps} />
  </MuiPickersUtilsProvider>;

}

export default DateInput;