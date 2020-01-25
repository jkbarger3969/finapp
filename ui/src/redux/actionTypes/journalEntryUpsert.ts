import {Action} from "./types";
import {JournalEntrySourceInput, JournalEntrySourceType, RationalInput,
  JournalEntryCategoryType
} from "../../apollo/graphTypes";
import {SubmitStatus} from "../reducers/journalEntryUpserts";

type SetInputAction<A> = Action<A, {upsertId:string, input:string}>;
type SetValueAction<A, T> = Action<A, {upsertId:string, value:T}>;
type SetErrorAction<A> = Action<A, {upsertId:string, error:Error}>;
type ClearAction<A> = Action<A, {upsertId:string}>;

// Upsert Life cycle
export const CREATE = "journalEntryUpsert/CREATE";
export type Create = Action<typeof CREATE, {upsertId:string, entryId?:string}>;

export const CANCEL = "journalEntryUpsert/CANCEL";
export type Cancel = Action<typeof CANCEL, {upsertId:string}>;

export const CLEAR = "journalEntryUpsert/CLEAR";
export type Clear = ClearAction<typeof CLEAR>;

// Submit
export const SET_SUBMIT_STATUS = "journalEntryUpsert/SUBMIT";
export type SetSubmitStatus = 
  Action<typeof SET_SUBMIT_STATUS, {upsertId:string, status:SubmitStatus}>;

export const SET_SUBMIT_ERROR = "journalEntryUpsert/SET_SUBMIT_ERROR";
export type SetSubmitError = 
  Action<typeof SET_SUBMIT_ERROR, {upsertId:string, error:Error}>;

export const CLEAR_SUBMIT_ERROR = "journalEntryUpsert/CLEAR_SUBMIT_ERROR";
export type ClearSubmitError = 
  Action<typeof CLEAR_SUBMIT_ERROR, {upsertId:string}>;

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
export const SET_DEPT_INPUT = "journalEntryUpsert/SET_DEPT_INPUT";
export type SetDeptInput = SetInputAction<typeof SET_DEPT_INPUT>;

export const CLEAR_DEPT_INPUT = "journalEntryUpsert/CLEAR_DEPT_INPUT";
export type ClearDeptInput = ClearAction<typeof CLEAR_DEPT_INPUT>;

export const SET_DEPT_VALUE = "journalEntryUpsert/SET_DEPT_VALUE";
export type SetDeptValue = SetValueAction<typeof SET_DEPT_VALUE, string[]>;

export const CLEAR_DEPT_VALUE = "journalEntryUpsert/CLEAR_DEPT_VALUE";
export type ClearDeptValue = ClearAction<typeof CLEAR_DEPT_VALUE>;

export const SET_DEPT_ERROR = "journalEntryUpsert/SET_DEPT_ERROR";
export type SetDeptError = SetErrorAction<typeof SET_DEPT_ERROR>;

export const CLEAR_DEPT_ERROR = "journalEntryUpsert/CLEAR_DEPT_ERROR";
export type ClearDeptError = ClearAction<typeof CLEAR_DEPT_ERROR>;

export const SET_DEPT_OPEN = "journalEntryUpsert/SET_DEPT_OPEN";
export type SetDeptOpen = 
  Action<typeof SET_DEPT_OPEN, {upsertId:string, open:boolean}>;

// Category
export const SET_CAT_TYPE = "journalEntryUpsert/SET_CAT_TYPE";
export type SetCatType = Action<typeof SET_CAT_TYPE,{upsertId:string,
  catType:JournalEntryCategoryType}>;
export const CLEAR_CAT_TYPE = "journalEntryUpsert/CLEAR_CAT_TYPE";
export type ClearCatType = Action<typeof CLEAR_CAT_TYPE,{upsertId:string}>;

export const SET_CAT_INPUT = "journalEntryUpsert/SET_CAT_INPUT";
export type SetCatInput = SetInputAction<typeof SET_CAT_INPUT>;

export const CLEAR_CAT_INPUT = "journalEntryUpsert/CLEAR_CAT_INPUT";
export type ClearCatInput = ClearAction<typeof CLEAR_CAT_INPUT>;

