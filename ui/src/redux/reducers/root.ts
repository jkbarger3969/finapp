import {combineReducers} from "redux";

import {journalEntryUpserts} from "./journalEntryUpserts";
import {tableRows} from "./tableRows";

const root = combineReducers({
  journalEntryUpserts,
  tableRows
});
export default root;

export type Root = ReturnType<typeof root>;