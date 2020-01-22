import { BatchHttpLink } from 'apollo-link-batch-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { getMainDefinition } from 'apollo-utilities';

const batchHttpLink = new BatchHttpLink({
  uri: '/graphql',
  credentials: 'same-origin',
});

const wsLink = new WebSocketLink({
  uri: `ws://${window.location.host}/graphql`,
  options: {
    reconnect: true
  }
});

const link = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }),
  ApolloLink.split(({query}) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition'
      && def.operation === 'subscription';
  },wsLink, batchHttpLink)

]);

export default link;