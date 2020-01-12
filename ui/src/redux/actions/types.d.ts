import {ThunkAction} from "redux-thunk";
import {Action} from "redux";

import {Root} from "../reducers/root";

export type Thunk<A extends Action<any>, R = void> = 
  ThunkAction<R, Root, any, A>;