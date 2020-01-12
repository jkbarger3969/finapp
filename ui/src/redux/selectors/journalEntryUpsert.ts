import {Root} from "../reducers/root";
import {JournalEntryUpsert} from "../reducers/journalEntryUpserts";
import {JournalEntrySourceInput, JournalEntrySourceType
} from "../../apollo/graphTypes";

const getEntry = (state:Root, upsertId:string):JournalEntryUpsert | null => {
  for(const entry of state.journalEntryUpserts) {
    if(entry.id === upsertId) {
      return entry;
    }
  }
  return null;
}

export const getDate = (state:Root, upsertId:string):Date | null => {
  return getEntry(state, upsertId)?.values.date.value || null;
}

export const isRequired = (state:Root, upsertId:string):boolean => {
  return !(getEntry(state, upsertId)?.values.id);
}

export const getType = (state:Root, upsertId:string):string | null => {
  return getEntry(state, upsertId)?.values.type.value || null;
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