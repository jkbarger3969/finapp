import {useState} from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as namecase from 'namecase';

import { UseAddPersonMutation, UseAddPersonMutationVariables, PersonNameInput
} from '../../apollo/graphTypes';

const USE_ADD_PERSON_MUTATION = gql`
  mutation UseAddPerson($name:PersonNameInput!) {
    addPerson(name:$name) {
      __typename
      id
      edge
      name {
        first
        last
      }
    }
  }
`;

const useAddPerson = function() {
  
  const [error, setError] = useState<Error | typeof apolloError | null>(null);
  
  const [addPersonMutation, {loading, error:apolloError = null, data = null}] 
    = useMutation<UseAddPersonMutation, 
    UseAddPersonMutationVariables>(USE_ADD_PERSON_MUTATION);
  


  const addPerson = async (name:PersonNameInput) => {

    setError(null); //Ensure error is cleared before trying mutation

    const first = namecase(name.first.trim(),{individualFields:true});
    const last = namecase(name.last.trim(),{individualFields:true})

    if(!first) {
      
      const error = new Error("useAddPerson: First Name Required.");
      setError(error);
      throw error;

    } else if(!last) {
     
      const error = new Error("useAddPerson: Last Name Required.");
      setError(error);
      throw error;
    
    }

    const result = await addPersonMutation({
      variables:{
        name:{
          first,
          last
        }
      }
    });

    return result;

  }

  return <const>[addPerson, {loading, error:error || apolloError, data}];

}

export default useAddPerson;