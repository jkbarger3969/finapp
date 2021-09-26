import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloLink, HttpLink } from "@apollo/client";

const batchHttpLink = new BatchHttpLink({
  uri: "/graphql",
  credentials: "same-origin",
});

const httpLink = new HttpLink({
  uri: `ws://${window.location.host}/graphql`,
});

const link = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.error(`[Network error]: ${networkError}`);
  }),
  ApolloLink.split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return (
        def.kind === "OperationDefinition" && def.operation === "subscription"
      );
    },
    httpLink,
    batchHttpLink
  ),
]);

export default link;
