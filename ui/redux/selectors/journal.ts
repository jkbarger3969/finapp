import {Root} from "../reducers/root";


export const isPABOpen = (state:Root, pabId:string):boolean => {
  return pabId in state.journal.pabs ? state.journal.pabs[pabId].open : false;
}