import React, {useCallback, useMemo, useEffect} from 'react';
import {useSelector, shallowEqual} from "react-redux";
import {useQuery, useSubscription} from '@apollo/react-hooks';
import TableBody from '@material-ui/core/TableBody';
import Box from '@material-ui/core/Box';
import {VariableSizeList as List} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import Entry from './Entry';
import {JOURNAL_ENTRIES, JOURNAL_ENTRY_ADDED_SUB} from './JournalEntries.gql';
import {ROW_ID} from "./Cells/cellsReduxIni";
import {Root} from "../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../redux/reducers/tableRows";
import {getIndexedCells} from "../../../redux/selectors/tableRows";
import {JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntriesColumn, SortDirection,
  JournalEntryAdded_1Subscription as JournalEntryAdded
} from "../../../apollo/graphTypes"

type InfiniteLoaderProps = InfiniteLoader['props'];

export interface BodyProps {
  height:number;
  width:number;
}

let notSubscribed = true; 

const Body = function(props:BodyProps) {

  const {height} = props;

  const cellFormats = useSelector<Root, CellFormat[]>((state) => 
    getIndexedCells(state, ROW_ID), shallowEqual);

  const minWidth = useMemo(() => cellFormats.reduce((minWidth, cellFormat) => {
    return minWidth + cellFormat.width;
  },0),[cellFormats]);

  const width = Math.max(minWidth, props.width);

  const {error, data, fetchMore, subscribeToMore} = useQuery<
    JournalEntriesQuery, JournalEntriesQueryVars>(JOURNAL_ENTRIES,
  {
    variables:{
     paginate:{
       skip:0,
       limit:50 // Load entries in 50 block increments
     },
     sortBy:[
       {column:JournalEntriesColumn.Date, direction:SortDirection.Desc}
     ]
    }
  });

  if(notSubscribed) {
    notSubscribed = false;
    subscribeToMore<JournalEntryAdded>({
      document:JOURNAL_ENTRY_ADDED_SUB,
      updateQuery:(prev, {subscriptionData:data = null}) => {
        
        return {
          ...(prev || {}),
          journalEntries:{
            ...(prev.journalEntries || {}),
            totalCount:prev.journalEntries.totalCount + 1,
            entries:[data?.data.journalEntryAdded as any, ...prev.journalEntries.entries]
          }
        };
      }
    });
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
    return <Entry style={style} key={key} journalEntry={entry} />
  
  },[entries]);

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