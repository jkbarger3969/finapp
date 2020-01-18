import React, { useCallback, useMemo } from 'react';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import InputAdornment  from '@material-ui/core/InputAdornment';

import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setTotalInput, clearTotalInput, setTotalValue, clearTotalValue,
  validateTotal
} from "../../redux/actions/journalEntryUpsert";
import { getTotalInput, isRequired, getTotalError
} from "../../redux/selectors/journalEntryUpsert";
import { useSelector, shallowEqual } from 'react-redux';

const inputProps = {
  min:"0",
  inputMode:"decimal",
} as const;

interface SelectorResult {
  totalInput:string;
  required:boolean;
  hasError:boolean;
  errorMsg:string | null;
}

export interface TotalInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const TotalInput = function(props:TotalInputProps) {
  
  const {entryUpsertId, autoFocus = false, variant = 'filled'} = props;
  
  const dispatch = useDebounceDispatch();

  const {totalInput, required, hasError, errorMsg
  } = useSelector<Root, SelectorResult>((state)=>{
    
    const error = getTotalError(state, entryUpsertId);

    return {
      totalInput:getTotalInput(state, entryUpsertId),
      required:isRequired(state, entryUpsertId),
      hasError:!!error,
      errorMsg:error?.message || null
    };
  }, shallowEqual);
  
  const validate  = useCallback(() => {
    dispatch(validateTotal(entryUpsertId))
  },[dispatch, entryUpsertId]);
  
  const onChange = useCallback((event)=> {
    const value = (event.target.value || "");
    if(value) { 
      dispatch(setTotalInput(entryUpsertId, value));
      dispatch(setTotalValue(entryUpsertId, value * 1));
      if(hasError) {
        validate();
      }
    } else {
      dispatch(clearTotalInput(entryUpsertId));
      dispatch(clearTotalValue(entryUpsertId));
    }

  }, [dispatch, validate, hasError, entryUpsertId]);

  const textFieldProps:TextFieldProps = {
    value: totalInput,
    variant,
    required,
    helperText:errorMsg,
    // error:,
    label:"Total",
    name:"total",
    placeholder:"0.00",
    onChange,
    inputProps,
    error:hasError,
    InputProps:useMemo(() => ({
      type:"number",
      autoFocus,
      onBlur:validate as any,
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }),[autoFocus, validate, errorMsg]),
  }

  return <TextField {...textFieldProps} />;

}

export default TotalInput;