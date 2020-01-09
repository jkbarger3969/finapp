import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';

export type GetCacheKey = 
  (obj:{__typename:string, id:number | string, [key:string]:any}) => string

export interface Context {
  cache:InMemoryCache;
  client:ApolloClient;
  getCacheKey:GetCacheKey;
}