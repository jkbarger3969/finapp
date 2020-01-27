import isEqual from "lodash.isequal";

import {CREATE, Create, SET_INDEX, SetIndex, SET_DEFAULT_INDEX, SetDefaultIndex,
 SET_NAME, SetName, SET_DEFAULT_NAME, SetDefaultName, SET_WIDTH, SetWidth,
 SET_DEFAULT_WIDTH, SetDefaultWidth, COLLAPSE, Collapse, EXPAND, Expand,
 HIDE, Hide, SHOW, Show, RESTORE_DEFAULTS,
 RestoreDefaults,
} from "../actionTypes/tableRow";
import { TableRow } from "@material-ui/core";

type Actions = Create | SetIndex | SetDefaultIndex | SetName | SetDefaultName |
  SetWidth | SetDefaultWidth | Collapse | Expand | Hide | Show |
  RestoreDefaults;

export interface TableCellIni {
  rowId:string;
  id:string;
  index:number;
  name:string;
  width:number;
  collapsed?:boolean;
  hidden?:boolean;
}
export class TableCell {
  
  readonly ini:Readonly<TableCellIni>;
  readonly rowId:string;
  readonly id:string;
  index:number;
  name:string;
  width:number;
  collapsed:boolean;
  hidden:boolean;
  
  constructor(ini:TableCellIni) {
    this.ini = {...ini} as const;
    this.rowId = ini.rowId
    this.id = ini.id;
    this.index = ini.index;
    this.name = ini.name;
    this.width = ini.width;
    this.collapsed = ini?.collapsed ?? false;
    this.hidden = ini?.hidden ?? false;
  }

}

export const tableCell = (state:TableCell, action:Actions):TableCell => {
  
  switch(action.type) {
    case SET_INDEX:
      return state.index === action.payload.index ?
        state : {...state, index:action.payload.index};
    case SET_DEFAULT_INDEX:
      return state.index === state.ini.index ?
        state : {...state, index:state.ini.index};
    case SET_NAME:
      return state.name === action.payload.name ?
        state : {...state, name:action.payload.name};
    case SET_DEFAULT_NAME:
      return state.name === state.ini.name ?
        state : {...state, name:state.ini.name};
    case SET_WIDTH:
      return state.width === action.payload.width ?
        state : {...state, width:action.payload.width};
    case SET_DEFAULT_WIDTH:
      return state.width === state.ini.width ?
        state : {...state, width:state.ini.width};
    case COLLAPSE:
      return state.collapsed === true ? state : {...state, collapsed:true};
    case EXPAND:
      return state.collapsed === false ? state : {...state, collapsed:false};
    case HIDE:
      return state.hidden === true ? state : {...state, hidden:true};
    case SHOW:
      return state.hidden === false ? state : {...state, hidden:false};
    case RESTORE_DEFAULTS:{
      const defaultState = new TableCell(state.ini);
      return isEqual(state, defaultState) ? state : defaultState;
    }
    default:
      return state;
  }
  
}

interface TableRow {
  [cellId:string]:TableCell;
}


export const iterateCellByIndex = function*(row:TableRow) {

  const unIndexedCells:TableCell[] = [];
  const indexedCells = new Map<number, TableCell>();

  let nextIndex = 0;
  for(const key in row) {
    
    if(row.hasOwnProperty(key)) {
      
      const cell = row[key];
      const {index = null} = cell;
      
      if(index === null) {
      
        continue;
      
      } else if(nextIndex === index) {
        
        yield cell;
        
        while(indexedCells.has(++nextIndex)) {
        
          yield indexedCells.get(nextIndex) as TableCell;
        
        }
      
      } else if(index > 0) {
      
        indexedCells.set(index, cell);
      
      } else {

        unIndexedCells.push(cell);

      }

    }
  
  }

  return unIndexedCells;

}

export const tableRow = (state:TableRow = {}, action:Actions):TableRow =>
{
  switch(action.type) {
    case CREATE:
      return action.payload.id in state 
        ? state : {...state, [action.payload.id]:new TableCell(action.payload)};
    case SET_INDEX:{
      
      const curIndex = state[action.payload.id].index;
      const newIndex = action.payload.index;
      
      if(curIndex === newIndex) {
      
        return state;
      
      } else if(curIndex < newIndex) {
        
        const newState = {} as TableRow;
        
        for(const row of iterateCellByIndex(state)) {

          if(row.index > newIndex) {
            break;
          } else if(row.index < curIndex) {
            continue;
          } else if(row.index === curIndex) {
            newState[row.id] =  tableCell(row, {...action, payload:{
              ...action.payload, index:newIndex}});
          } else {
            newState[row.id] =  tableCell(row, {...action, payload:{
              ...action.payload, index:row.index - 1}});
          }

        }

        return {...state, ...newState};

      } else {
        
        const newState = {} as TableRow;
        
        for(const row of iterateCellByIndex(state)) {

          if(row.index > curIndex) {
            break;
          } else if(row.index < newIndex) {
            continue;
          } else if(row.index === curIndex) {
            newState[row.id] =  tableCell(row, {...action, payload:{
              ...action.payload, index:newIndex}});
          } else {
            newState[row.id] = tableCell(row, {...action, payload:{
              ...action.payload, index:row.index + 1}});
          }

        }

        return {...state, ...newState};

      }

    }
    case SET_DEFAULT_INDEX:{

      const newState = {} as TableRow;

      for(const row of iterateCellByIndex(state)) {

        newState[row.id] = tableCell(row, action);

      }

      return {...state, ...newState};

    }
    case SET_NAME:
    case SET_DEFAULT_NAME:
    case SET_WIDTH:
    case SET_DEFAULT_WIDTH:
    case COLLAPSE:
    case EXPAND:
    case HIDE:
    case SHOW:
    case RESTORE_DEFAULTS:
      if(action.payload.id in state) {
        const curCell = state[action.payload.id];
        const newCell = tableCell(curCell, action);
        return newCell === curCell ? 
          state : {...state, [action.payload.id]:newCell};
      }
      return state;
    default:
      return state;
  }
}

interface TableRows {
  [rowId:string]:TableRow;
}

export const tableRows = (state:TableRows = {}, action:Actions)
  :TableRows =>
{

  switch(action.type) {
    case CREATE:{
      const {rowId} = action.payload;
      if(rowId in state) {
        const curRow = state[rowId];
        const newRow = tableRow(curRow, action);
        return curRow === newRow ? state : {...state, [rowId]:newRow};
      }
      return {...state, [rowId]:tableRow(undefined, action)};
    }
    case SET_INDEX:
    case SET_DEFAULT_INDEX:
    case SET_NAME:
    case SET_DEFAULT_NAME:
    case SET_WIDTH:
    case SET_DEFAULT_WIDTH:
    case COLLAPSE:
    case EXPAND:
    case HIDE:
    case SHOW:
    case RESTORE_DEFAULTS:{
      const {rowId} = action.payload;
      if(rowId in state) {
        const curRow = state[rowId];
        const newRow = tableRow(curRow, action);
        return curRow === newRow ? state : {...state, [rowId]:newRow};
      }
      return state;
    }
    default:
      return state;
  }

}