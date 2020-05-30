
export class InputValue<T, Tnull> {
  input = "";
  value:T | Tnull;
  error:Error | null = null;
  constructor(nullValue:Tnull) {
    this.value = nullValue;
  }
}

export const reduceOneById = <T, A>(state:T[], action:A, id:string,
  idKey:keyof T, reducer:(state:T, action:A) => T):T[] =>
{ 
  for(let i = 0, len = state.length; i < len; i++){
    const entry = state[i];
    if(entry[idKey as string] === id) {
      const newEntry = reducer(entry, action);
      if(newEntry !== entry) {
        return [
          ...state.slice(0, i),
          newEntry,
          ...state.slice(i + 1)
        ];
      } else {
        return state;
      }
    }
  }
  return state;
}