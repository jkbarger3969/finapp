import React, {useState, KeyboardEvent} from 'react';
import TableRow, {TableRowProps} from '@material-ui/core/TableRow';
import ClickAwayListener, {ClickAwayListenerProps} from '@material-ui/core/ClickAwayListener';
import {red, green} from '@material-ui/core/colors/';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import {useQuery, useApolloClient} from '@apollo/react-hooks';
import gql from 'graphql-tag';

import {Transaction, LedgerEditEntryOptionsQuery} from '../../apollo/graphTypes';
import {TransactionDateCell, DepartmentCell, TransactionTypeCell, SourceCell, PaymentMethodCell,
  TotalCell, LedgerEntryCellProps, LedgerEntryCellPropsWOpts} from './LedgerEntryCells';
import {TransactionTypeInput, DepartmentInput, PaymentMethodInput } from './LedgerEntryInputs';

export interface LedgerEntryProps {
  transaction:Transaction;
  updateEntry:string | null;
  setUpdateEntry(entry:string | null):void;
}

const styles = makeStyles((theme)=> {

  return createStyles({
    expense:{
      backgroundColor:red[50],
      '&:hover, &:focus': {
        background:red[100]
      }
    },    
    income:{
      backgroundColor:green[50],
      '&:hover, &:focus': {
        background:green[100]
      }
    },
    refund:{
      backgroundColor:red[50],
      '&:hover, &:focus': {
        background:red[100]
      }
    },
    reimbursement:{
      backgroundColor:green[50],
      '&:hover, &:focus': {
        background:green[100]
      }
    },
    ledgerInputComps: {
      paddingTop:2,
      paddingBottom:2
    },
    ledgerInputCompsTotal:{
      width:50
    }
  });
});

const businessID = "5dc4b09bcf96e166daaa0090";
const userId = "5de16db089c4360df927a3db";

export const genEditEntryFormId = (id:string) => `edit-ledger-entry-${id}`;

export const LedgerEntry = Object.assign(function(props:LedgerEntryProps){

  const client = useApolloClient();

  const {transaction, updateEntry, setUpdateEntry} = props;
  const {type, id} = transaction;

  const edit = id === updateEntry;

  const setEdit = (edit:boolean) => setUpdateEntry(edit ? id : null);

  const classes = styles();
  
  let typeStyle;
  switch(type.rootType.type) {
    case "expense":
      typeStyle  = classes.expense;
      break;
    case "income":
      typeStyle  = classes.income;
      break;
    case "refund":
      typeStyle  = classes.refund;
      break;
    case "reimbursement":
      typeStyle  = classes.reimbursement;
      break;
  }       

  const entryOpts = useQuery<LedgerEditEntryOptionsQuery>(
    LedgerEntry.queries.entryInputOptsAndEdges, {
    variables:{deptFrom:businessID}
  });

  const formId = genEditEntryFormId(id);

  const tableCellProps:LedgerEntryCellProps = {
    formId,
    transaction,
    setEdit,
    edit,
    tableCellProps:{
      className:edit ? classes.ledgerInputComps : undefined,
      tabIndex:edit ? -1 : 0
    } 
  };

  const tableCellPropsWOpts:LedgerEntryCellPropsWOpts = {
    ...tableCellProps,
    entryOpts
  }

  const tableRowProps:TableRowProps = {
    // tabIndex:edit ? 0 : -1,
    className:typeStyle
  };

  const clickAwayListenerProps:Omit<ClickAwayListenerProps, 'children'> = {
    onClickAway:()=> edit ? setEdit(false) : null
  };


  return <ClickAwayListener {...clickAwayListenerProps}>
    <TableRow {...tableRowProps}>
      <TransactionDateCell {...tableCellProps} />
      <DepartmentCell {...tableCellPropsWOpts}/>
      <TransactionTypeCell {...tableCellPropsWOpts}/>
      <SourceCell {...tableCellPropsWOpts}/>
      <PaymentMethodCell {...tableCellPropsWOpts}/>
      <TotalCell {...tableCellProps}/>
    </TableRow>
  </ClickAwayListener>;

},{
  queries:{
    entryInputOptsAndEdges:gql`
      query LedgerEditEntryOptions($deptFrom:ID!, $transFrom:ID) {
        departments(from:$deptFrom) {
          ...DepartmentInputDepartment
        }
        transactionTypes(from:$transFrom) {
          ...TransactionTypeInputTransactionType
        }
        paymentMethods {
          ...PaymentMethodInputPaymentMethod
        }
        transactionTypeEdge : edge(edge:{typename:"TransactionType"}) {
          ...LedgerEditEntryInputEdge
        }
        paymentMethodEdge : edge(edge:{typename:"PaymentMethod"}) {
          ...LedgerEditEntryInputEdge
        }
        departmentEdge : edge(edge:{typename:"Department"}) {
          ...LedgerEditEntryInputEdge
        }
        businessEdge : edge(edge:{typename:"Business"}) {
          ...LedgerEditEntryInputEdge
        }
        personEdge : edge(edge:{typename:"Person"}) {
          ...LedgerEditEntryInputEdge
        }
      }
      fragment LedgerEditEntryInputEdge on Edge {
        __typename
        id
        type
      }
      ${DepartmentInput.fragments.department}
      ${TransactionTypeInput.fragments.type}
      ${PaymentMethodInput.fragments.type}
    `
  },
  mutations:{},
  fragments:{
    transaction:gql`
      fragment LedgerEntryTransaction on Transaction {
        __typename
        id
        transactionDate
        department {
          ...DepartmentCellDepartment
        }
        type {
          ...TransactionTypeCellTransactionType
        }
        source {
          ...SourceCellBusiness
          ...SourceCellDepartment
          ...SourceCellPerson
        }
        paymentMethod {
          ...PaymentMethodCellPaymentMethod
        }
        total {
          ...TotalCellRational
        }
      }
      ${DepartmentCell.fragments.department}
      ${TransactionTypeCell.fragments.type}
      ${SourceCell.fragments.business}
      ${SourceCell.fragments.department}
      ${SourceCell.fragments.person}
      ${PaymentMethodCell.fragments.paymentMethod}
      ${TotalCell.fragments.rational}
    `
  }
  
});

export default LedgerEntry;