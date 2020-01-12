
export class InputValue<T, Tnull> {
  input = "";
  value:T | Tnull;
  error:Error | null = null;
  constructor(nullValue:Tnull) {
    this.value = nullValue;
  }
}