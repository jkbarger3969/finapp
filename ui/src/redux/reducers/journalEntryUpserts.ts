import {combineReducers} from "redux";

import {JournalEntrySourceType, JournalEntrySourceInput, RationalInput
} from "../../apollo/graphTypes";
import {Create, CREATE, Cancel, CANCEL, Clear, CLEAR, SetDate, SET_DATE,
  ClearDate, CLEAR_DATE
} from "../actionTypes/journalEntryUpsert";

type Actions = Create | Cancel | Clear | SetDate | ClearDate;

interface Inputs {
  deptInput:string;
  totalInput:string;
  srcInput:string;
  srcType:JournalEntrySourceType | null;
}

const inputs = (state:Inputs = {
    deptInput:"",
    totalInput:"",
    srcInput:"",
    srcType:null
  }, action:Actions) => 
{

  switch(action.type) {
    default:
      return state;
  }

}

interface Fields {
  id:string | null;
  date:string | null;
  department:string[];
  type:string | null;
  paymentMethod:string | null;
  total:RationalInput | null;
  source:JournalEntrySourceInput[];
}

const fields = (state:Fields = {
    id:null,
    date:null,
    department:[],
    type:null,
    paymentMethod:null,
    total:null,
    source:[]
  }, action:Actions) =>
{

  switch(action.type) {
    case CREATE:
      return {...state, id:action.payload.entryId || null};
    case CLEAR_DATE:
      return {...state, date:null};
    case SET_DATE:
      return {...state, date:action.payload.date};
    default:
      return state;
  }

}

const id = (state:string = "", action:Actions) => 
  action.type === CREATE ? action.payload.upsertId : state;

const journalEntryUpsert = combineReducers({
  id,
  inputs,
  fields
});

export type JournalEntryUpsert = ReturnType<typeof journalEntryUpsert>;

export const journalEntryUpserts = (state:JournalEntryUpsert[] = [],
  action:Actions) => 
{

  switch(action.type) {
    case CREATE:
    
      return [...state, journalEntryUpsert(undefined, action)];
    
    case CANCEL:
    case CLEAR:
      
      return state.filter(({id})=> id !== action.payload.upsertId);
    
    case SET_DATE:
    case CLEAR_DATE: {
      const newState = [] as typeof state;
      for(const entry of state) {
        if(entry.id === action.payload.upsertId) {
          newState.push(journalEntryUpsert(entry, action));
        } else {
          newState.push(entry);
        }
      }
      return newState.length === 0 ? state : newState;
    }
    default:
      return state;
  }

}