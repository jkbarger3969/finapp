import React, {useState, KeyboardEvent} from 'react';
import TableCell, {TableCellProps} from '@material-ui/core/TableCell';
import {Person as PersonIcon, Business as BusinessIcon, Person} from '@material-ui/icons';
import { AccountGroup as DepartmentIcon } from 'mdi-material-ui';
import Grid, {GridProps} from '@material-ui/core/Grid';
import {titleCase} from 'change-case';
import numeral from 'numeral';
import Fraction from 'fraction.js';
import {red, green} from '@material-ui/core/colors/';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import {useQuery, QueryResult} from 'react-apollo';
import gql from 'graphql-tag';

import {Transaction, Rational, LedgerEditEntryOptionsQuery,
  SourceCellBusinessFragment, SourceCellDepartmentFragment, SourceCellPersonFragment
  } from '../../apollo/graphTypes';
import {TotalInput, TotalInputProps, TransactionDateInputProps, TransactionDateInput, 
  TransactionTypeInput, TransactionTypeInputProps, DepartmentInputProps, DepartmentInput,
  SourceInputProps, SourceInput, PaymentMethodInput, PaymentMethodInputProps
  } from './LedgerEntryInputs';

const styles = makeStyles((theme:Theme) => createStyles({
  sourceIcon:{
    paddingRight:theme.spacing(2), // Right only, bc is left most elm and TableCell handles left
  },
  sourceCell:{
    paddingTop:theme.spacing(2) - 5,
    paddingBottom:theme.spacing(2) - 5,
  },
  sourceCellEdit:{
    paddingTop:theme.spacing(0.25),
    paddingBottom:theme.spacing(0.25),
    paddingLeft:theme.spacing(0.75),
  }
}));

export interface LedgerEntryCellProps {
  edit:boolean;
  setEdit:(edit:boolean)=>void;
  formId:string;
  transaction:Transaction;
  tableCellProps:TableCellProps;
}

export interface LedgerEntryCellPropsWOpts extends LedgerEntryCellProps{
  entryOpts:QueryResult<LedgerEditEntryOptionsQuery>;
}

const wireUpEditActions = function(args:{
    edit:boolean;
    grabFocus:boolean;
    hasFocus:boolean;
    setEdit:(edit:boolean)=>void;
    setGrabFocus:(grabFocus:boolean)=>void;
    setFocus:(setFocus:boolean)=>void;
  })
{

  const {edit, hasFocus, setEdit, setGrabFocus, setFocus} = args;

  return {
    onDoubleClick:()=>{
      setGrabFocus(true);
      setEdit(true);
    },
    onFocus:()=>setFocus(true),
    onBlur:()=>setFocus(false),
    onKeyUp:(event:KeyboardEvent<HTMLTableCellElement>)=>{
      switch(event.keyCode) {
        case 13:
          if(!edit && hasFocus) {
            setGrabFocus(true);
            setEdit(true);
            event.preventDefault();
          }
          break;
        case 27:
          if(edit) {
            setGrabFocus(false);
            setEdit(false);
            event.preventDefault();
          }
          break;
      }
    }
  }

}

export const TransactionDateCell = Object.assign(function({setEdit, edit, formId, transaction,
  tableCellProps}:LedgerEntryCellProps)
{

  const [hasFocus, setFocus] = useState(false);
  const [grabFocus, setGrabFocus] = useState(false);

  // Necessary when click away triggers edit reset
  if(grabFocus && !edit) {
    setGrabFocus(false);
  }

  const {transactionDate} = transaction;

  const tansDateInputProps:TransactionDateInputProps = {
    grabFocus,
    transaction,
    formId,
    variant:"standard",
    dataPickerProps:{
      margin:"none"
    }
  };

  tableCellProps = {
    ...tableCellProps,
    ...wireUpEditActions({
      edit,
      grabFocus,
      hasFocus,
      setEdit,
      setGrabFocus,
      setFocus
    })
  };

  return <TableCell {...tableCellProps}>{edit ?
    <TransactionDateInput {...tansDateInputProps} />
    :
    moment(transactionDate).format('MMM DD, YYYY')
  }</TableCell>;

},{
  fragments:{}
});


export const DepartmentCell = Object.assign(function({edit, setEdit, formId, transaction,
  tableCellProps, entryOpts}:LedgerEntryCellPropsWOpts)
{

  const [hasFocus, setFocus] = useState(false);
  const [grabFocus, setGrabFocus] = useState(false);
  
  // Necessary when click away triggers edit reset
  if(grabFocus && !edit) {
    setGrabFocus(false);
  }

  const {department} = transaction;

  const deptInputProps:DepartmentInputProps = {
    grabFocus,
    entryOpts,
    transaction,
    formId,
    variant:"standard"
  };

  tableCellProps = {
    ...tableCellProps,
    ...wireUpEditActions({
      edit,
      grabFocus,
      hasFocus,
      setEdit,
      setGrabFocus,
      setFocus
    })
  };

  return <TableCell {...tableCellProps}>{edit ?
    <DepartmentInput {...deptInputProps} />
    :
    titleCase(department.name)
  }</TableCell>;

},{
  fragments:{
    department:gql`
      fragment DepartmentCellDepartment on Department {
        __typename
        id
        name
      }
    `,
  }
});

