import React, {ChangeEvent, useState, FormHTMLAttributes, FormEvent} from 'react';
import Table, {TableProps} from '@material-ui/core/Table';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import TablePagination, {TablePaginationProps} from '@material-ui/core/TablePagination';
import TableRow, {TableRowProps} from '@material-ui/core/TableRow';
import TableFooter, {TableFooterProps} from '@material-ui/core/TableFooter';
import PathAccessor from 'path-accessor';

import LedgerHeaders from './LedgerHeaders';
import LedgerEntries, {LedgerEntriesProps} from './LedgerEntries';
import LedgerEntry,{genEditEntryFormId} from './LedgerEntry';
import LedgerAddEntry from './LedgerAddEntry';
import {uuid, namespace} from '../../utils/uuid';
import inMemoryCache from '../../apollo/inMemoryCache';
import {TransactionsQueryArg, Transaction, TransactionUpdate} 
  from '../../apollo/graphTypes';

export const transactionsQueryArgId = 
  uuid(`Ledger.TransactionsQueryArg`, namespace);

//Ini Ledger state
const transactionsQueryArgs:TransactionsQueryArg =  {
  __typename:"TransactionsQueryArg",
  id:transactionsQueryArgId,
  skip:0,
  limit:25,
  deleted:false,
  sortBy:null
};
const transactionUpdate:TransactionUpdate = {
  __typename:"TransactionUpdate",
  id:transactionsQueryArgId,
  transactionId:"5dbe27e48ccb8a2bd4a6ca01",
  fields:{
    transactionDate:"2019-09-30T15:10:46.427Z",
    department:{
      edge:"5dc4addacf96e166daaa008f",
      node:"5dc36bbbc7167f67e39cd69e"
    },
    source:{
      edge:"5dc476becf96e166daa9fd0b",
      node:"5dc47b43cf96e166daaa008e"
    },
    type:{
      edge:"5dca0427bccd5c6f26b0cde1",
      node:"5dc75a60bccd5c6f26b0cdcb"
    },
    paymentMethod:{
      edge:"5dca0427bccd5c6f26b0cddf",
      node:"5dc46d0af74afb2c2805bd55"
    },
    total:{
      num: 5035,
      den: 100
    }
  },
}
inMemoryCache.writeData({data:{
  transactionsQueryArgs,
  transactionUpdate
}});

const  Ledger = Object.assign(function() {
  
  const [updateEntry, setUpdateEntry] = useState<string | null>(null);

  const transactionQueryArgsResult = useQuery(
    Ledger.queries.transactionsQueryArg, {
    variables:{id:transactionsQueryArgId}
  });

  let {loading, error, data = {}} = transactionQueryArgsResult;

  const transactionsQueryArg =  (data as any).getTransactionsQueryArg;

  const transactionQueryResult  = useQuery(Ledger.queries.transactions, {
    skip: loading || !transactionsQueryArg || !!error, 
    variables:{arg:transactionsQueryArg, ledgerId:transactionsQueryArgId}
  });
  
  if(!transactionQueryResult.loading) {
    console.log(transactionQueryResult.data);
  }

  const [goToPage] = useMutation(Ledger.mutations.goToPage);
  const [updateLimit] = useMutation(Ledger.mutations.updateLimit);

  const count:number = PathAccessor.getValue<number>(
    'transactions.totalCount', transactionQueryResult.data || {}).next().value;
  
  const skip:number = PathAccessor.getValue<number>(
    'transactions.skip', transactionQueryResult.data || {}).next().value;
  
  const limit:number = PathAccessor.getValue<number>(
    'transactions.limit', transactionQueryResult.data || {}).next().value;


  const tablePaginationProps:any = {
    count,
    onChangePage:(event:any, page:number)=> goToPage({variables:{
      id:transactionsQueryArgId,
      page,
      totalCount:count
    }}),
    page:skip/limit,
    rowsPerPage:limit,
    SelectProps:{
      onChange:(event:ChangeEvent<{ name?: string; value: unknown }>)=>{
        updateLimit({variables:{
          id:transactionsQueryArgId,
          limit:event.target.value
        }});
      }
    }
  }

  const formProps:FormHTMLAttributes<HTMLFormElement> = {
    id:updateEntry === null ? undefined : genEditEntryFormId(updateEntry),
    onSubmit(event:FormEvent<HTMLFormElement>){
      console.log("Form submit",event);
      setUpdateEntry(null);
      event.preventDefault();
    },
  }

  const ledgerEntriesProps:LedgerEntriesProps = {
    transactionQueryResult,
    updateEntry,
    setUpdateEntry
  };

  return <div>
    <form {...formProps}>
      <Table stickyHeader>
        <LedgerHeaders transactionQueryArgsResult={transactionQueryArgsResult}  />
        {/* <LedgerEntries {...ledgerEntriesProps} /> */}
        <TableFooter>
          <TableRow>
            {count === undefined ? null : <TablePagination {...tablePaginationProps} />}
          </TableRow>
          <TableRow style={{height:72}}/>
        </TableFooter>
      </Table>
      <LedgerAddEntry/>
      <input type="submit" style={{display:"none"}} />
    </form>
  </div>;

},{
  queries:{
    transactions:gql`
      query LedgerState($ledgerId:ID!, $arg:TransactionsQueryInput!) {
        
        transactionUpdate(id:$ledgerId) @client {
          transactionId
          fields {
            transactionDate
            department {
              edge
              node
            }
            type {
              edge
              node
            }
            paymentMethod {
              edge
              node
            }
            total {
              num
              den
            }
            source {
              edge
              node
            }
          }
        }

        transactions(arg:$arg) {      
          skip
          limit
          totalCount
          
          transactions {
            ...LedgerEntryTransaction 
          }
        }
      }
      ${LedgerEntry.fragments.transaction}
    `,
    transactionsQueryArg:gql`
      query TransactionsQueryArg($id:ID!) {
        getTransactionsQueryArg(id:$id) @client {
          skip
          limit
          deleted
          sortBy {
            column
            direction
          }
        }
      }
    `
  },
  mutations:{
    goToPage:gql`
      mutation TurnTransactionsPage($id:ID!, $page:Int!, $totalCount:Int!) {
        goToTransactionsPage(id:$id, page:$page, totalCount:$totalCount) @client {
          id
        }
      }
    `,
    updateLimit:gql`
      mutation UpdateTransactionsLimit($id:ID!, $limit:Int!) {
        updateTransactionsLimit(id:$id, limit:$limit) @client
        {
          id
        }
      }
    `
  },
  fragments:{
  }
});

export default Ledger;