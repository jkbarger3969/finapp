import {Action} from "./types";

// Upsert Life cycle
export const CREATE = "journalEntryUpsert/CREATE";
export type Create = Action<typeof CREATE, {upsertId:string, entryId?:string}>;

export const CANCEL = "journalEntryUpsert/CANCEL";
export type Cancel = Action<typeof CANCEL, {upsertId:string}>;

export const SUBMIT = "journalEntryUpsert/SUBMIT";
export type Submit = Action<typeof SUBMIT, {upsertId:string}>;

export const CLEAR = "journalEntryUpsert/CLEAR";
export type Clear = Action<typeof CLEAR, {upsertId:string}>;

// Date
export const SET_DATE = "journalEntryUpsert/SET_DATE";
export type SetDate = Action<typeof SET_DATE,{upsertId:string, date:string}>;
export const CLEAR_DATE = "journalEntryUpsert/CLEAR_DATE";
export type ClearDate = Action<typeof CLEAR_DATE, {upsertId:string}>;

// Department
export const SEARCH_DEPT = "journalEntryUpsert/SEARCH_DEPT";
export type SearchDept 
  = Action<typeof SEARCH_DEPT,{upsertId:string, search:string}>;
export const CLEAR_SEARCH_DEPT = 
  "journalEntryUpsert/CLEAR_SEARCH_DEPT";
export type ClearSearchDept 
  = Action<typeof CLEAR_SEARCH_DEPT,{upsertId:string}>;

export const SET_DEPT = "journalEntryUpsert/SET_DEPT";
export const CLEAR_DEPT = "journalEntryUpsert/CLEAR_DEPT";

// Type
export const SET_TYPE = "journalEntryUpsert/SET_TYPE";
export const CLEAR_TYPE = "journalEntryUpsert/CLEAR_TYPE";

// Source
export const SET_SRC_TYPE = "journalEntryUpsert/SET_SRC_TYPE";
export const CLEAR_SRC_TYPE = "journalEntryUpsert/CLEAR_SRC_TYPE";

export const SEARCH_SRC = "journalEntryUpsert/SEARCH_SRC";
export const CLEAR_SEARCH_SRC = "journalEntryUpsert/CLEAR_SEARCH_SRC";

export const SET_SRC = "journalEntryUpsert/SET_SRC";
export const CLEAR_SRC = "journalEntryUpsert/CLEAR_SRC";

// Payment Method
export const SET_PAY_METHOD = "journalEntryUpsert/SET_PAY_METHOD";
export const CLEAR_PAY_METHOD = "journalEntryUpsert/CLEAR_PAY_METHOD";

// Total
export const SET_TOTAL = "journalEntryUpsert/SET_TOTAL";
export const CLEAR_TOTAL = "journalEntryUpsert/CLEAR_TOTAL";