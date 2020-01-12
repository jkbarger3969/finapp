import {Action} from "./types";
import {JournalEntrySourceInput, JournalEntrySourceType
} from "../../apollo/graphTypes";

type SetInputAction<A> = Action<A, {upsertId:string, input:string}>;
type SetValueAction<A, T> = Action<A, {upsertId:string, value:T}>;
type SetErrorAction<A> = Action<A, {upsertId:string, error:Error}>;
type ClearAction<A> = Action<A, {upsertId:string}>;

// Upsert Life cycle
export const CREATE = "journalEntryUpsert/CREATE";
export type Create = Action<typeof CREATE, {upsertId:string, entryId?:string}>;

export const CANCEL = "journalEntryUpsert/CANCEL";
export type Cancel = Action<typeof CANCEL, {upsertId:string}>;

export const SUBMIT = "journalEntryUpsert/SUBMIT";
export type Submit = Action<typeof SUBMIT, {upsertId:string}>;

export const CLEAR = "journalEntryUpsert/CLEAR";
export type Clear = ClearAction<typeof CLEAR>;

// Date
export const SET_DATE_INPUT = "journalEntryUpsert/SET_DATE_INPUT";
export type SetDateInput = SetInputAction<typeof SET_DATE_INPUT>;

export const CLEAR_DATE_INPUT = "journalEntryUpsert/CLEAR_DATE_INPUT";
export type ClearDateInput = ClearAction<typeof CLEAR_DATE_INPUT>;

export const SET_DATE_VALUE = "journalEntryUpsert/SET_DATE_VALUE";
export type SetDateValue = SetValueAction<typeof SET_DATE_VALUE, Date>;

export const CLEAR_DATE_VALUE = "journalEntryUpsert/CLEAR_DATE_VALUE";
export type ClearDateValue = ClearAction<typeof CLEAR_DATE_VALUE>;

export const SET_DATE_ERROR = "journalEntryUpsert/SET_DATE_ERROR";
export type SetDateError = SetErrorAction<typeof SET_DATE_ERROR>;

export const CLEAR_DATE_ERROR = "journalEntryUpsert/CLEAR_DATE_ERROR";
export type ClearDateError = ClearAction<typeof CLEAR_DATE_ERROR>;

// Department

export const SEARCH_DEPT = "journalEntryUpsert/SEARCH_DEPT";
export type SearchDept = 
  Action<typeof SEARCH_DEPT, {upsertId:string, search:string}>;
export const CLEAR_SEARCH_DEPT = 
  "journalEntryUpsert/CLEAR_SEARCH_DEPT";
export type ClearSearchDept =
  Action<typeof CLEAR_SEARCH_DEPT, {upsertId:string}>;

export const SET_DEPT = "journalEntryUpsert/SET_DEPT";
export const CLEAR_DEPT = "journalEntryUpsert/CLEAR_DEPT";

// Type
export const SET_TYPE = "journalEntryUpsert/SET_TYPE";
export const CLEAR_TYPE = "journalEntryUpsert/CLEAR_TYPE";

// Source
export const SET_SRC_TYPE = "journalEntryUpsert/SET_SRC_TYPE";
export type SetSrcType =
  Action<typeof SET_SRC_TYPE,{upsertId:string, srcType:JournalEntrySourceType}>;
export const CLEAR_SRC_TYPE = "journalEntryUpsert/CLEAR_SRC_TYPE";
export type ClearSrcType = Action<typeof CLEAR_SRC_TYPE,{upsertId:string}>;

export const SET_SRC_INPUT = "journalEntryUpsert/SET_SRC_INPUT";
export type SetSrcInput = SetInputAction<typeof SET_SRC_INPUT>;

export const CLEAR_SRC_INPUT = "journalEntryUpsert/CLEAR_SRC_INPUT";
export type ClearSrcInput = ClearAction<typeof CLEAR_SRC_INPUT>;

export const SET_SRC_VALUE = "journalEntryUpsert/SET_SRC_VALUE";
export type SetSrcValue = SetValueAction<typeof SET_SRC_VALUE, 
  JournalEntrySourceInput[]>;

export const CLEAR_SRC_VALUE = "journalEntryUpsert/CLEAR_SRC_VALUE";
export type ClearSrcValue = ClearAction<typeof CLEAR_SRC_VALUE>;

export const SET_SRC_ERROR = "journalEntryUpsert/SET_SRC_ERROR";
export type SetSrcError = SetErrorAction<typeof SET_SRC_ERROR>;

export const CLEAR_SRC_ERROR = "journalEntryUpsert/CLEAR_SRC_ERROR";
export type ClearSrcError = ClearAction<typeof CLEAR_SRC_ERROR>;

export const SET_SRC_OPEN = "journalEntryUpsert/SET_SRC_OPEN";
export type SetSrcOpen = 
  Action<typeof SET_SRC_OPEN, {upsertId:string, open:boolean}>;


// export const SET_SRC_INPUT = "journalEntryUpsert/SET_SRC_INPUT";
// export type SetSrcInput =
//   Action<typeof SET_SRC_INPUT,{upsertId:string, srcInput:string}>;
// export const CLEAR_SRC_INPUT = "journalEntryUpsert/CLEAR_SRC_INPUT";
// export type ClearSrcInput =
//   Action<typeof CLEAR_SRC_INPUT, {upsertId:string}>;

export const SET_SRC = "journalEntryUpsert/SET_SRC";
export type SetSrc =
  Action<typeof SET_SRC,{upsertId:string, src:JournalEntrySourceInput[]}>;
export const CLEAR_SRC = "journalEntryUpsert/CLEAR_SRC";
export type ClearSrc = Action<typeof CLEAR_SRC, {upsertId:string}>;

// Payment Method
export const SET_PAY_METHOD = "journalEntryUpsert/SET_PAY_METHOD";
export const CLEAR_PAY_METHOD = "journalEntryUpsert/CLEAR_PAY_METHOD";

// Total
export const SET_TOTAL = "journalEntryUpsert/SET_TOTAL";
export const CLEAR_TOTAL = "journalEntryUpsert/CLEAR_TOTAL";