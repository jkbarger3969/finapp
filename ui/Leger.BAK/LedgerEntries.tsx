import React from 'react';
import {TableBody, TableRow, TableCell} from '@material-ui/core/';
import {ApolloError} from 'apollo-client';
import {QueryResult} from '@apollo/react-common';
import PathAccessor from 'path-accessor';

import LedgerEntry, {LedgerEntryProps} from './LedgerEntry';


import {LedgerStateQuery, Transaction} 
  from '../../apollo/graphTypes';

export interface LedgerEntriesProps {
  transactionQueryResult:QueryResult<LedgerStateQuery>;
  updateEntry:string | null;
  setUpdateEntry(entry:string | null):void;
}

const LOADING_KEY = Math.random();
const ERROR_KEY = Math.random();

export default function LedgerEntries({transactionQueryResult, updateEntry, setUpdateEntry}
    :LedgerEntriesProps)
{
  
  const {loading, error, data} = transactionQueryResult;

  const transactions:Transaction[] = PathAccessor.getValue<Transaction[]>(
    'transactions.transactions', data || {}).next().value;

  if(loading || !transactions) {
  
    return <TableBody>
      <TableRow key={LOADING_KEY}>
        <TableCell colSpan={6}> Loading...</TableCell>
      </TableRow>
    </TableBody>;
  
  } else if(error) {

    return <TableBody>
      <TableRow key={ERROR_KEY}>
        <TableCell colSpan={6}>{`ERROR: ${error.message}`}</TableCell>
      </TableRow>
    </TableBody>

  }

  return <TableBody>
    {transactions.map((transaction) => {

      const ledgerEntryProps:LedgerEntryProps & {key:string} = {
        key:transaction.id,
        transaction,
        updateEntry,
        setUpdateEntry
      }

      return <LedgerEntry {...ledgerEntryProps} />;

    })}
   
    {/* <TableRow key={SPACE_KEY}><TableCell /></TableRow> */}
  </TableBody>;

}