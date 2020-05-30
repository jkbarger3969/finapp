import {combineReducers} from "redux";

import {journalEntryUpserts} from "./journalEntryUpserts";
import {tableRows} from "./tableRows";
import {journal} from "./journal";

const root = combineReducers({
  journal,
  journalEntryUpserts,
  tableRows
});
export default root;

export type Root = ReturnType<typeof root>;