// @ts-nocheck
import React from 'react';
import {useQuery} from '@apollo/react-hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import gql from 'graphql-tag';

import {randUUID} from '../../../utils/uuid';
import {AddEntryInputsQuery} from '../../../apollo/graphTypes';
import TransactionDateInput from '../../JournalEntryInputs/DateInput';
import TotalInput from '../../JournalEntryInputs/TotalInput';
import DepartmentInput from '../../JournalEntryInputs/DepartmentInput';
import TypeInput from '../../JournalEntryInputs/TypeInput';
import SourceInput from '../../JournalEntryInputs/SourceInput';
import PaymentMethodInput from '../../JournalEntryInputs/PaymentMethodInput';

const styles = makeStyles((theme:Theme) => createStyles({
  dateCell:{
    width:175
  },
  totalCell:{
    width:175
  },
  allCells:{
    margin:0,
    padding:theme.spacing(1)
  }
}));

const ADD_ENTRY_INPUTS = gql`
  query AddEntryInputs {
    lc_journalEntryUpserts @client {
      fields {
        id
      }
    }
  }
`;

const addEntryRowKey = randUUID();

const addEntryCellKeys = new Map([
  ['TransactionDateInput', randUUID()],
  ['DepartmentInput', randUUID()],
  ['TypeInput', randUUID()],
  ['TypeInput', randUUID()],
  ['SourceInput', randUUID()],
  ['PaymentMethodInput', randUUID()],
  ['TotalInput', randUUID()],
]);

export interface AddEntryProps {}

const AddEntry = function(props:AddEntryProps) {

  const classes = styles();

  const {loading, error, data = null} = useQuery<AddEntryInputsQuery>(ADD_ENTRY_INPUTS);
  
  if(loading) {
    return null;
  } else if(error) {
   return <TableRow>
      <TableCell key={Math.random()} colSpan={6}>{error.message}</TableCell>
    </TableRow>;
  } else if(!data || !data.upsertTransactionLocal
      || (data.upsertTransactionLocal.fields
      && data.upsertTransactionLocal.fields.id))
  {
    return null;
  }

  return <TableRow key={addEntryRowKey}>
    <TableCell key={addEntryCellKeys.get('TransactionDateInput')} 
      className={[classes.dateCell, classes.allCells].join(' ')}
    >
      <TransactionDateInput autoFocus={true} />
    </TableCell>
    <TableCell 
      key={addEntryCellKeys.get('DepartmentInput')} 
      className={classes.allCells} 
    >
      <DepartmentInput />
    </TableCell>
    <TableCell 
      key={addEntryCellKeys.get('TypeInput')} 
      className={classes.allCells} 
    >
      <TypeInput />
    </TableCell>
    <TableCell 
      key={addEntryCellKeys.get('SourceInput')} 
      className={classes.allCells} 
    >
      <SourceInput />
    </TableCell>
    <TableCell 
      key={addEntryCellKeys.get('PaymentMethodInput')} 
      className={classes.allCells} 
    >
      <PaymentMethodInput />
    </TableCell>
    <TableCell 
      key={addEntryCellKeys.get('TotalInput')}
      className={[classes.totalCell, classes.allCells].join(' ')}
    >
      <TotalInput />
    </TableCell>
  </TableRow>;
  
}

export default AddEntry;