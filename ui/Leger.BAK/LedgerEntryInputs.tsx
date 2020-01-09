import React, {PureComponent, RefObject, useState, ChangeEvent, Fragment} from 'react';
import InputAdornment, {InputAdornmentProps} from '@material-ui/core/InputAdornment';
import ListItem, {ListItemProps} from '@material-ui/core/ListItem';
import ListItemText, {ListItemTextProps} from '@material-ui/core/ListItemText';
import ListItemIcon, {ListItemIconProps} from '@material-ui/core/ListItemIcon';
import Grid, {GridProps} from '@material-ui/core/Grid';
import {Person as PersonIcon, Business as BusinessIcon} from '@material-ui/icons';
import { AccountGroup } from 'mdi-material-ui'
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import Autocomplete, {AutocompleteProps, RenderInputParams} from '@material-ui/lab/Autocomplete'
import FormControl, {FormControlProps} from '@material-ui/core/FormControl';
import Select, {SelectProps} from '@material-ui/core/Select';
import InputLabel, {InputLabelProps} from '@material-ui/core/InputLabel';
import MenuItem, {MenuItemProps} from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import {KeyboardDatePicker, KeyboardDatePickerProps, MuiPickersUtilsProvider}
  from '@material-ui/pickers';
import ToggleButton, {ToggleButtonProps} from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup, {ToggleButtonGroupProps} from '@material-ui/lab/ToggleButtonGroup';
import { makeStyles, createStyles, Theme, withStyles } from '@material-ui/core/styles';
import moment, {Moment} from 'moment';
import MomentUtils from '@date-io/moment';
import {QueryResult} from '@apollo/react-common';
import {useQuery} from '@apollo/react-hooks';
import numeral from 'numeral';
import Fraction from 'fraction.js';
import {titleCase} from 'change-case';
import gql from 'graphql-tag';

import {Transaction, QueryDepartmentsArgs, LedgerEditEntryOptionsQuery, SearchTransSourceType,
  SearchTransactionSourceQuery, TransactionSource, SourceCellBusinessFragment,
  SourceCellDepartmentFragment, SourceCellPersonFragment} from '../../apollo/graphTypes';

const styles = makeStyles((theme:Theme) => createStyles({
  sourceToggle:{
    marginRight:theme.spacing(1)
  },
  sourceInput:{
    flexGrow:1
  },
  sourceInputPersonName:{
    flexGrow:1
  }
}));

interface LedgerInputProps {
  grabFocus:boolean;
  variant?:"standard" | "filled" | "outlined";
  helperText?:boolean;
  formId:string;
  transaction?:Transaction | null;
}

export interface TotalInputProps extends LedgerInputProps{
  textFieldProps?:Partial<TextFieldProps>
}
export const TotalInput = function({grabFocus, formId, transaction = null, 
  helperText = false, variant = "filled", textFieldProps:textFieldPropsPassed = {}
}:TotalInputProps) 
{

  let value:number | undefined;
  if(transaction !== null) {

    const {num:n, den:d} = transaction.total;
    const rational = new Fraction({n, d});
    value = Number.parseFloat(numeral(rational.toString()).format('0.00'));

  }

  const textFieldProps:TextFieldProps = {
    value,
    variant,
    required:true,
    helperText: helperText ? "Transaction Total" : null,
    // error:,
    label:"Total",
    name:"total",
    placeholder:"0.00",
    // value:value,
    // onChange:onChange,
    inputProps:{
      form:formId,
      min:"0",
      inputMode:"decimal",
      // onBlur:(event)=>{validateTotal(setValidation, event.target.value);}
    },
    InputProps:{
      autoFocus:grabFocus,
      type:"number",
      startAdornment: <InputAdornment position="start">$</InputAdornment>,
    },
    ...textFieldPropsPassed,
  }

  return <TextField {...textFieldProps} />;

}

