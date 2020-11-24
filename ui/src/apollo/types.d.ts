import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

interface GetCacheKeyArg {
  __typename: string;
  id: string | number;
}

export interface Context {
  client: ApolloClient<Record<string, unknown>>;
  cache: InMemoryCache;
  getCacheKey<T extends GetCacheKeyArg>(arg: T): string;
}
