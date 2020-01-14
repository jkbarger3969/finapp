import {combineReducers} from "redux";
import isEqual from "lodash.isequal";

import {JournalEntrySourceType, JournalEntrySourceInput, RationalInput
} from "../../apollo/graphTypes";
import {
  
  Create, CREATE, Cancel, CANCEL, Clear, CLEAR,

  SET_SUBMIT_STATUS, SetSubmitStatus, SET_SUBMIT_ERROR, SetSubmitError, 
  CLEAR_SUBMIT_ERROR, ClearSubmitError,
  
  SetDateInput, SET_DATE_INPUT, ClearDateInput, CLEAR_DATE_INPUT,
  SetDateValue, SET_DATE_VALUE, ClearDateValue, CLEAR_DATE_VALUE,
  SetDateError, SET_DATE_ERROR, ClearDateError, CLEAR_DATE_ERROR,
  
  SetDeptInput, SET_DEPT_INPUT, ClearDeptInput, CLEAR_DEPT_INPUT,
  SetDeptValue, SET_DEPT_VALUE, ClearDeptValue, CLEAR_DEPT_VALUE,
  SetDeptError, SET_DEPT_ERROR, ClearDeptError, CLEAR_DEPT_ERROR,
  SetDeptOpen , SET_DEPT_OPEN,
  
  SetTypeValue, SET_TYPE_VALUE, ClearTypeValue, CLEAR_TYPE_VALUE,
  SET_TYPE_ERROR, SetTypeError, CLEAR_TYPE_ERROR, ClearTypeError,
  
  SetSrcType, SET_SRC_TYPE,
  SetSrcInput, SET_SRC_INPUT, ClearSrcInput, CLEAR_SRC_INPUT,
  SetSrcValue, SET_SRC_VALUE, ClearSrcValue, CLEAR_SRC_VALUE,
  SetSrcError, SET_SRC_ERROR, ClearSrcError, CLEAR_SRC_ERROR,
  SetSrcOpen , SET_SRC_OPEN,

  SetPayMethodValue, SET_PAY_METHOD_VALUE, ClearPayMethodValue, 
  CLEAR_PAY_METHOD_VALUE, SET_PAY_METHOD_ERROR, SetPayMethodError,
  CLEAR_PAY_METHOD_ERROR, ClearPayMethodError,

  SET_TOTAL_INPUT, SetTotalInput, CLEAR_TOTAL_INPUT, ClearTotalInput,
  SET_TOTAL_VALUE, SetTotalValue, CLEAR_TOTAL_VALUE, ClearTotalValue,
  SET_TOTAL_ERROR, SetTotalError, CLEAR_TOTAL_ERROR, ClearTotalError

} from "../actionTypes/journalEntryUpsert";
import {InputValue} from "./utils";

type Actions = Create | Cancel | Clear |
  SetSrcInput | SetDateInput | SetTypeValue | ClearTypeValue |
  ClearDateInput | SetDateValue | ClearDateValue | SetDateError |
  ClearDateError | SetSrcInput | ClearSrcInput | SetSrcValue |
  ClearSrcValue | SetSrcError | ClearSrcError | SetSrcOpen | SetDeptInput |
  ClearDeptInput | SetDeptValue | ClearDeptValue | SetDeptError |
  ClearDeptError | SetDeptOpen | SetPayMethodValue | ClearPayMethodValue |
  SetTotalInput | ClearTotalInput | SetTotalValue | ClearTotalValue |
  SetTotalError | ClearTotalError | SetSubmitStatus | SetSubmitError | 
  ClearSubmitError | SetSrcType | SetTypeError | ClearTypeError |
  SetPayMethodError | ClearPayMethodError;


const date = (state = new InputValue<Date, null>(null), action:Actions)
  :InputValue<Date, null> => 
{

  switch(action.type) {
    case SET_DATE_INPUT:{
      const input = action.payload.input.trimStart();
      return state.input === input ? state : {...state, input};
    }
    case CLEAR_DATE_INPUT:
      return state.input === "" ? state : {...state, input:""};
    case SET_DATE_VALUE:
      return state.value?.getTime() === action.payload.value.getTime() ?
        state : {...state, value:action.payload.value};
    case CLEAR_DATE_VALUE:
      return state.value ? {...state, value:null} : state;
    case SET_DATE_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_DATE_ERROR:
      return state.error ? {...state, error:null} : state;
    default:
      return state;
  }

}

