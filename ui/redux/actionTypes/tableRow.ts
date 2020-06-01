import {Action} from "./types";
import {TableCellIni} from "../reducers/tableRows";

export const CREATE = "tableCells/CREATE";
export type Create = Action<typeof CREATE, TableCellIni>;

export const SET_INDEX = "tableCells/SET_INDEX";
export type SetIndex =
  Action<typeof SET_INDEX, {id:string, rowId:string, index:number}>;
export const SET_DEFAULT_INDEX = "tableCells/SET_DEFAULT_INDEX";
export type SetDefaultIndex =
  Action<typeof SET_DEFAULT_INDEX, {id:string, rowId:string}>;

export const SET_NAME = "tableCells/SET_NAME";
export type SetName =
  Action<typeof SET_NAME, {id:string, rowId:string, name:string}>;
export const SET_DEFAULT_NAME = "tableCells/SET_DEFAULT_NAME";
export type SetDefaultName =
  Action<typeof SET_DEFAULT_NAME, {id:string, rowId:string}>;

export const SET_WIDTH = "tableCells/SET_WIDTH";
export type SetWidth =
  Action<typeof SET_WIDTH, {id:string, rowId:string, width:number}>;
export const SET_DEFAULT_WIDTH = "tableCells/SET_DEFAULT_WIDTH";
export type SetDefaultWidth =
  Action<typeof SET_DEFAULT_WIDTH, {id:string, rowId:string}>;

export const COLLAPSE = "tableCells/COLLAPSE";
export type Collapse = Action<typeof COLLAPSE, {id:string, rowId:string}>;
export const EXPAND = "tableCells/EXPAND";
export type Expand = Action<typeof EXPAND, {id:string, rowId:string}>;

export const HIDE = "tableCells/HIDE";
export type Hide = Action<typeof HIDE, {id:string, rowId:string}>;
export const SHOW = "tableCells/SHOW";
export type Show = Action<typeof SHOW, {id:string, rowId:string}>;

export const RESTORE_DEFAULTS = "tableCells/RESTORE_DEFAULTS";
export type RestoreDefaults =
  Action<typeof RESTORE_DEFAULTS, {id:string, rowId:string}>;