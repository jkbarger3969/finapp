import { ApolloClient } from "apollo-client";

import cache from "./inMemoryCache";
import resolvers from "./resolvers";
import link from "./link";

export default new ApolloClient({
  link,
  cache,
  resolvers,
});