const department = (state = Object.assign(new InputValue<string[], []>([]),
  {open:false}), action:Actions):InputValue<string[], []> & {open:boolean} =>
{

  switch(action.type) {
    case SET_DEPT_INPUT:{
      const input = action.payload.input.trimStart();
      return state.input === input ? state : {...state, input};
    }
    case CLEAR_DEPT_INPUT:
      return state.input === "" ? state : {...state, input:""};
    case SET_DEPT_VALUE:
      return isEqual(state.value, action.payload.value) ?
        state : {...state, value:[...action.payload.value]};
    case CLEAR_DEPT_VALUE:
      return state.value ? {...state, value:[]} : state;
    case SET_DEPT_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_DEPT_ERROR:
      return state.error ? {...state, error:null} : state;
    case SET_DEPT_OPEN:{
      const open = action.payload.open;
      return open === state.open ? state : {...state, open};
    }
    default:
      return state;
  }
      
}

const type = (state = Object.assign(new InputValue<string, null>(null),
  {open:false}), action:Actions):InputValue<string, null> & {open:boolean} =>
{

  switch(action.type) {
    case SET_TYPE_VALUE:
      return action.payload.value && state.value !== action.payload.value ?
        {...state, value:action.payload.value} : state;
    case CLEAR_TYPE_VALUE:
      return state.value === null ? state : {...state, value:null};
    case SET_TYPE_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_TYPE_ERROR:
        return state.error === null ? state : {...state, error:null};
    default:
      return state;
  }
  
}

const source = (state = Object.assign(
  new InputValue<JournalEntrySourceInput[], []>([]),{open:false}),
  action:Actions):InputValue<JournalEntrySourceInput[], []> & {open:boolean} => 
{

  switch(action.type) {
    case SET_SRC_INPUT:{
      const input = action.payload.input.trimStart();
      return state.input === input ? state : {...state, input};
    }
    case CLEAR_SRC_INPUT:
      return state.input === "" ? state : {...state, input:""};
    case SET_SRC_VALUE:
      return isEqual(state.value, action.payload.value) ?
        state : {...state, value:[...action.payload.value]};
    case CLEAR_SRC_VALUE:
      return state.value ? {...state, value:[]} : state;
    case SET_SRC_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_SRC_ERROR:
      return state.error ? {...state, error:null} : state;
    case SET_SRC_OPEN:{
      const open = action.payload.open;
      return open === state.open ? state : {...state, open};
    }
    default:
      return state;
  }

}

const paymentMethod = (state = Object.assign(new InputValue<string, null>(null),
  {open:false}), action:Actions):InputValue<string, null> & {open:boolean} =>
{

  switch(action.type) {
    case SET_PAY_METHOD_VALUE:
      return action.payload.value && state.value !== action.payload.value ?
        {...state, value:action.payload.value} : state;
    case CLEAR_PAY_METHOD_VALUE:
      return state.value === null ? state : {...state, value:null};
    case SET_PAY_METHOD_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_PAY_METHOD_ERROR:
        return state.error === null ? state : {...state, error:null};
    default:
      return state;
  }
  
}

const total = (state = new InputValue<RationalInput, null>(null), 
  action:Actions ):InputValue<RationalInput, null> => 
{

  switch(action.type) {
    case SET_TOTAL_INPUT:
      return state.input === action.payload.input ?
        state : {...state, input:action.payload.input};
    case CLEAR_TOTAL_INPUT:
      return state.input === "" ? state : {...state, input:""};
    case SET_TOTAL_VALUE:
      return isEqual(state.value, action.payload.value) ?
        state : {...state, value:action.payload.value};
    case CLEAR_TOTAL_VALUE:
      return state.value === null ? state : {...state, value:null};
    case SET_TOTAL_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_TOTAL_ERROR:
      return state.error === null ? state : {...state, error:null};
    default:
      return state;
  }
  
}

