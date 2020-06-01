const ACTION_TYPES:unique symbol = Symbol();
export default class ActionType extends String {
  
  constructor(type:string, namespace:string | null = null) {
  
    const actionType = namespace === null ? type : `${namespace}/${type}`;
    
    super(actionType);

    if(ActionType[ACTION_TYPES].has(actionType)) {
      throw new TypeError(`ActionType "${actionType}" already exists.  Serialized ActionTypes must be unique.`);
    }
    
  }
  private static [ACTION_TYPES] = new Set<string>();
}