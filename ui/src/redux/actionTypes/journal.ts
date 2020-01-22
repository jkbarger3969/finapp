import {Action} from "./types";

export const CREATE_PAB = "journal/CREATE_PAB";
export type CreatePAB = Action<typeof CREATE_PAB, {pabId:string}>;

export const OPEN_PAB = "journal/OPEN_PAB";
export type OpenPAB = Action<typeof OPEN_PAB, {pabId:string}>;

export const CLOSE_PAB = "journal/CLOSE_PAB";
export type ClosePAB = Action<typeof CLOSE_PAB, {pabId:string}>;