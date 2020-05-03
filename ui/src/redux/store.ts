import { configureStore } from "@reduxjs/toolkit";
// import { createStore, applyMiddleware } from "redux";
// import { composeWithDevTools } from "redux-devtools-extension";
// import thunk from "redux-thunk";

import root from "./reducers/root";

// const store = createStore(root, composeWithDevTools(
//   applyMiddleware(thunk)
// ));

const store = configureStore({
  reducer: root,
});

export type AppDispatch = typeof store.dispatch;
export default store;
