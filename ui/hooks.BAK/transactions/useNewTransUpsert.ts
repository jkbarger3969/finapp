import {useState} from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Object} from 'ts-toolbelt';

import {Query, NewTransUpsertStatusQuery, UpsertTransSubmitStatusEnum
} from '../../apollo/graphTypes';

type UpsertTrans = Pick<Query, 'upsertTransactionLocal'>;
type UpsertTransactionWrite = Object
  .Optional<UpsertTrans, keyof UpsertTrans, 'deep'>;

const NEW_TRANS_UPSERT_QUERY = gql`
  query NewTransUpsertStatus {
    upsertTransactionLocal @client {
      fields {
        id
      }
    }
  }
`;

const useNewTransUpsert = function(id:string | null = null) {

  const [error, setError] = useState<Error | null>(null);

  const client = useApolloClient();

  const newTransUpsert = () => {

    const data = client.readQuery<NewTransUpsertStatusQuery>({
      query:NEW_TRANS_UPSERT_QUERY
    });

    // Do not overwrite current upsert transaction
    if(data && data.upsertTransactionLocal) {
      setError(new Error("Cannot overwrite current Transaction upsert."));
      return false;
    }

    client.writeData<UpsertTransactionWrite>({
      data:{
        upsertTransactionLocal:{
          status:{
            submit:UpsertTransSubmitStatusEnum.NotSubmitted,
            submitError:null,
            transDateError:null,
            deptError:null,
            typeError:null,
            payMethodError:null,
            totalError:null,
            srcError:null
          },
          userInput:{
            deptInput:null,
            totalInput:null,
            srcInput:null,
            rootSrcEdge:null,
          },
          fields:{
            id,
            transactionDate:null,
            department:null,
            type:null,
            paymentMethod:null,
            total:null,
            source:null
          }
        }
      }
    });

    return true;

  }

  

  return <const>[newTransUpsert, {error}];

}

export default useNewTransUpsert;