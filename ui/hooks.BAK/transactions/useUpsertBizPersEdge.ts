import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const BIZ_PERSON_EDGE_QUERY = gql`
  query UseUpsertBizPersEdge {
    bizEdge: edge(edge:{typename:"Business"}) {
      __typename
      id
      typename
    }
    personEdge: edge(edge:{typename:"Person"}) {
      __typename
      id
      typename
    }
  }
`;

const useUpsertBizPersEdge = function() {

  const {loading, error, data} = useQuery(BIZ_PERSON_EDGE_QUERY);

  return {loading, error, data};

}

export default useUpsertBizPersEdge;