const values = combineReducers({
  id:(state:string | null = null, action:Actions) => action.type === CREATE ?
    (action.payload.entryId || null) : state,
  date,
  department,
  type,
  srcType:(state:JournalEntrySourceType | null = null, action:Actions) => 
    action.type === SET_SRC_TYPE ? action.payload.srcType : state,
  source,
  paymentMethod,
  total
});

export enum SubmitStatus {
  NotSubmitted,
  Submitting,
  Submitted,
}

const submit = (state = {
    status:SubmitStatus.NotSubmitted,
    error:null as null | Error,
  }, action:Actions) => 
{

  switch(action.type) {
    case SET_SUBMIT_STATUS:
      return state.status === action.payload.status 
        ? state : {...state, status:action.payload.status};
    case SET_SUBMIT_ERROR:
      return state.error?.message === action.payload.error.message ?
        state : {...state, error:action.payload.error};
    case CLEAR_SUBMIT_ERROR:
      return state.error === null ? state : {...state, error:null};
    default:
      return state;
  }

}


const journalEntryUpsert = combineReducers({
  id:(state:string = "", action:Actions) => 
    action.type === CREATE ? action.payload.upsertId : state,
  values,
  submit
});

export type JournalEntryUpsert = ReturnType<typeof journalEntryUpsert>;

const reduceOneById = (state:JournalEntryUpsert[], action:Actions)
  :JournalEntryUpsert[] =>
{
  const id = action.payload.upsertId;
  for(let i = 0, len = state.length; i < len; i++){
    const entry = state[i];
    if(entry.id === id) {
      const newEntry = journalEntryUpsert(entry, action);
      if(newEntry !== entry) {
        return [
          ...state.slice(0, i),
          newEntry,
          ...state.slice(i + 1)
        ];
      } else {
        return state;
      }
    }
  }
  return state;
}

export const journalEntryUpserts = (state:JournalEntryUpsert[] = [],
  action:Actions):JournalEntryUpsert[] => 
{

  switch(action.type) {
    
    case CREATE:
      return [...state, journalEntryUpsert(undefined, action)];
    case CANCEL:
    case CLEAR:{
      const id = action.payload.upsertId;
      for(let i = 0, len = state.length; i < len; i++){
        if(state[i].id === id){
          return [
            ...state.slice(0, i),
            ...state.slice(i + 1)
          ];
        }
      }
      return state;
    }
    
    case SET_DATE_INPUT:
    case CLEAR_DATE_INPUT:
    case SET_DATE_VALUE:
    case CLEAR_DATE_VALUE:
    case SET_DATE_ERROR:
    case CLEAR_DATE_ERROR:
    case SET_DEPT_INPUT:
    case SET_DEPT_VALUE:
    case SET_DEPT_ERROR:
    case SET_DEPT_OPEN:
    case CLEAR_DEPT_INPUT:
    case CLEAR_DEPT_VALUE:
    case CLEAR_DEPT_ERROR:
    case SET_TYPE_VALUE:
    case CLEAR_TYPE_VALUE:
    case SET_SRC_TYPE:
    case SET_SRC_INPUT:
    case CLEAR_SRC_INPUT:
    case SET_SRC_VALUE:
    case CLEAR_SRC_VALUE:
    case SET_SRC_ERROR:
    case CLEAR_SRC_ERROR:
    case SET_SRC_OPEN:
    case SET_PAY_METHOD_VALUE:
    case CLEAR_PAY_METHOD_VALUE:
    case SET_TOTAL_INPUT:
    case CLEAR_TOTAL_INPUT:
    case SET_TOTAL_VALUE:
    case CLEAR_TOTAL_VALUE:
    case SET_TOTAL_ERROR:
    case CLEAR_TOTAL_ERROR:
    case SET_SUBMIT_STATUS:
    case SET_SUBMIT_ERROR:
    case CLEAR_SUBMIT_ERROR:
    case SET_TYPE_ERROR:
    case CLEAR_TYPE_ERROR:
    case SET_PAY_METHOD_ERROR:
    case CLEAR_PAY_METHOD_ERROR:
      return reduceOneById(state, action);
    default:
      return state;
  }

}