export interface TransactionDateInputProps extends Omit<LedgerInputProps, "helperText"> {
  dataPickerProps?:Partial<KeyboardDatePickerProps>
}
export class TransactionDateInput extends PureComponent<TransactionDateInputProps> {

  input:RefObject<HTMLInputElement>;

  constructor(props:TransactionDateInputProps) {
    super(props);
    this.input = React.createRef();
  }

  componentDidMount() {
    if(this.props.grabFocus && this.input.current) {
      this.input.current.focus();
    }
  }

  render(){

    const {formId, transaction = null, variant:inputVariant = "filled",
      dataPickerProps:dataPickerPropsPassed = {}} = this.props;

    let inputValue = '';
    let value = moment();
    if(transaction !== null) {

      value = moment(transaction.transactionDate);
      inputValue = value.format('MM/DD/YYYY');

    }

    const dataPickerProps:KeyboardDatePickerProps = {
      animateYearScrolling:true,
      disableToolbar:true,
      inputVariant,
      inputValue,
      variant:"inline",
      format:"MM/DD/YYYY",
      margin:"normal",
      label:"Date",
      initialFocusedDate:value,
      value,
      // open:false,
      onChange:(event)=>{ console.log(event) },
      autoOk:true,
      inputProps:{
        form:formId,
        inputMode:"numeric",
        ref:this.input,
        // onBlur:(event)=>{validateTotal(setValidation, event.target.value);}
      },
      KeyboardButtonProps:{
        'aria-label': 'change date',
      },
      placeholder:'mm/dd/yyyy',
      ...dataPickerPropsPassed,
      PopoverProps:{
        disablePortal:true
      }
    };

    return <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker {...dataPickerProps} />
    </MuiPickersUtilsProvider>;

  }

}

export interface DepartmentInputProps extends LedgerInputProps {
  entryOpts:QueryResult<LedgerEditEntryOptionsQuery>;
  formControlProps?:Partial<FormControlProps>
}
export const DepartmentInput = Object.assign(function({grabFocus, formId, transaction = null, 
  entryOpts, helperText = false, variant = "filled",
  formControlProps:formControlPropsPassed = {}}:DepartmentInputProps) 
{

  let value:string | number = ''; 
  if(transaction !== null) {
    value = transaction.department.id;
  }

  const {loading, error, data} = entryOpts;
  const depts = loading || !data ? [] : (data.departments || []);
  
  const menuItems = loading ? <MenuItem>Loading...</MenuItem> : 
    depts.map(({id, name})=>{
      const menuItemProps:MenuItemProps = {
        value:id,
        key:id
      };
      return <MenuItem {...(menuItemProps as any)}>{titleCase(name)}</MenuItem>;
    });
  
  const formControlProps:FormControlProps = {
    variant,
    ...formControlPropsPassed
  }

  const selectProps:SelectProps = {
    autoFocus:grabFocus,
    children:menuItems,
    inputProps:{
      form:formId
    },
    MenuProps:{
      disablePortal:true
    },
    value
  };
  
  return <FormControl {...formControlProps}>
    <InputLabel>Department</InputLabel>
    <Select {...selectProps} />
    {helperText && <FormHelperText>Your Department</FormHelperText>}
  </FormControl>;

},{
  fragments:{
    department:gql`
      fragment DepartmentInputDepartment on Department {
        __typename
        id
        name
      }
    `
  }
});