export const TransactionTypeCell = Object.assign(function({edit, setEdit, formId, transaction,
  tableCellProps,entryOpts}:LedgerEntryCellPropsWOpts)
{

  const [hasFocus, setFocus] = useState(false);
  const [grabFocus, setGrabFocus] = useState(false);
  
  // Necessary when click away triggers edit reset
  if(grabFocus && !edit) {
    setGrabFocus(false);
  }


  const {type} = transaction;

  const typeInputProps:TransactionTypeInputProps = {
    grabFocus,
    entryOpts,
    transaction,
    formId,
    variant:"standard"
  };

  tableCellProps = {
    ...tableCellProps,
    ...wireUpEditActions({
      edit,
      grabFocus,
      hasFocus,
      setEdit,
      setGrabFocus,
      setFocus
    })
  };

  return <TableCell {...tableCellProps}>{edit ?
    <TransactionTypeInput {...typeInputProps} />
    :
    titleCase(type.type)
  }</TableCell>;

},{
  fragments:{
    type:gql`
      fragment TransactionTypeCellTransactionType on TransactionType {
        __typename
        id
        type
        rootType {
          type
        }
      }
    `
  }
});

export const PaymentMethodCell = Object.assign(function({edit, setEdit, formId, transaction,
  tableCellProps, entryOpts}:LedgerEntryCellPropsWOpts)
{

  const [hasFocus, setFocus] = useState(false);
  const [grabFocus, setGrabFocus] = useState(false);
  
  // Necessary when click away triggers edit reset
  if(grabFocus && !edit) {
    setGrabFocus(false);
  }


  const {paymentMethod} = transaction;

  const payMethodInputProps:PaymentMethodInputProps = {
    grabFocus,
    entryOpts,
    transaction,
    formId,
    variant:"standard"
  };

  tableCellProps = {
    ...tableCellProps,
    ...wireUpEditActions({
      edit,
      grabFocus,
      hasFocus,
      setEdit,
      setGrabFocus,
      setFocus
    })
  };

  return <TableCell {...tableCellProps}>{edit ?
    <PaymentMethodInput {...payMethodInputProps}/>
    :
    titleCase(paymentMethod.method)
  }</TableCell>;

},{
  fragments:{
    paymentMethod:gql`
      fragment PaymentMethodCellPaymentMethod on PaymentMethod {
        __typename
        id
        method
      }
    `
  }
});

export const SourceCell =  Object.assign(function({edit, setEdit, formId, transaction,
  tableCellProps, entryOpts}:LedgerEntryCellPropsWOpts)
{

  const classes = styles();

  const [hasFocus, setFocus] = useState(false);
  const [grabFocus, setGrabFocus] = useState(false);
  
  // Necessary when click away triggers edit reset
  if(grabFocus && !edit) {
    setGrabFocus(false);
  }


  const source = (transaction.source) as SourceCellBusinessFragment | SourceCellDepartmentFragment |
   SourceCellPersonFragment;

  let sourceName:string = "";
  let icon:any;
  switch(source.__typename) {
    case "Business":
      sourceName = source.bizName;
      icon = <BusinessIcon className={classes.sourceIcon} />;
      break;
    case "Department":
      sourceName = source.deptName;
      icon = <DepartmentIcon className={classes.sourceIcon} />;
      break;
    case "Person":{
      const {first, last} = source.name;
      sourceName = `${first} ${last}`;
      icon = <PersonIcon className={classes.sourceIcon} />;
      break;
    }
  }

  const sourceInputProps:SourceInputProps = {
    grabFocus,
    transaction,
    formId,
    variant:"standard"
  };
  
  tableCellProps = {
    ...tableCellProps,
    className:edit ? classes.sourceCellEdit : classes.sourceCell,
    ...wireUpEditActions({
      edit,
      grabFocus,
      hasFocus,
      setEdit,
      setGrabFocus,
      setFocus
    })
  };

  return <TableCell {...tableCellProps}>{edit ?
    <SourceInput {...sourceInputProps} />
    :
    <Grid container alignItems="center">
      <Grid item>{icon}</Grid>
      <Grid item>{titleCase(sourceName)}</Grid>
    </Grid>
  }</TableCell>;

},{
  fragments:{
    business:gql`
      fragment SourceCellBusiness on Business {
        __typename
        id
        bizName: name
      }
    `,
    department:gql`
      fragment SourceCellDepartment on Department {
        __typename
        id
        deptName: name
      }
    `,
    person:gql`
      fragment SourceCellPerson on Person {
        __typename
        id
        name {
          first
          last
        }
      }
    `
  }
});

const rationalToDec = function(rational:Rational):number {
  const {num:n, den:d} = rational;
  const faction = new Fraction({n, d});
  return faction.valueOf();
}

export const TotalCell = Object.assign(function({edit, setEdit, formId, transaction, 
  tableCellProps}:LedgerEntryCellProps)
{

  const [hasFocus, setFocus] = useState(false);
  const [grabFocus, setGrabFocus] = useState(false);
  
  // Necessary when click away triggers edit reset
  if(grabFocus && !edit) {
    setGrabFocus(false);
  }


  const {total} = transaction;

  const totalInputProps:TotalInputProps = {
    grabFocus,
    transaction,
    formId,
    variant:"standard",
    textFieldProps:{
    }
  };

  tableCellProps = {
    ...tableCellProps,
    ...wireUpEditActions({
      edit,
      grabFocus,
      hasFocus,
      setEdit,
      setGrabFocus,
      setFocus
    })
  };

  return <TableCell {...tableCellProps}>{edit ?
    <TotalInput {...totalInputProps}/>
    :
    numeral(rationalToDec(total)).format('$0,0.00')
  }</TableCell>;

},{
  fragments:{
    rational:gql`
      fragment TotalCellRational on Rational {
        __typename
        num
        den
      }
    `
  }
});
