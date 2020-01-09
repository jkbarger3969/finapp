import React from 'react';
import {KeyboardDatePicker, KeyboardDatePickerProps, MuiPickersUtilsProvider}
  from '@material-ui/pickers';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import MomentUtils from '@date-io/moment';

import useJournalEntryUpsert from "./useJournalEntryUpsert";

export interface DateInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const DateInput = function(props:DateInputProps) {

  const {entryUpsertId, autoFocus = false, 
    variant:inputVariant = 'filled'} = props;
  
  const {loading, error, upsert , update} 
    = useJournalEntryUpsert(entryUpsertId);

  if(loading){
    return <Skeleton variant="rect" height={56} />;
  } else if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

  const required = !(upsert?.fields?.id);
  const date = upsert?.fields?.date;

  const value = date ? moment(date) : null;

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
    initialFocusedDate:value,
    value,
    onChange:(date) => update.fields.date(date?.toISOString() || null),
    autoOk:true,
    InputProps:{
      autoFocus
    },
    inputProps:{
      inputMode:"numeric",
    },
    placeholder:'mm/dd/yyyy',
    PopoverProps:{
      disablePortal:true
    },
  };

  return <MuiPickersUtilsProvider utils={MomentUtils}>
    <KeyboardDatePicker {...dataPickerProps} />
  </MuiPickersUtilsProvider>;

}

export default DateInput;