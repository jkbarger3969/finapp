import * as upsertActions from "../actionTypes/journalEntryUpsert";

export const create = (upsertId:string, entryId:string) => ({
    type:upsertActions.CREATE,
    payload:{upsertId, entryId}
} as upsertActions.Create);

export const cancel = (upsertId:string) => ({
  type:upsertActions.CANCEL,
  payload:{upsertId}
} as upsertActions.Cancel);

export const clear = (upsertId:string) => ({
  type:upsertActions.CLEAR,
  payload:{upsertId}
} as upsertActions.Clear);

export const setDate = (upsertId:string, date:Date) => ({
  type:upsertActions.SET_DATE,
  payload:{ upsertId, date:date.toISOString() }
} as upsertActions.SetDate);

// export const search