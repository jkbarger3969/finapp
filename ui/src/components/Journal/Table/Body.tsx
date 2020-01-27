import React, {useCallback, useMemo, useEffect} from 'react';
import {useSelector, shallowEqual} from "react-redux";
import {useQuery, useApolloClient} from '@apollo/react-hooks';
import TableBody from '@material-ui/core/TableBody';
import Box from '@material-ui/core/Box';
import {VariableSizeList as List} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import Entry from './Entry';
import {JOURNAL_ENTRIES, JOURNAL_ENTRY_ADDED_SUB, JOURNAL_ENTRY_UPDATED_SUB,
  JOURNAL_ENTRY_FRAGMENT
} from './JournalEntries.gql';
import {ROW_ID} from "./Cells/cellsReduxIni";
import {Root} from "../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../redux/reducers/tableRows";
import {getIndexedCells} from "../../../redux/selectors/tableRows";
import {JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntriesColumn, SortDirection,
  JournalEntryAdded_1Subscription as JournalEntryAdded,
  JournalEntryUpdated_1Subscription as JournalEntryUpdated,
  JournalEntiresReconciledFilter,
  JournalEntry_1Fragment as JournalEntryFragment
} from "../../../apollo/graphTypes";

type InfiniteLoaderProps = InfiniteLoader['props'];

export enum JournalMode {
  View,
  Reconcile
}

export interface BodyProps {
  deptId?:string;
  mode:JournalMode;
  height:number;
  width:number;
}

const subscribedToAdd = new Set<string>();

let subscribedToUpdate = false;

const defaultVars:JournalEntriesQueryVars = {
    paginate:{
      skip:0,
      limit:50 // Load entries in 50 block increments
    },
    sortBy:[
      {column:JournalEntriesColumn.Date, direction:SortDirection.Desc}
    ]
 }

const Body = function(props:BodyProps) {

  const {height, deptId, mode} = props;

  const subKey = `${deptId}_${mode}`;

  const variables = useMemo<JournalEntriesQueryVars>(()=>{

    const reconciled = mode === JournalMode.Reconcile ?
      JournalEntiresReconciledFilter.NotReconciled : undefined;

    return deptId ? {
      ...defaultVars,
      filterBy:{
        department:{
          eq:deptId
        },
        reconciled
      },
    } : {...defaultVars};

  },[deptId, mode]);

  const cellFormats = useSelector<Root, CellFormat[]>((state) => 
    getIndexedCells(state, ROW_ID), shallowEqual);

  const minWidth = useMemo(() => cellFormats.reduce((minWidth, cellFormat) => {
    return minWidth + cellFormat.width;
  },0),[cellFormats]);

  const width = Math.max(minWidth, props.width);

  const {error, data, fetchMore, updateQuery} = useQuery<
    JournalEntriesQuery, JournalEntriesQueryVars>(JOURNAL_ENTRIES,
  {
    variables
  });

  const removeReconciled = useCallback((id:string) => {

    if(mode === JournalMode.View) {
      return;
    }

    updateQuery((prev)=>{

      const entries = prev.journalEntries.entries;

      for(let i = 0, len = entries.length; i < len; i++) {

        if(entries[i].id === id) {

          return {
            ...prev,
            journalEntries: {
              ...prev.journalEntries,
              totalCount:prev.journalEntries.totalCount - 1,
              entries:[
                ...entries.slice(0, i),
                ...entries.slice(i + 1)
              ]
            }
          }

        }

      }

      return prev;

    });

  },[mode, updateQuery]);

  const client = useApolloClient();

  // Lazy add persistent subscription.
  if(!subscribedToAdd.has(subKey)) {

    subscribedToAdd.add(subKey);

    client.subscribe<JournalEntryAdded>({
      query:JOURNAL_ENTRY_ADDED_SUB
    }).subscribe({next:({data})=>{
      
      if(!data?.journalEntryAdded || (mode === JournalMode.Reconcile 
        && data.journalEntryAdded.reconciled) 
        || (deptId && data.journalEntryAdded.department.id !== deptId))
      {
        return;
      }

      const prev = client.readQuery<JournalEntriesQuery,
        JournalEntriesQueryVars>({
          query:JOURNAL_ENTRIES,
          variables
        });
      
      const update = {
        ...(prev || {}),
        journalEntries:{
          ...(prev?.journalEntries || {}),
          totalCount:(prev?.journalEntries.totalCount || 0) + 1,
          entries:[
            data.journalEntryAdded,
            ...(prev?.journalEntries.entries || [])
          ]
        }
      };

      client.writeQuery({
        query:JOURNAL_ENTRIES,
        variables,
        data:update
      });

    }});

  }

  if(!subscribedToUpdate) {
    
    subscribedToUpdate = true;
    client.subscribe<JournalEntryUpdated>({
      query:JOURNAL_ENTRY_UPDATED_SUB
    }).subscribe({next:({data})=>{

      console.log(data);

      if(!data) {
        return;
      }
      
      client.writeFragment<JournalEntryFragment>({
        id:`JournalEntry:${data.journalEntryUpdated.id}`,
        fragment:JOURNAL_ENTRY_FRAGMENT,
        data:data.journalEntryUpdated
      });

    }});
  
  }

  const entries = data?.journalEntries?.entries || [];
  const totalCount = data?.journalEntries?.totalCount ?? 500;
  
  const isLoaded = useCallback<InfiniteLoaderProps['isItemLoaded']>((index)=>{
    return index in entries;
  },[entries]);

  const loadMoreItems = 
    useCallback<InfiniteLoaderProps['loadMoreItems']>(async (start, end) =>
  {

    await fetchMore({
      variables:{
        paginate:{
          skip:start,
          limit:end - start + 1 //End is inclusive
        }
      },
      updateQuery:(prev, {fetchMoreResult = null}) => {
        
        // new entries
        const newResults = fetchMoreResult?.journalEntries?.entries || [];
        
        const entries = [...(prev?.journalEntries?.entries || [])];
        entries.splice(start, newResults.length, ...newResults);
        

        return {
          ...(prev || {}),
          ...(fetchMoreResult || {}),
          journalEntries:{
            ...(prev?.journalEntries || {}),
            ...(fetchMoreResult?.journalEntries || {}),
            entries
          }
        } as JournalEntriesQuery;
      
      }
    });

  },[fetchMore]);
  
  const entryRow = 
    useCallback(({index, style}:{index:number, style:React.CSSProperties}) => 
  {
    const entry = entries[index];
    const key = entry ? entry.id: index;
    return <Entry
      mode={mode}
      style={style}
      key={key}
      journalEntry={entry}
      removeReconciled={removeReconciled}
    />
  
  },[entries, mode, removeReconciled]);

  const infiniteLoaderChildren = useCallback<InfiniteLoaderProps["children"]>( 
    ({onItemsRendered, ref}) => <Box display="flex" clone><List
      onItemsRendered={onItemsRendered}
      ref={ref}
      height={height}
      width={width}
      itemCount={totalCount}
      itemSize={()=>53}
      overscanCount={10}
    >{entryRow}</List></Box>,[height, width, entryRow, totalCount]);

  if(error) {
    return <div>{error.message}</div>;
  }

  return <Box height={height} display="block" clone>
    <TableBody component='div'>
      <InfiniteLoader
        isItemLoaded={isLoaded}
        itemCount={totalCount}
        minimumBatchSize={50}
        loadMoreItems={loadMoreItems}
        children={infiniteLoaderChildren}
      />
    </TableBody>
  </Box>;

}

export default Body;