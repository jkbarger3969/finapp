import { useQuery, useApolloClient} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Object} from 'ts-toolbelt';

// import {UseTransUpsertSubmitStateQuery as UseUpsertSubmitStateQuery
// } from '../../apollo/graphTypes';

type UseUpsertSubmitStateQuery = any;
export type UseUpsertSubmitStateData = UseUpsertSubmitStateQuery;
export type UseUpsertSubmitStateWrite = 
  Object.Optional<UseUpsertSubmitStateData,
    keyof UseUpsertSubmitStateData, 'deep'>;
  
const UPSERT_TRANS_SUBMIT_STATE_QUERY = gql`
  query UseTransUpsertSubmitState { # Prefix Trans
    upsertTransactionLocal @client {
      status {
        submit
        submitError
        transDateError
        deptError
        typeError
        payMethodError
        totalError
        srcError
      },
      userInput {
        srcInput
        rootSrcEdge {
          edge : id
        }
      }
      fields {
        id
        transactionDate
        department {
          node : id
          edge
        }
        type {
          node : id
          edge
        }
        paymentMethod {
          node : id
          edge
        }
        total {
          num
          den
        }
        source {
          __typename
          ...on Business {
            node : id
            edge
          }
          ...on Department {
            node : id
            edge
          }
          ...on Person {
            node : id
            edge
          }
        }
      }
    }
  }
`;

const useUpsertSubmitState = function() {
  
  const client = useApolloClient();

  const {loading, error = null, data = null} 
    = useQuery<UseUpsertSubmitStateQuery>(UPSERT_TRANS_SUBMIT_STATE_QUERY);
  
  const writeToSubmitState = 
    (data:UseUpsertSubmitStateWrite) => client
      .writeData<UseUpsertSubmitStateWrite>({data});

  return [writeToSubmitState,{loading, error, data}] as const;

}

export default useUpsertSubmitState;