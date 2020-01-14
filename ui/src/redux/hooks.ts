import {useCallback, useMemo} from "react";
import {Action} from "redux";
import {useDispatch, batch} from "react-redux";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import isEqual from "lodash.isequal";

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

const globalDebounceDispatchState = {
  dispatchId:null as ReturnType<typeof setTimeout> | null,
  dispatchQueue:new Map<string, 
    [Action, ThunkDispatch<any, any, Action<any>>]>(),
  ms:5
};

export function useDebounceDispatch(global:true):
  <A extends Action<any>>(action: A) => void;
export function useDebounceDispatch(global:false, ms:number):
  <A extends Action<any>>(action: A) => void;
  export function useDebounceDispatch(global?:boolean, ms?:number):
  <A extends Action<any>>(action: A) => void;
export function useDebounceDispatch(global:boolean = true, ms = 5){

  const dispatch = useDispatch();

  const debounceDispatchState = useMemo(() => {
    return global ? globalDebounceDispatchState : {
      dispatchId:null as ReturnType<typeof setTimeout> | null,
      dispatchQueue:new Map<any,
        [Action, ThunkDispatch<any, any, Action<any>>]>(),
      ms
    }
  },[global, ms]);

  const debouchDispatch = useCallback(<A extends Action>(action:A) => {

    const thunk:ThunkAction<void, any, any, Action> = (dispatch) => {
      
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
  
      dispatchQueue.set(action.type, [action, dispatch]); 

    }

    dispatch(thunk);

  },[debounceDispatchState, dispatch]);

  return debouchDispatch;

}