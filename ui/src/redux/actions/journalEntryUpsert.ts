import {batch} from "react-redux";

import {Thunk} from "./types";
import {JournalEntrySourceInput, JournalEntrySourceType,
  PeopleSrcOpts_1Query as PeopleSrcOptsQuery
} from "../../apollo/graphTypes";
import * as upsertActions from "../actionTypes/journalEntryUpsert";
import {getSrcInput} from "../selectors/journalEntryUpsert";

// Upsert Life cycle
export const create = (upsertId:string, entryId?:string):upsertActions.Create =>
({
    type:upsertActions.CREATE,
    payload:{upsertId, entryId}
});

export const cancel = (upsertId:string):upsertActions.Cancel => ({
  type:upsertActions.CANCEL,
  payload:{upsertId}
});

export const clear = (upsertId:string):upsertActions.Clear => ({
  type:upsertActions.CLEAR,
  payload:{upsertId}
});

// Date
export const setDateInput = (upsertId:string, input:string):
  upsertActions.SetDateInput => ({
    type:upsertActions.SET_DATE_INPUT,
    payload:{upsertId, input}
  });

export const clearDateInput = (upsertId:string):upsertActions.ClearDateInput =>
  ({
    type:upsertActions.CLEAR_DATE_INPUT,
    payload:{upsertId}
  });

export const setDateValue = (upsertId:string, value:Date):
  upsertActions.SetDateValue => ({
    type:upsertActions.SET_DATE_VALUE,
    payload:{upsertId, value}
  });

export const clearDateValue = (upsertId:string):upsertActions.ClearDateValue =>
  ({
    type:upsertActions.CLEAR_DATE_VALUE,
    payload:{upsertId}
  });

export const setDateError = (upsertId:string, error:Error):
  upsertActions.SetDateError => ({
    type:upsertActions.SET_DATE_ERROR,
    payload:{upsertId, error}
  });

export const clearDateError = (upsertId:string):upsertActions.ClearDateError =>
  ({
    type:upsertActions.CLEAR_DATE_ERROR,
    payload:{upsertId}
  });

//Type
export const setTypeValue = (upsertId:string, value:string)
  :upsertActions.SetTypeValue => ({
    type:upsertActions.SET_TYPE_VALUE,
    payload:{upsertId, value}
  });
export const clearTypeValue = (upsertId:string):upsertActions.ClearTypeValue => 
({
  type:upsertActions.CLEAR_TYPE_VALUE,
  payload:{upsertId}
});
// Department
export const searchDept = (upsertId:string, search:string):
  upsertActions.SearchDept => ({
    type:upsertActions.SEARCH_DEPT,
    payload:{ upsertId, search }
  });

export const clearSearchDept = (upsertId:string)
  :upsertActions.ClearSearchDept => ({
    type:upsertActions.CLEAR_SEARCH_DEPT,
    payload:{upsertId}
  });

// Source
export const setSrcType = (upsertId:string, srcType:JournalEntrySourceType)
  :upsertActions.SetSrcType => ({
    type:upsertActions.SET_SRC_TYPE,
    payload:{upsertId, srcType}
  });

export const clearSrcType = (upsertId:string):upsertActions.ClearSrcType => ({
  type:upsertActions.CLEAR_SRC_TYPE,
  payload:{upsertId}
});

export const setSrcInput = (upsertId:string, input:string)
  :upsertActions.SetSrcInput => ({
      type:upsertActions.SET_SRC_INPUT,
      payload:{ upsertId, input}
  });

export const clearSrcInput = (upsertId:string)
  :upsertActions.ClearSrcInput => ({
    type:upsertActions.CLEAR_SRC_INPUT,
    payload:{upsertId}
  });

export const setSrcValue = (upsertId:string, value:JournalEntrySourceInput[])
  :upsertActions.SetSrcValue => ({
      type:upsertActions.SET_SRC_VALUE,
      payload:{ upsertId, value}
  });

export const clearSrcValue = (upsertId:string)
  :upsertActions.ClearSrcValue => ({
    type:upsertActions.CLEAR_SRC_VALUE,
    payload:{upsertId}
  });

export const setSrcError = (upsertId:string, error:Error):
  upsertActions.SetSrcError => ({
    type:upsertActions.SET_SRC_ERROR,
    payload:{upsertId, error}
  });

export const clearSrcError = (upsertId:string):upsertActions.ClearSrcError => ({
  type:upsertActions.CLEAR_SRC_ERROR,
  payload:{upsertId}
});

export const setSrcValueAndClearInput = (upsertId:string,
  value:JournalEntrySourceInput[]):Thunk<any> => (dispatch) =>
{

  batch(() => {
    dispatch(clearSrcInput(upsertId));
    dispatch(setSrcValue(upsertId, value));
  });

}

export const setSrcOpen = (upsertId:string, open:boolean)
  :upsertActions.SetSrcOpen => ({
    type:upsertActions.SET_SRC_OPEN,
    payload:{upsertId, open}
  });