import {combineReducers} from "redux";

import {journalEntryUpserts} from "./journalEntryUpserts";

export const root = combineReducers({
  journalEntryUpserts
});

export type Root = ReturnType<typeof root>;