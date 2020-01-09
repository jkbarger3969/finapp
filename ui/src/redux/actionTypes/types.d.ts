import { Action as RAction} from "redux";

export type Action<Ttype, Tpayload = undefined>  = Tpayload extends undefined ?
  RAction<Ttype> : RAction<Ttype> & {payload:Tpayload};