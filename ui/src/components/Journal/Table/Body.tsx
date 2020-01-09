import React, {useCallback, useMemo} from 'react';
import {useQuery} from '@apollo/react-hooks';
import TableBody from '@material-ui/core/TableBody';
import Box from '@material-ui/core/Box';
import {VariableSizeList as List} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

import Entry from './Entry';
import {JOURNAL_ENTRIES} from './JournalEntries.gql';

type JournalEntriesQuery = any;
type JournalEntriesQueryVars = any;
type InfiniteLoaderProps = InfiniteLoader['props'];

export interface BodyProps {
  entry
}

const Body = function() {

  const {error, data, fetchMore} = useQuery<JournalEntriesQuery, 
    JournalEntriesQueryVars>(JOURNAL_ENTRIES,
  {
    variables:{
     paginate:{
       skip:0,
       limit:50 // Load entries in 50 block increments
     }
    }
  });
  
  const {journalEntries = null} = data || {};
  const {
    entries:entriesNullable = null, 
    totalCount:totalCountNullable = null
  } = journalEntries || {};
  const entries = useMemo(()=> entriesNullable || [],[entriesNullable]);
  const totalCount = totalCountNullable || 500;
  
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
        
        // previous
        prev = prev || null;
        const {journalEntries:prevJournalEntries = null} = prev || {};
        const {entries:prevEntriesNullable = null} = prevJournalEntries || {};
        const prevEntries = prevEntriesNullable || [];
        
        // new
        const {journalEntries:newJournalEntries = null} = fetchMoreResult || {};
        const {entries:newResultsNullable = null} = newJournalEntries || {};
        const newResults = newResultsNullable || [];
        
        const entries = [...prevEntries];
        entries.splice(start, newResults.length, ...newResults);
        

        return {
          ...(prev || {}),
          ...(fetchMoreResult || {}),
          journalEntries:{
            ...(prevJournalEntries || {}),
            ...(newJournalEntries || {}),
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

  const autoSizerChildren = useCallback(({height, width})=>{

    const children = ({onItemsRendered, ref})=><List 
      onItemsRendered={onItemsRendered}
      ref={ref}
      height={height}
      width={width}
      itemCount={totalCount}
      itemSize={()=>53}
      overscanCount={10}
    >{entryRow}</List>;

    return <Box width={width} height={height} display="block" clone>
      <TableBody component='div'>
        <InfiniteLoader
          isItemLoaded={isLoaded}
          itemCount={totalCount}
          minimumBatchSize={50}
          loadMoreItems={loadMoreItems}
          children={children}
        />
      </TableBody>
    </Box>;
  },[isLoaded, totalCount, loadMoreItems, entryRow]);

  if(error) {
    return <div>{error.message}</div>;
  }

  return <AutoSizer>{autoSizerChildren}</AutoSizer>;

}

export default Body;