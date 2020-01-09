import { InMemoryCache, IntrospectionFragmentMatcher } 
  from 'apollo-cache-inmemory';

import localState from './localStateInI';
import introspectionQueryResultData from './fragmentTypes.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});

const inMemoryCache = new InMemoryCache({fragmentMatcher, addTypename:false});

inMemoryCache.writeData({data:{...localState}});

export default inMemoryCache;