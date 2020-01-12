import {combineReducers} from "redux";

import {journalEntryUpserts} from "./journalEntryUpserts";

const root = combineReducers({
  journalEntryUpserts
});
export default root;

export type Root = ReturnType<typeof root>;