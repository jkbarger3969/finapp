import {Root} from "../reducers/root";
import {JournalEntryUpsert, SubmitStatus
} from "../reducers/journalEntryUpserts";
import {JournalEntrySourceInput, JournalEntrySourceType, RationalInput
} from "../../apollo/graphTypes";

const getEntry = (state:Root, upsertId:string):JournalEntryUpsert | null => {
  for(const entry of state.journalEntryUpserts) {
    if(entry.id === upsertId) {
      return entry;
    }
  }
  return null;
}

export enum UpsertType {
  Add,
  Update
}

export const getUpsertType = (state:Root, upsertId:string):UpsertType | null =>
{
  const id = getEntry(state, upsertId)?.values.id;
  if(id === undefined) {
    return null;
  } else if(id === null) {
    return UpsertType.Add;
  } else {
    return UpsertType.Update;
  }
}

export const getSubmitStatus = (state:Root, upsertId:string)
  :SubmitStatus | null => 
{
  return getEntry(state, upsertId)?.submit.status ?? null;
}

export const getSubmitError = (state:Root, upsertId:string):Error | null => {
  return getEntry(state, upsertId)?.submit.error || null;
}

export const isRequired = (state:Root, upsertId:string):boolean => {
  return !(getEntry(state, upsertId)?.values.id);
}

export const getDeptInput = (state:Root, upsertId:string):string => {
  return getEntry(state, upsertId)?.values.department.input || "";
}

export const getDeptChain = (state:Root, upsertId:string)
  :string[] => 
{
  return getEntry(state, upsertId)?.values.department.value || [];
}

export const getDept = (state:Root, upsertId:string)
  :string | null => 
{
  const deptChain = getDeptChain(state, upsertId);
  const len = deptChain.length;
  return len > 0 ? deptChain[len - 1] : null;
}

export const getDeptError = (state:Root, upsertId:string):Error | null => {
  return getEntry(state, upsertId)?.values.department.error || null;
}

export const isDeptOpen = (state:Root, upsertId:string):boolean => {
  return getEntry(state, upsertId)?.values.department.open || false;
}

export const getDate = (state:Root, upsertId:string):Date | null => {
  return getEntry(state, upsertId)?.values.date.value || null;
}

export const getDateError = (state:Root, upsertId:string):Error | null => {
  return getEntry(state, upsertId)?.values.date.error || null;
}

export const getType = (state:Root, upsertId:string):string => {
  return getEntry(state, upsertId)?.values.type.value || "";
}

export const getTypeError = (state:Root, upsertId:string):Error | null => {
  return getEntry(state, upsertId)?.values.type.error || null;
}

export const getPayMethod = (state:Root, upsertId:string):string => {
  return getEntry(state, upsertId)?.values.paymentMethod.value || "";
}

export const getPayMethodError = (state:Root, upsertId:string):Error | null => {
  return getEntry(state, upsertId)?.values.paymentMethod.error || null;
}

export const getSrcType = (state:Root, upsertId:string)
  :JournalEntrySourceType | null => 
{
  return getEntry(state, upsertId)?.values.srcType || null;
}

export const getSrcInput = (state:Root, upsertId:string):string => {
  return getEntry(state, upsertId)?.values.source.input || "";
}

export const getSrcChain = (state:Root, upsertId:string)
  :JournalEntrySourceInput[] => 
{
  return getEntry(state, upsertId)?.values.source.value || [];
}

export const getSrc = (state:Root, upsertId:string)
  :JournalEntrySourceInput | null => 
{
  const srcChain = getSrcChain(state, upsertId);
  const len = srcChain.length;
  return len > 0 ? srcChain[len - 1] : null;
}

export const isSrcOpen = (state:Root, upsertId:string):boolean => {
  return getEntry(state, upsertId)?.values.source.open || false;
}

export const getSrcError = (state:Root, upsertId:string):Error | null => {
  return getEntry(state, upsertId)?.values.source.error || null;
}

export const getTotalInput = (state:Root, upsertId:string):string => {
  return getEntry(state, upsertId)?.values.total.input || "";
}

export const getTotalValue = (state:Root, upsertId:string)
  :RationalInput | null => 
{
  return getEntry(state, upsertId)?.values.total.value || null;
}

export const getTotalError = (state:Root, upsertId:string)
  :Error | null => 
{
  return getEntry(state, upsertId)?.values.total.error || null;
}

export const getDscrptValue = (state:Root, upsertId:string):string | null => {
  return getEntry(state, upsertId)?.values.description.value || null;
}

export const getReconciledValue = (state:Root, upsertId:string):boolean => {
  return getEntry(state, upsertId)?.values.reconciled.value || false;
}