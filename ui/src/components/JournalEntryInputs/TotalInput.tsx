import React from 'react';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import InputAdornment  from '@material-ui/core/InputAdornment';
import Skeleton from '@material-ui/lab/Skeleton';
import Fraction from 'fraction.js';

import {Rational} from '../../apollo/graphTypes';
import useJournalEntryUpsert from "./useJournalEntryUpsert";

export interface TotalInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  helperText?:boolean;
  variant?:"filled" | "outlined";
}

const TotalInput = function(props:TotalInputProps) {
  
  const {entryUpsertId, autoFocus = false, helperText = false,
    variant = 'filled'} = props;

  const {loading, error, upsert, update} = 
    useJournalEntryUpsert(entryUpsertId);
  
  if(loading){
    return <Skeleton variant="rect" height={56}/>;
  } else if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }
  
  const required = !(upsert?.fields?.id);
  const totalInput = upsert?.inputValues?.totalInput;

  const textFieldProps:TextFieldProps = {
    value: totalInput || "",
    variant,
    required,
    helperText:helperText ? 'Transaction Total' : undefined,
    // error:,
    label:"Total",
    name:"total",
    placeholder:"0.00",
    onChange:(event)=> {
      // Limit max number of decimal places
      const value = (event.target.value || "").trim().split('.')
        .map((val, i) => i === 0 ? val : val.substr(0,2)).join('.') ||  null;
      // Convert input to number.  Note: Cannot use parseFloat, need NaN falsy
      const parsedFloat = 1 * ((value || "") as any);
      let totalInput:string | null = null;
      let total:Rational | null = null;
      if(parsedFloat) {
        totalInput = value;
        const {n:num, d:den} = new Fraction(parsedFloat.toFixed(2));
        total = {num, den};
      }
      update.inputValues.totalInput(totalInput);
      update.fields.total(total);
    },
    inputProps:{
      min:"0",
      inputMode:"decimal",
    },
    InputProps:{
      type:"number",
      autoFocus,
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }
  }

  return <TextField {...textFieldProps} />;

}

export default TotalInput;