export interface TransactionTypeInputProps extends LedgerInputProps {
  entryOpts:QueryResult<LedgerEditEntryOptionsQuery>;
  formControlProps?:Partial<FormControlProps>
}
export const TransactionTypeInput = Object.assign(function({grabFocus, formId, transaction = null,
  entryOpts, helperText = false, variant = "filled",
  formControlProps:formControlPropsPassed = {}}:TransactionTypeInputProps) 
{

  let value:string | number = ''; 
  if(transaction !== null) {
    value = transaction.type.id;
  }

  const {loading, error, data} = entryOpts;
  const transType = loading || !data ? [] : (data.transactionTypes || []);

  const menuItems = loading ? <MenuItem>Loading...</MenuItem> : 
    transType.map(({id, type})=>{
      const menuItemProps:MenuItemProps = {
        value:id,
        key:id
      };
      return <MenuItem {...(menuItemProps as any)}>{titleCase(type)}</MenuItem>;
    });

  const formControlProps:FormControlProps = {
    variant,
    ...formControlPropsPassed
  }
  
  const selectProps:SelectProps = {
    autoFocus:grabFocus,
    children:menuItems,
    inputProps:{
      form:formId
    },
    MenuProps:{
      disablePortal:true
    },
    value
  };

  return <FormControl {...formControlProps}>
    <InputLabel>Type</InputLabel>
    <Select {...selectProps}/>
    {helperText && <FormHelperText>Transaction Type</FormHelperText>}
  </FormControl>;

},{
  fragments:{
    type:gql`
      fragment TransactionTypeInputTransactionType on TransactionType {
        __typename
        id
        type
      }
    `
  }
});

export interface SourceInputProps  extends LedgerInputProps {
  textFieldProps?:Partial<TextFieldProps>
}
export const SourceInput = Object.assign(function({transaction, grabFocus, formId, helperText = false,
  variant = "filled", textFieldProps:textFieldPropsPassed = {}}:SourceInputProps) 
{

  const classes = styles();

  const {source} = transaction as NonNullable<Transaction> ;

  const [sourceType, setSourceType] 
    = useState<SearchTransSourceType>(source.__typename === 'Person' ?
      SearchTransSourceType.Person : SearchTransSourceType.Business);
  const [searchText, setSearchText] = useState('');
  const [value, setValue] = useState<SourceCellBusinessFragment | SourceCellDepartmentFragment
    | SourceCellPersonFragment | null>(null);


  const {loading, error, data} = useQuery<SearchTransactionSourceQuery>(
    SourceInput.queries.sourceSearch, {
      variables:{opts:{
        searchText
      }},
      skip:searchText.length === 0
    });

  const options = (!!data ? [...data.searchTransactionSource] : []) as 
    NonNullable<SearchTransactionSourceQuery['searchTransactionSource']>;
  
  const label = sourceType === SearchTransSourceType.Business ? `Business Name` : `Person's Name`;
  const placeholder = sourceType === SearchTransSourceType.Business ? 
    `ACME Inc...` : 'John Smith...';
    
  const textFieldProps:TextFieldProps = {
    fullWidth:true,
    variant,
    required:true,
    // error:,
    helperText:helperText ? "Who is this transaction from?" : null,
    label,
    name:"source",
    placeholder,
    inputProps:{
      form:formId
    },
    InputProps:{
      autoFocus:grabFocus
    },
    ...textFieldPropsPassed
  };

  const autocompleteProps:AutocompleteProps = {
    debug:true,
    autoComplete:true,
    disablePortal:true,
    style:{width:'100%'},
    loading:loading && searchText.length === 0,
    options,
    value,
    filterOptions:(options, state)=> options,
    renderOption:(option:SourceCellBusinessFragment | SourceCellDepartmentFragment
      | SourceCellPersonFragment) => 
    {

      let name:string = '';
      let icon:any;

      switch(option.__typename) {
        case "Person":
          name = `${option.name.first} ${option.name.last}`;
          icon = <PersonIcon />;
          break;
        case "Department":
          name =  option.deptName;
          icon = <AccountGroup />;
          break;
        case "Business":
          name =  option.bizName;
          icon = <BusinessIcon />;
          break;
      }

      return <ListItem ContainerComponent="div">
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText>{name}</ListItemText>
      </ListItem>;

    },
    renderInput:(params:RenderInputParams) => {
      return <TextField {...{...textFieldProps, ...params}} />;
    },
    onInputChange:(event:ChangeEvent<{}>, value:string) => {
      setSearchText(value.trim())
    },
    onChange:(event:any, value:SourceCellBusinessFragment | SourceCellDepartmentFragment
      | SourceCellPersonFragment) => 
    {
      setValue(value);
    }
  };

  const toggleButtonGroupProps:ToggleButtonGroupProps = {
    className:classes.sourceToggle,
    size:"small",
    exclusive:true,
    onChange:(event:any, value:SearchTransSourceType) => {
      if(value !== null) {
        setSourceType(value);
      }
    },
    value:sourceType
  };

  const gridPropsContainer:GridProps = {
    container:true,
  };
  
  const gridPropsItem:GridProps = {
    item:true,
  };

  return <Grid container alignItems="center">
    <Grid item>
      <ToggleButtonGroup {...toggleButtonGroupProps}>
        <ToggleButton value={SearchTransSourceType.Business}>
          <BusinessIcon />
        </ToggleButton>
        <ToggleButton value={SearchTransSourceType.Person}>
          <PersonIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Grid>
    <Grid item className={classes.sourceInput}>
      <Autocomplete {...autocompleteProps} />
    </Grid>
  </Grid>;

  // return <TextField {...textFieldProps} />;

},{
  queries:{
    sourceSearch:gql`
      query SearchTransactionSource($opts:SearchTransSourceOptsInput!) {
        searchTransactionSource(opts:$opts) {
          __typename
          ... on Person {
            id
            __typename
            name {
              first
              last
            }
          }
          ... on Business {
            id
            __typename
            bizName: name
          }
          ... on Department {
            id
            __typename
            deptName: name
          }
        }
      }
    `
  }
});

