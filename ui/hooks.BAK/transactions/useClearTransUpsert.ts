import { useApolloClient } from '@apollo/react-hooks';
import {Object} from 'ts-toolbelt';

import {Query} from '../../apollo/graphTypes';

type UpsertTrans = Pick<Query, 'upsertTransactionLocal'>;
type UpsertTransactionWrite = Object
  .Optional<UpsertTrans, keyof UpsertTrans, 'deep'>;

const useClearTransUpsert = function(){

  const client = useApolloClient();

  return [()=>client.writeData<UpsertTransactionWrite>({
    data:{
      upsertTransactionLocal:null
    }
  })];

} 

export default useClearTransUpsert;