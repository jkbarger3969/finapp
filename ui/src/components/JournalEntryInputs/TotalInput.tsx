import React, { useCallback, useMemo } from 'react';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import InputAdornment  from '@material-ui/core/InputAdornment';

import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setTotalInput, clearTotalInput, setTotalValue, clearTotalValue
} from "../../redux/actions/journalEntryUpsert";
import { getTotalInput, isRequired
} from "../../redux/selectors/journalEntryUpsert";
import { useSelector, shallowEqual } from 'react-redux';

const inputProps = {
  min:"0",
  inputMode:"decimal",
} as const;

interface SelectorResult {
  totalInput:string;
  required:boolean;
}

export interface TotalInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  helperText?:boolean;
  variant?:"filled" | "outlined";
}

const TotalInput = function(props:TotalInputProps) {
  
  const {entryUpsertId, autoFocus = false, helperText = false,
    variant = 'filled'} = props;
  
  const dispatch = useDebounceDispatch();

  const {totalInput, required} = useSelector<Root, SelectorResult>((state)=>({
    totalInput:getTotalInput(state, entryUpsertId),
    required:isRequired(state, entryUpsertId)
  }), shallowEqual);
  
  const onChange = useCallback((event)=> {
    const value = (event.target.value || "");
    if(value) { 
      dispatch(setTotalInput(entryUpsertId, value));
      dispatch(setTotalValue(entryUpsertId, value * 1));
    } else {
      dispatch(clearTotalInput(entryUpsertId));
      dispatch(clearTotalValue(entryUpsertId));
    }

  }, [dispatch]);

  const textFieldProps:TextFieldProps = {
    value: totalInput,
    variant,
    required,
    helperText:helperText ? 'Transaction Total' : undefined,
    // error:,
    label:"Total",
    name:"total",
    placeholder:"0.00",
    onChange,
    inputProps,
    InputProps:useMemo(() => ({
      type:"number",
      autoFocus,
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }),[autoFocus])
  }

  return <TextField {...textFieldProps} />;

}

export default TotalInput;