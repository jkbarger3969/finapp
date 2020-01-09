import { ApolloClient } from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';


import cache from './inMemoryCache';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

export default new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    new BatchHttpLink({
      uri: '/graphql',
      credentials: 'same-origin',
    })
  ]),
  cache,
  typeDefs,
  resolvers
});