import {Root} from "../reducers/root";
import {TableCell, iterateCellByIndex} from "../reducers/tableRows";

export const getIndexedCells = (state:Root, rowId:string)
  :TableCell[] => 
{

  if(rowId in state.tableRows) {
    
    const row = state.tableRows[rowId];
    
    return [...iterateCellByIndex(row)];

  }

  return [];

}

export const getUnIndexedCells = (state:Root, rowId:string)
  :TableCell[] => 
{

  if(rowId in state.tableRows) {
  
    const row = state.tableRows[rowId];

    const iter = iterateCellByIndex(row);
    while(true) {
      const result = iter.next();
      if(result.done) {
        return result.value;
      }
    }
  
  }

  return [];

}

export const getCells = (state:Root, rowId:string):TableCell[] => {

  const cells:TableCell[] = [];

  if(rowId in state.tableRows) {
  
    const row = state.tableRows[rowId];

    const iter = iterateCellByIndex(row);
    let result = iter.next();
    while(!result.done) {
      cells.push(result.value);
      result = iter.next();
    }
    cells.push(...result.value);
  }

  return cells;

}

export const getCell = (state:Root, rowId:string, cellId:string)
  :TableCell | null =>
{
  if(rowId in state.tableRows && cellId in state.tableRows[rowId]) {
    return state.tableRows[rowId][cellId];
  }
  return null;

}