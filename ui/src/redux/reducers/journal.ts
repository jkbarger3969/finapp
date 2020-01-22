import {combineReducers} from "redux";

import {CREATE_PAB, CreatePAB, OPEN_PAB, OpenPAB, CLOSE_PAB, ClosePAB
} from "../actionTypes/journal";

type Actions = CreatePAB | OpenPAB | ClosePAB;

const pab = (state = {open:false}, action:Actions) => {

  switch(action.type) {
    case OPEN_PAB:
      return state.open === true ? state : {...state, open:true};
    case CLOSE_PAB:
      return state.open === false ? state : {...state, open:false};
    default:
    return state;
  }

}

export type PAB = ReturnType<typeof pab>;

interface PABs {
  [key:string]:PAB
}

export const pabs = (state:PABs = {}, action:Actions) => {

  switch(action.type) {
    case CREATE_PAB:
      // Create ONLY once
      if(action.payload.pabId in state) {
        return state;
      }
      return {...state, [action.payload.pabId]:pab(undefined, action)}
    case OPEN_PAB:
    case CLOSE_PAB:
      if(action.payload.pabId in state) {
        const {pabId} = action.payload;
        const curPAB = state[pabId];
        const newPAB = pab(curPAB, action);
        return curPAB === newPAB ? state : {...state, [pabId]:newPAB}
      }
      return state;
    default:
      return state;

  }

}

export const journal = combineReducers({
  pabs
});

export type Journal = typeof journal;