/* export interface SourceInputPerson = {
  currentValue:PersonFrag
};

export const SourceInputPerson = Object.assign(function(props:any){

  const [firstName, setFirstName] = useQuery('');

},{}); */

/* export class SourceInputComp extends PureComponent<SourceInputProps & {
  classes:ReturnType<typeof styles>}> 
{

  static readonly queries = {
    sourceSearch:gql`
      query SearchTransactionSource($opts:SearchTransSourceOptsInput!) {
        searchTransactionSource(opts:$opts) {
          __typename
          ... on Person {
            id
            __typename
            name {
              first
              last
            }
          }
          ... on Business {
            id
            __typename
            bizName: name
          }
          ... on Department {
            id
            __typename
            deptName: name
          }
        }
      }
    `
  }



  render() {

    const {classes, transaction, grabFocus, formId, helperText = false,
      variant = "filled", textFieldProps:textFieldPropsPassed = {}} = this.props;

    const {source} = transaction as NonNullable<Transaction> ;

    const [sourceType, setSourceType] 
      = useState<SearchTransSourceType>(source.__typename === 'Person' ?
        SearchTransSourceType.Person : SearchTransSourceType.Business);
    const [searchText, setSearchText] = useState('');
    const [value, setValue] = useState<SourceCellBusinessFragment | SourceCellDepartmentFragment
      | SourceCellPersonFragment | null>(null);


    const {loading, error, data} = useQuery<SearchTransactionSourceQuery>(
      SourceInput.queries.sourceSearch, {
        variables:{opts:{
          searchText
        }},
        skip:searchText.length === 0
      });

    const options = (!!data ? [...data.searchTransactionSource] : []) as 
      NonNullable<SearchTransactionSourceQuery['searchTransactionSource']>;
    
    const label = sourceType === SearchTransSourceType.Business ? `Business Name` : `Person's Name`;
    const placeholder = sourceType === SearchTransSourceType.Business ? 
      `ACME Inc...` : 'John Smith...';
      
    const textFieldProps:TextFieldProps = {
      fullWidth:true,
      variant,
      required:true,
      // error:,
      helperText:helperText ? "Who is this transaction from?" : null,
      label,
      name:"source",
      placeholder,
      inputProps:{
        form:formId
      },
      InputProps:{
        autoFocus:grabFocus
      },
      ...textFieldPropsPassed
    };

    const autocompleteProps:AutocompleteProps = {
      debug:true,
      autoComplete:true,
      disablePortal:true,
      style:{width:'100%'},
      loading:loading && searchText.length === 0,
      options,
      value,
      filterOptions:(options, state)=> options,
      renderOption:(option:SourceCellBusinessFragment | SourceCellDepartmentFragment
        | SourceCellPersonFragment) => 
      {

        let name:string = '';
        let icon:any;

        switch(option.__typename) {
          case "Person":
            name = `${option.name.first} ${option.name.last}`;
            icon = <PersonIcon />;
            break;
          case "Department":
            name =  option.deptName;
            icon = <AccountGroup />;
            break;
          case "Business":
            name =  option.bizName;
            icon = <BusinessIcon />;
            break;
        }

        return <ListItem ContainerComponent="div">
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText>{name}</ListItemText>
        </ListItem>;

      },
      renderInput:(params:RenderInputParams) => {
        return <TextField {...{...textFieldProps, ...params}} />;
      },
      onInputChange:(event:ChangeEvent<{}>, value:string) => {
        setSearchText(value.trim())
      },
      onChange:(event:any, value:SourceCellBusinessFragment | SourceCellDepartmentFragment
        | SourceCellPersonFragment) => 
      {
        setValue(value);
      }
    };

    const toggleButtonGroupProps:ToggleButtonGroupProps = {
      className:classes.sourceToggle,
      size:"small",
      exclusive:true,
      onChange:(event:any, value:SearchTransSourceType) => {
        if(value !== null) {
          setSourceType(value);
        }
      },
      value:sourceType
    };

    const gridPropsContainer:GridProps = {
      container:true,
    };
    
    const gridPropsItem:GridProps = {
      item:true,
    };

    return <Grid container alignItems="center">
      <Grid item>
        <ToggleButtonGroup {...toggleButtonGroupProps}>
          <ToggleButton value={SearchTransSourceType.Business}>
            <BusinessIcon />
          </ToggleButton>
          <ToggleButton value={SearchTransSourceType.Person}>
            <PersonIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid item className={classes.sourceInput}>
        <Autocomplete {...autocompleteProps} />
      </Grid>
    </Grid>;

    // return <TextField {...textFieldProps} />;



  }

}

export const SourceInput = withStyles(styles, SourceInputComp); */

