import * as actions from "../actionTypes/tableRow";
import {TableCellIni} from "../reducers/tableRows";

export const create = (ini:TableCellIni):actions.Create => ({
  type:actions.CREATE,
  payload:ini
});

export const setIndex = (id:string, rowId:string, index:number)
  :actions.SetIndex => ({
    type:actions.SET_INDEX,
    payload:{id, rowId, index}
  });

export const setDefaultIndex = (id:string, rowId:string)
  :actions.SetDefaultIndex => ({
    type:actions.SET_DEFAULT_INDEX,
    payload:{id, rowId}
  });

export const setName = (id:string, rowId:string, name:string)
  :actions.SetName => ({
    type:actions.SET_NAME,
    payload:{id, rowId, name}
  });

export const setDefaultName = (id:string, rowId:string)
  :actions.SetDefaultName => ({
    type:actions.SET_DEFAULT_NAME,
    payload:{id, rowId}
  });

export const setWidth = (id:string, rowId:string, width:number)
  :actions.SetWidth => ({
    type:actions.SET_WIDTH,
    payload:{id, rowId, width}
  });

export const setDefaultWidth = (id:string, rowId:string)
  :actions.SetDefaultWidth => ({
    type:actions.SET_DEFAULT_WIDTH,
    payload:{id, rowId}
  });

export const collapse = (id:string, rowId:string)
  :actions.Collapse => ({
    type:actions.COLLAPSE,
    payload:{id, rowId}
  });

export const expand = (id:string, rowId:string)
  :actions.Expand => ({
    type:actions.EXPAND,
    payload:{id, rowId}
  });

export const show = (id:string, rowId:string)
  :actions.Show => ({
    type:actions.SHOW,
    payload:{id, rowId}
  });

export const hide = (id:string, rowId:string)
  :actions.Hide => ({
    type:actions.HIDE,
    payload:{id, rowId}
  });

export const restoreDefaults = (id:string, rowId:string)
  :actions.RestoreDefaults => ({
    type:actions.RESTORE_DEFAULTS,
    payload:{id, rowId}
  });