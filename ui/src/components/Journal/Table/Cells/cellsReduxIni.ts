import {namespace, uuid} from "../../../../utils/uuid";
import store from "../../../../redux/store";
import {create} from "../../../../redux/actions/tableRow";

export const ROW_ID = uuid("Journal", namespace);

export const DATE_ID = uuid("journal/date", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:DATE_ID,
  index:0,
  name:"Date",
  width:185
}));

export const DEPT_ID = uuid("journal/department", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:DEPT_ID,
  index:6,
  name:"Department",
  width:380
}));

export const CATEGORY_ID = uuid("journal/category", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:CATEGORY_ID,
  index:2,
  name:"Category",
  width:380
}));

export const SRC_ID = uuid("journal/source", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:SRC_ID,
  index:3,
  name:"Source",
  width:380
}));

export const PAY_METHOD_ID = uuid("journal/paymentMethod", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:PAY_METHOD_ID,
  index:4,
  name:"Payment Method",
  width:175
}));

export const DSCRPT_ID = uuid("journal/description", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:DSCRPT_ID,
  index:5,
  name:"Description",
  width:380
}));

export const TOTAL_ID = uuid("journal/total", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:TOTAL_ID,
  index:1,
  name:"Total",
  width:130
}));

export const RECONCILED_ID = uuid("journal/reconciled", namespace);
store.dispatch(create({
  rowId:ROW_ID,
  id:RECONCILED_ID,
  index:7,
  name:"Reconciled",
  width:105
}));
