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
  height:number;
  width:number;
}

const Body = function(props:BodyProps) {

  const {width, height} = props;

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
    ({onItemsRendered, ref}) => <List
      onItemsRendered={onItemsRendered}
      ref={ref}
      height={height}
      width={width}
      itemCount={totalCount}
      itemSize={()=>53}
      overscanCount={10}
    >{entryRow}</List>,[height, width, entryRow, totalCount]);

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