import React, {useState, ChangeEvent, FocusEvent} from 'react';
import {Dialog, DialogActions, DialogTitle, DialogContent, Fab, Button, TextField,
  InputAdornment} from '@material-ui/core/';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import {Add} from '@material-ui/icons/';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import numeral from 'numeral';

import LedgerAddEntryForm from './LedgerAddEntryForm';

const styles = makeStyles((theme)=> {
  // console.log(theme);
  return createStyles({
    fab: {
      position: 'fixed',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    }
  });
});

enum AmountValidation {
  VALID,
  REQUIRED,
  NAN,
  ZERO
}

const AMOUNT_REGEX = /([0-9]+)?(\.)?([0-9]{1,2})?/;
const COMMA = /,/g;

const validateAmount = function(setValidation:(validStatus:AmountValidation) => void,
  amount:string):boolean
{

  amount = amount.trim();

  if(amount === '') {
    
    setValidation(AmountValidation.REQUIRED);
    return false;

  }

  const num = numeral(amount);
  const numVal = num.value();
  
  if(numVal === null) {

    setValidation(AmountValidation.NAN);
    return false;
  
  } else if (numVal === 0) {
    
    setValidation(AmountValidation.ZERO);
    return false;
  
  }

  return true;

}

const Amount = function() {

  const [value, setValue] = useState('');
  const [validation, setValidation] = useState(AmountValidation.VALID);

  const onChange = (event:ChangeEvent<HTMLInputElement>) => {

    let value = event.target.value.trim().replace(COMMA,"");

    if(value.length === 0) {
      setValue('');
      setValidation(AmountValidation.REQUIRED);
      return;
    
    }
    
    const match = AMOUNT_REGEX.exec(value);
    
    const [,whole = "", period = "", decimal = ""] = match || [];

    if(whole === "" && period === "" && decimal === "") {

      setValue('');
      setValidation(AmountValidation.NAN);
      return;
    
    }

    if(whole === "") {

      setValue(`${period}${decimal}`);
      setValidation(AmountValidation.VALID);
      return;
    
    }

    setValue(`${numeral(whole).format('0,0')}${period}${decimal}`);
    setValidation(AmountValidation.VALID);

  }

  let helperText = '';
  switch(validation) {
    case AmountValidation.VALID:
      break;
    case AmountValidation.NAN:
      helperText = "Number Only";
      break;
    case AmountValidation.REQUIRED:
      helperText = "Required";
      break;
    case AmountValidation.ZERO:
      helperText = "Must be greater than zero."
      break;
  }

  return <TextField 
    required
    error={validation !== AmountValidation.VALID}
    helperText={helperText}
    label="Amount"
    name="amount"
    placeholder="0.00"
    value={value}
    onChange={onChange}
    inputProps={{
      onBlur:(event)=>{validateAmount(setValidation, event.target.value);}
    }}
    InputProps={{
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }}
  />

}

const LedgerAddEntryFormB = function(props:any) {


  return <form onSubmit={event => {console.log(event.target); event.preventDefault();}}>
      <Amount />
  </form>

}

const LedgerAddEntryDialog = function(props:{
  open:boolean, close:()=>void})
{

  const {open, close} = props;

  return <Dialog 
    maxWidth="xl"
    open={open}
    onEscapeKeyDown={close}
    onBackdropClick={close}
  >
    <DialogTitle>Add Transaction</DialogTitle>
    <DialogContent dividers>
      <LedgerAddEntryForm />
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>Add</Button>
      <Button onClick={close}>Cancel</Button>
    </DialogActions>
  </Dialog>

}

export default function LedgerAddEntry() {

  const classes = styles();

  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return <Fab 
    size="large"
    color="secondary"
    aria-label="add transaction"
    className={classes.fab}
    onClick={()=>open ? null : setOpen(true)}
  >
    <Add />
    <LedgerAddEntryDialog open={open} close={close}/>
  </Fab>

}