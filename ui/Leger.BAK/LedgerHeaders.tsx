import React from 'react';
import TableHead, {TableHeadProps} from '@material-ui/core/TableHead';
import TableRow, {TableRowProps} from '@material-ui/core/TableRow';
import TableCell, {TableCellProps} from '@material-ui/core/TableCell';
import TableSortLabel, {TableSortLabelProps} from '@material-ui/core/TableSortLabel';
import { useQuery, useMutation} from '@apollo/react-hooks';
import {QueryResult} from '@apollo/react-common';
import gql from 'graphql-tag';

import {TransactionsQuerySortByColumn, SortDirection, TransactionsQueryArg,
  TransactionsQueryArgQuery} from '../../apollo/graphTypes';
import {transactionsQueryArgId} from './Ledger';

type TransactionsQueryArgWithSortBy = Pick<TransactionsQueryArg, 'sortBy'>;

const columnsMap:[string,  TransactionsQuerySortByColumn][] = [
  ['Date',TransactionsQuerySortByColumn.TransactionDate],
  ['Department',TransactionsQuerySortByColumn.Department],
  ['Type',TransactionsQuerySortByColumn.Type],
  ['Source',TransactionsQuerySortByColumn.Source],
  ['Payment Method',TransactionsQuerySortByColumn.PaymentMethod],
  ['Total',TransactionsQuerySortByColumn.Total]
];


const ADD_SORT = (()=>{return gql`
  mutation UpdateLedgerSortBy($id:ID!, $column:TransactionsQuerySortByColumn!, 
    $direction:SortDirection!) 
  {

    addTransactionsSortByArg(id:$id, column:$column, direction:$direction) @client {
      id
    }

  }

`;})();

export default function(props:{transactionQueryArgsResult:QueryResult<TransactionsQueryArgQuery>}) {

  const {loading, error, data } = props.transactionQueryArgsResult;

  const [addSort] = useMutation(ADD_SORT);

  const sortByMap = new Map<TransactionsQuerySortByColumn, SortDirection>();

  if(!loading) {

    const {getTransactionsQueryArg:arg} = data as NonNullable<TransactionsQueryArgQuery>;
    
    const sortBy = !!arg && 'sortBy' in arg && arg.sortBy !== null ? arg.sortBy : [];

    for(const {column, direction} of sortBy) {
      sortByMap.set(column, direction || SortDirection.Asc);
    }
  
  }


  return <TableHead>
    <TableRow>
      {columnsMap.map(([column, sortLookUp], i) => {

        const active = sortByMap.has(sortLookUp);
        const direction = active ? 
          (sortByMap.get(sortLookUp) === SortDirection.Asc ? 'asc' : 'desc') : undefined;

        const tableSortLabelProps:TableSortLabelProps = {
          active,
          direction,
          onClick:()=>{

            const variables = {
              id:transactionsQueryArgId,
              column:sortLookUp,
              direction: direction === 'asc' ? SortDirection.Desc : SortDirection.Asc,
            };

            addSort({variables});

          },
          onDoubleClick:()=>{
            console.log('remove sort');
          }
        };

      return <TableCell key={sortLookUp}>
        <TableSortLabel {...tableSortLabelProps}>{column}</TableSortLabel>
      </TableCell>;

      })}
    </TableRow>
  </TableHead>;

}