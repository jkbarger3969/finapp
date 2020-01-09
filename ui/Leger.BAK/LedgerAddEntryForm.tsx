import React, {PureComponent} from 'react';
import InputAdornment, {InputAdornmentProps} from '@material-ui/core/InputAdornment';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import Grid, {GridProps} from '@material-ui/core/Grid';
import Hidden, {HiddenProps} from '@material-ui/core/Hidden';
import FormControl, {FormControlProps} from '@material-ui/core/FormControl';
import Select, {SelectProps} from '@material-ui/core/Select';
import InputLabel, {InputLabelProps} from '@material-ui/core/InputLabel';
import MenuItem, {MenuItemProps} from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import {KeyboardDatePicker, KeyboardDatePickerProps, MuiPickersUtilsProvider}
  from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => createStyles({
  formControl: {
    marginTop:0,
    marginBottom: theme.spacing(1),
    width: '100%',
  }
}));

const Total = function(props:any) {

  const classes = useStyles();

  const textFieldProps:TextFieldProps = {
    className:classes.formControl,
    variant:"filled",
    required:true,
    // error:,
    helperText:"Transaction Total",
    label:"Total",
    name:"total",
    placeholder:"0.00",
    // value:value,
    // onChange:onChange,
    inputProps:{
      min:"0",
      inputmode:"decimal"
      // onBlur:(event)=>{validateTotal(setValidation, event.target.value);}
    },
    InputProps:{
      type:"number",
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    }
  }

  return <TextField {...textFieldProps} />;

}

const TransactionDate = function(props:any) {

  const classes = useStyles();

  const dataPickerProps:KeyboardDatePickerProps = {
    className:classes.formControl,
    disableToolbar:true,
    inputVariant:"filled",
    variant:"inline",
    format:"MM/dd/yyyy",
    margin:"normal",
    label:"Date",
    value:null,
    onChange:(event)=>{ console.log(event) },
    inputProps:{
      inputmode:"numeric"
      // onBlur:(event)=>{validateTotal(setValidation, event.target.value);}
    },
    KeyboardButtonProps:{
      'aria-label': 'change date',
    },
    placeholder:'mm/dd/yyyy'
  };

  return <MuiPickersUtilsProvider utils={MomentUtils}>
    <KeyboardDatePicker {...dataPickerProps} />
  </MuiPickersUtilsProvider>;

}

const Department = function(props:any) {

  const classes = useStyles();

  return <FormControl variant="filled" className={classes.formControl}>
    <InputLabel>Department</InputLabel>
    <Select>
      <MenuItem>Payroll</MenuItem>
      <MenuItem>Children's Ministry</MenuItem>
      <MenuItem>Production</MenuItem>
    </Select>
    <FormHelperText>Your Department</FormHelperText>
  </FormControl>;

}

const TransactionType = function(props:any) {

  const classes = useStyles();

  // const selectProps:SelectProps = {
    
  // }

  return <FormControl variant="filled" className={classes.formControl}>
    <InputLabel>Type</InputLabel>
    <Select>
      <MenuItem>Income</MenuItem>
      <MenuItem>Expense</MenuItem>
    </Select>
    <FormHelperText>Transaction Type</FormHelperText>
  </FormControl>;

}

const Source = function(props:any) {

  const classes = useStyles();

  const textFieldProps:TextFieldProps = {
    className:classes.formControl,
    variant:"filled",
    required:true,
    // error:,
    helperText:"Who is this transaction from?",
    label:"Source",
    name:"source",
    placeholder:"Acme Inc., John Doe...",
    // value:value,
    // onChange:onChange,
    // inputProps:{
    //   // onBlur:(event)=>{validateTotal(setValidation, event.target.value);}
    // },
  }

  return <TextField {...textFieldProps} />;

}

const PaymentMethod = function(props:any) {

  const classes = useStyles();

  // const selectProps:SelectProps = {
    
  // }

  return <FormControl variant="filled" className={classes.formControl}>
    <InputLabel>Method</InputLabel>
    <Select>
      <MenuItem>Check</MenuItem>
      <MenuItem>Credit</MenuItem>
      <MenuItem>Cash</MenuItem>
    </Select>
    <FormHelperText>Payment Method</FormHelperText>
  </FormControl>;

}

const AlignmentGridItem = function(){
  return <Hidden mdDown>
    <Grid item/>
  </Hidden>;
}

const LedgerAddEntryForm = function(props:any) {

    const gridContainerProps:GridProps = {
      container:true,
      direction:"row",
      justify:"center",
      alignItems:"flex-start",
      spacing:1
    }

    const gridItemProps:GridProps = {
      item:true,
      xs:12,
      sm:6
    }

  return <form>
        <Grid {...gridContainerProps}>
          <AlignmentGridItem />
          <Grid 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            item
            children={<TransactionDate />}
          />
          <Grid 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            item
            children={<Department />}
          />
          <Grid 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            item
            children={<TransactionType />}
          />
          <AlignmentGridItem />
          <AlignmentGridItem />
          <Grid 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            item
            children={<Source />}
          />
          <Grid 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            item
            children={<PaymentMethod />}
          />
          <Grid 
            xs={12}
            sm={6}
            md={4}
            lg={3}
            item
            children={<Total />}
          />
          <AlignmentGridItem />
        </Grid>
    </form>;

}

export default LedgerAddEntryForm;