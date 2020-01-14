import {useCallback, useMemo} from "react";
import {Action} from "redux";
import {useDispatch, batch} from "react-redux";
import {ThunkAction, ThunkDispatch} from "redux-thunk";

import {Thunk} from "./actions/types";

export const useBatchDispatch = () => {

  const dispatch = useDispatch();

  const batchDispatch = useCallback(<Actions extends Action[]>(
    batchActions:Actions) => 
  {
    
    const thunk:ThunkAction<void, any, any, Action> = (dispatch) => {
      
      batch(()=>{
        for(const action of batchActions) {
          dispatch(action);
        }
      });
  
    }
    
    dispatch(thunk);

  },[dispatch]);
  
  return batchDispatch;

}

export type DebounceA = Action<any> | Thunk<any, any>;

const globalDebounceDispatchState = {
  dispatchId:null as ReturnType<typeof setTimeout> | null,
  dispatchQueue:new Map<string | symbol,
    [DebounceA, ThunkDispatch<any, any, any>]>(),
  ms:5
};

export function useDebounceDispatch(global:true):
  <A extends DebounceA>(action: A) => void;
export function useDebounceDispatch(global:false, ms:number):
  <A extends DebounceA>(action: A) => void;
  export function useDebounceDispatch(global?:boolean, ms?:number):
  <A extends DebounceA>(action: A) => void;
export function useDebounceDispatch(global:boolean = true, ms = 5){

  const dispatch = useDispatch();

  const debounceDispatchState = useMemo(() => {
    return global ? globalDebounceDispatchState : {
      dispatchId:null as ReturnType<typeof setTimeout> | null,
      dispatchQueue:new Map<string | symbol,
        [DebounceA, ThunkDispatch<any, any, any>]>(),
      ms
    }
  },[global, ms]);

  const debouchDispatch = useCallback(<A extends DebounceA>(action:A) => {

    const thunk:ThunkAction<void, any, any, any> = (dispatch) => {
      
      const {dispatchQueue} = debounceDispatchState;

      if(debounceDispatchState.dispatchId === null) {
        
        debounceDispatchState.dispatchId = setTimeout(() => {
  
          debounceDispatchState.dispatchId = null;
          
          batch(()=>{
            for(const [action, dispatch] of dispatchQueue.values()) {
              dispatch(action);
            }
          });
          
          dispatchQueue.clear();
  
        }, debounceDispatchState.ms);
      
      }
      
      const key = typeof action === "function" ? Symbol() : 
        (action as any)?.type as string;

      dispatchQueue.set(key, [action, dispatch]); 

    }

    dispatch(thunk);

  },[debounceDispatchState, dispatch]);

  return debouchDispatch;

}