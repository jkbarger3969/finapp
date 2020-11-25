import {
  InMemoryCache,
  // IntrospectionFragmentMatcher,
} from "@apollo/client";

import fragmentTypes from "./fragmentTypes.json";

// const fragmentMatcher = new IntrospectionFragmentMatcher({
//   introspectionQueryResultData,
// });

const inMemoryCache = new InMemoryCache({
  ...fragmentTypes,
  addTypename: true,
});

export default inMemoryCache;
