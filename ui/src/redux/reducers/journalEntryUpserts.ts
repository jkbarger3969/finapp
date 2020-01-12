import {combineReducers} from "redux";
import isEqual from "lodash.isequal";

import {JournalEntrySourceType, JournalEntrySourceInput, RationalInput
} from "../../apollo/graphTypes";
import {Create, CREATE, Cancel, CANCEL, Clear, CLEAR,
  SetSrcType, SET_SRC_TYPE,
  SetSrc, SET_SRC, ClearSrc, CLEAR_SRC,
  
  SetDateInput, SET_DATE_INPUT, ClearDateInput, CLEAR_DATE_INPUT,
  SetDateValue, SET_DATE_VALUE, ClearDateValue, CLEAR_DATE_VALUE,
  SetDateError, SET_DATE_ERROR, ClearDateError, CLEAR_DATE_ERROR,

  SetSrcInput, SET_SRC_INPUT, ClearSrcInput, CLEAR_SRC_INPUT,
  SetSrcValue, SET_SRC_VALUE, ClearSrcValue, CLEAR_SRC_VALUE,
  SetSrcError, SET_SRC_ERROR, ClearSrcError, CLEAR_SRC_ERROR,
  SetSrcOpen , SET_SRC_OPEN
} from "../actionTypes/journalEntryUpsert";
// import {InputValue} from "./types";
import {InputValue} from "./utils";

type Actions = Create | Cancel | Clear | SetSrcType |
  SetSrcInput | SetSrc | ClearSrc | SetDateInput |
  ClearDateInput | SetDateValue | ClearDateValue | SetDateError | 
  ClearDateError | SetSrcInput | ClearSrcInput | SetSrcValue |
  ClearSrcValue | SetSrcError | ClearSrcError | SetSrcOpen;


export enum SrcType { None, Person, Business } //NO falsy values

// interface Inputs {
//   deptInput:string;
//   totalInput:string;
//   srcInput:string;
//   srcType:JournalEntrySourceType | null;
// }

// const inputs = (state:Inputs = {
//     deptInput:"",
//     totalInput:"",
//     srcInput:"",
//     srcType:null
//   }, action:Actions):Inputs => 
// {
//   switch(action.type) {
//     case SET_SRC_TYPE:{
//       const srcType = action.payload.srcType;
//       if(state.srcType !== srcType && srcType !== null) {
//         return {
//           ...state,
//           srcInput:"",
//           srcType
//         };
//       }
//       return state;
//     }
//     // case SET_SRC_INPUT:{
//     //   const srcInput = action.payload.srcInput.trimStart();
//     //   if(state.srcInput !== srcInput && srcInput){
//     //     return {
//     //       ...state,
//     //       srcInput
//     //     };
//     //   }
//     //   return state;
//     // }
//     case CLEAR_SRC_INPUT:
//       if(state.srcInput !== "") {
//         return {
//           ...state,
//           srcInput:""
//         };
//       }
//       return state;
//     default:
//       return state;
//   }

// }

// interface Values {
//   id:string | null;
//   date:InputValue<Date>
//   department:InputValue<string>[];
//   type:InputValue<string> | null;
//   paymentMethod:InputValue<string> | null;
//   total:InputValue<RationalInput> | null;
//   srcType:SrcType;
//   source:InputValue<JournalEntrySourceInput>[];
// }

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

const values = combineReducers({
  id:(state:string | null = null, action:Actions) => action.type === CREATE ?
    (action.payload.entryId || null) : state,
  date,
  srcType:(state:JournalEntrySourceType | null = null, action:Actions) => 
    action.type === SET_SRC_TYPE ? action.payload.srcType : state,
  source
  
});

/* const values = (state:Values = {
  id:null,
  date:{input:"", value:null, error:"" },
  department:[],
  type:{input:"", value:null, error:"" },
  paymentMethod:{input:"", value:null, error:"" },
  total:{input:"", value:null, error:""},
  srcType:SrcType.None,
  source:[]
}, action:Actions) => 
{

  switch(action.type) {
    case SET_DATE_INPUT:
      if(state.date.input !== action.payload.input) {
        return {
          ...state,

        }
      }
    default:
      return state;

  }

} */

interface Fields {
  id:string | null;
  date:Date | null;
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
  }, action:Actions):Fields =>
{
  switch(action.type) {
    case CREATE:
      return {...state, id:action.payload.entryId || null};
    case SET_SRC_TYPE:{
      const src = state.source[0] || null;
      if(src && src.sourceType !== action.payload.srcType) {
        return {
          ...state,
          source:[]
        };
      }
      return state;
    }
    case SET_SRC:
      if(!isEqual(state.source, action.payload.src)){
        return {
          ...state,
          source:[...action.payload.src]
        };
      }
      return state;
    case CLEAR_SRC:
      if(state.source.length > 0) {
        return {
          ...state,
          source:[]
        };
      }
      return state;
    default:
      return state;
  }
}

const id = (state:string = "", action:Actions) => 
  action.type === CREATE ? action.payload.upsertId : state;

const journalEntryUpsert = combineReducers({
  id,
  values,
  // inputs,
  fields
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
    
    case SET_SRC:
    case CLEAR_SRC:
    case SET_DATE_INPUT:
    case CLEAR_DATE_INPUT:
    case SET_DATE_VALUE:
    case CLEAR_DATE_VALUE:
    case SET_DATE_ERROR:
    case CLEAR_DATE_ERROR:
    case SET_SRC_TYPE:
    case SET_SRC_INPUT:
    case CLEAR_SRC_INPUT:
    case SET_SRC_VALUE:
    case CLEAR_SRC_VALUE:
    case SET_SRC_ERROR:
    case CLEAR_SRC_ERROR:
    case SET_SRC_OPEN:
      return reduceOneById(state, action);
    default:
      return state;
  }

}