export const SET_CAT_VALUE = "journalEntryUpsert/SET_CAT_VALUE";
export type SetCatValue = SetValueAction<typeof SET_CAT_VALUE, string>;

export const CLEAR_CAT_VALUE = "journalEntryUpsert/CLEAR_CAT_VALUE";
export type ClearCatValue = ClearAction<typeof CLEAR_CAT_VALUE>;

export const SET_CAT_ERROR = "journalEntryUpsert/SET_CAT_ERROR";
export type SetCatError = SetErrorAction<typeof SET_CAT_ERROR>;

export const CLEAR_CAT_ERROR = "journalEntryUpsert/CLEAR_CAT_ERROR";
export type ClearCatError = ClearAction<typeof CLEAR_CAT_ERROR>;

export const SET_CAT_OPEN = "journalEntryUpsert/SET_CAT_OPEN";
export type SetCatOpen = 
  Action<typeof SET_CAT_OPEN, {upsertId:string, open:boolean}>;

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

// Payment Method
export const SET_PAY_METHOD_VALUE = "journalEntryUpsert/SET_PAY_METHOD_VALUE";
export type SetPayMethodValue = 
  SetValueAction<typeof SET_PAY_METHOD_VALUE, string>;
export const CLEAR_PAY_METHOD_VALUE = 
  "journalEntryUpsert/CLEAR_PAY_METHOD_VALUE";
export type ClearPayMethodValue = ClearAction<typeof CLEAR_PAY_METHOD_VALUE>;

export const SET_PAY_METHOD_ERROR = "journalEntryUpsert/SET_PAY_METHOD_ERROR";
export type SetPayMethodError = SetErrorAction<typeof SET_PAY_METHOD_ERROR>;
export const CLEAR_PAY_METHOD_ERROR 
  = "journalEntryUpsert/CLEAR_PAY_METHOD_ERROR";
export type ClearPayMethodError = ClearAction<typeof CLEAR_PAY_METHOD_ERROR>;

// Description
export const SET_DSCRPT_VALUE = "journalEntryUpsert/SET_DSCRPT_VALUE";
export type SetDscrptValue = SetValueAction<typeof SET_DSCRPT_VALUE, 
  string>;

export const CLEAR_DSCRPT_VALUE = "journalEntryUpsert/CLEAR_DSCRPT_VALUE";
export type ClearDscrptValue = ClearAction<typeof CLEAR_DSCRPT_VALUE>;

// Total
export const SET_TOTAL_INPUT = "journalEntryUpsert/SET_TOTAL_INPUT";
export type SetTotalInput = SetInputAction<typeof SET_TOTAL_INPUT>;

export const CLEAR_TOTAL_INPUT = "journalEntryUpsert/CLEAR_TOTAL_INPUT";
export type ClearTotalInput = ClearAction<typeof CLEAR_TOTAL_INPUT>;

export const SET_TOTAL_VALUE = "journalEntryUpsert/SET_TOTAL_VALUE";
export type SetTotalValue = SetValueAction<typeof SET_TOTAL_VALUE, 
  RationalInput>;

export const CLEAR_TOTAL_VALUE = "journalEntryUpsert/CLEAR_TOTAL_VALUE";
export type ClearTotalValue = ClearAction<typeof CLEAR_TOTAL_VALUE>;

export const SET_TOTAL_ERROR = "journalEntryUpsert/SET_TOTAL_ERROR";
export type SetTotalError = SetErrorAction<typeof SET_TOTAL_ERROR>;

export const CLEAR_TOTAL_ERROR = "journalEntryUpsert/CLEAR_TOTAL_ERROR";
export type ClearTotalError = ClearAction<typeof CLEAR_TOTAL_ERROR>;

// Reconciled
export const SET_RECONCILED_VALUE = "journalEntryUpsert/SET_RECONCILED_VALUE";
export type SetReconciledValue =
  SetValueAction<typeof SET_RECONCILED_VALUE, boolean>;

export const CLEAR_RECONCILED_VALUE = 
  "journalEntryUpsert/CLEAR_RECONCILED_VALUE";
export type ClearReconciledValue = ClearAction<typeof CLEAR_RECONCILED_VALUE>;