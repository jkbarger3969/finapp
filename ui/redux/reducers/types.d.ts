export interface InputValue<T, Tnull = null> {
  input:string;
  value:T | Tnull;
  error:Error | null;
}