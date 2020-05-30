import * as actions from "../actionTypes/journal";

export const createPAB = (pabId:string):actions.CreatePAB => ({
  type:actions.CREATE_PAB,
  payload:{
    pabId
  }
});

export const openPAB = (pabId:string):actions.OpenPAB => ({
  type:actions.OPEN_PAB,
  payload:{
    pabId
  }
});

export const closePAB = (pabId:string):actions.ClosePAB => ({
  type:actions.CLOSE_PAB,
  payload:{
    pabId
  }
});