export interface PaymentMethodInputProps extends LedgerInputProps {
  entryOpts:QueryResult<LedgerEditEntryOptionsQuery>;
  formControlProps?:Partial<FormControlProps>
}
export const PaymentMethodInput = Object.assign(function({grabFocus, formId, transaction = null, 
  entryOpts, helperText = false, variant = "filled",
  formControlProps:formControlPropsPassed = {}}:PaymentMethodInputProps) 
{

  let value:string | number = ''; 
  if(transaction !== null) {
    value = transaction.paymentMethod.id;
  }

  const {loading, error, data} = entryOpts;
  const payMethods = loading || !data ? [] : (data.paymentMethods || []);

  const menuItems = loading ? <MenuItem>Loading...</MenuItem> : 
  payMethods.map(({id, method})=>{
      const menuItemProps:MenuItemProps = {
        value:id,
        key:id
      };
      return <MenuItem {...(menuItemProps as any)}>{titleCase(method)}</MenuItem>;
    });
  
  const formControlProps:FormControlProps = {
    variant,
    ...formControlPropsPassed
  }

  const selectProps:SelectProps = {
    autoFocus:grabFocus,
    children:menuItems,
    inputProps:{
      form:formId
    },
    MenuProps:{
      disablePortal:true
    },
    value
  };

  return <FormControl {...formControlProps}>
    <InputLabel>Method</InputLabel>
    <Select {...selectProps} />
    {helperText && <FormHelperText>Payment Method</FormHelperText>}
  </FormControl>;

},{
  fragments:{
    type:gql`
      fragment PaymentMethodInputPaymentMethod on PaymentMethod {
        __typename
        id
        method
      }
    `
  }
});