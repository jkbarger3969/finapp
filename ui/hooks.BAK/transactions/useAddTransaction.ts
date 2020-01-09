import { useState } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {parseFullName} from 'parse-full-name';

import useUpsertSubmitState  from './useUpsertSubmitState';
import useUpsertBizPersEdge  from './useUpsertBizPersEdge';
import useClearTransUpsert from './useClearTransUpsert';
import useNewTransUpsert from './useNewTransUpsert';
import useAddPerson from '../people/useAddPerson';
/* import {TransactionAddFieldsInput,
  UpsertTransSubmitStatusEnum, UseAddTransactionMutation,
  UseAddTransactionMutationVariables} from '../../apollo/graphTypes'; */

type TransactionAddFieldsInput = any;
type UpsertTransSubmitStatusEnum = any;
type UseAddTransactionMutation = any;
type UseAddTransactionMutationVariables = any;
  

const ADD_TRANSACTION = gql`
  mutation UseAddTransaction($fields:TransactionAddFieldsInput!) {
    addTransaction(fields:$fields) {
      __typename
      id
      department {
        __typename
        id
        name
      }
      type {
        __typename
        id
        type
      }
      paymentMethod {
        __typename
        id
        method
      }
      total {
        num
        den
      }
      source {
        ...on Person {
          __typename
          id
          name {
            first
            last
          }
        }
        ...on Business {
          __typename
          id
          bizName : name
        }
        ...on Department {
          __typename
          id
          deptName: name
        }
      }
      date
    }
  }
`;

const useAddTransaction = function(addAndStartNew:boolean = false) {
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<UseAddTransactionMutation | null>(null);

  const client = useApolloClient();
  
  const {
    loading:bizPersEdgeLoading,
    error:bizPersEdgeError,
    data:bizPersEdgeData
  } = useUpsertBizPersEdge();
  
  const [writeToUseUpsertTrans, {
    loading:submitStateLoading,
    error:submitStateError,
    data:submitStateData
  }] = useUpsertSubmitState();
  
  const [addPersonMutation] = useAddPerson();

  const [clearTransUpsert] = useClearTransUpsert();

  const [newTransUpsert, {error:newTransUpsertError}] = useNewTransUpsert();
  
  const addTransaction = async () => {

    try {

      const { bizEdge = null,  personEdge = null } = bizPersEdgeData;
      const {id:personEdgeId = null} = personEdge || {};
      const {id:bizEdgeId = null} = bizEdge || {};

      const {upsertTransactionLocal = null} = submitStateData || {};
      const {userInput = null, fields = null, status = null}
        = upsertTransactionLocal || {};
      const {rootSrcEdge = null, srcInput = null} = userInput || {};
      const {edge:rootSrcEdgeId = null} = rootSrcEdge || {};
      const {transactionDate = null, department = null, type = null, 
        paymentMethod = null, total = null, source = null} = fields || {};
      const {submit:submitStatus = null} = status || {};
      
      // Do not attempt to submit more than once concurrently
      if(submitStatus !== UpsertTransSubmitStatusEnum.NotSubmitted) {
        throw new Error("Add transaction in progress.");
      }

      setError(null);
      setLoading(true);

      writeToUseUpsertTrans({
        upsertTransactionLocal:{
          status:{
            submit:UpsertTransSubmitStatusEnum.Submitting
          }
        }
      });
      

      
      // Build payload and ensure all required fields
      const payloadFields = <TransactionAddFieldsInput>{};
      let missingFields = "";
      // Capture all missing field errors
      const missingFieldErrors:
        Omit<Partial<NonNullable<typeof status>>,'submit' | 'submitError'> = {}; 
      if(transactionDate) {
        payloadFields.transactionDate = transactionDate;
      } else {
        const msg = "Date Required";
        missingFieldErrors.transDateError = msg;
        missingFields = `${missingFields} ${msg}.`;
      }
      if(department) {
        const dept = department[department.length  -1];
        payloadFields.department = {
          edge:dept.edge,
          node:dept.node
        };
      } else {
        const msg = "Department Required";
        missingFieldErrors.deptError = msg;
        missingFields = `${missingFields} ${msg}.`;
      }
      if(type) {
        payloadFields.type = {
          edge:type.edge,
          node:type.node
        };
      } else {
        const msg = "Type Required";
        missingFieldErrors.typeError = msg;
        missingFields = `${missingFields} ${msg}.`;
      }
      if(paymentMethod) {
        payloadFields.paymentMethod = {
          edge:paymentMethod.edge,
          node:paymentMethod.node
        };
      } else {
        const msg = "Payment Method Required"
        missingFieldErrors.payMethodError = msg;
        missingFields = `${missingFields} ${msg}.`;
      }
      if(total) {
        payloadFields.total = total;
      } else {
        const msg = "Total Required";
        missingFieldErrors.totalError = msg;
        missingFields = `${missingFields} ${msg}.`;
      }
      // Source is NOT added to payloadFields here due to it's, 
      // add new person behavior
      if(!source && !srcInput) {
        const msg = "Source Required";
        missingFieldErrors.srcError = msg;
        missingFields = `${missingFields} ${msg}.`;
      }
      
      if(missingFields = missingFields.trim()) {
        writeToUseUpsertTrans({
          upsertTransactionLocal:{
            status:{
              ...missingFieldErrors
            }
          }
        });
        throw new Error(`Missing Required Fields: ${missingFields}`);
      }

      // Add source to payloadFields
      if(source) {
        
        const srcVal = source[source.length - 1];
        payloadFields.source = {
          edge:srcVal.edge,
          node:srcVal.node
        };

      // Create new source and add to payloadFields
      } else  {

        // Create new person
        if(rootSrcEdgeId === personEdgeId) {

          let {first, last} = parseFullName(srcInput);
          first = first.trim();
          last = first.trim();

          if(!first) {
          
            const msg = "First Name Required";
            writeToUseUpsertTrans({
              upsertTransactionLocal:{
                status:{
                  srcError:msg
                }
              }
            });
            throw new Error(`Missing Required Fields: ${msg}`);
          
          } else if(!last) {
          
            const msg = "Last Name Required";
            writeToUseUpsertTrans({
              upsertTransactionLocal:{
                status:{
                  srcError:msg
                }
              }
            });
            throw new Error(`Missing Required Fields: ${msg}`);
          
          }

          const addPersonResult = await addPersonMutation({first, last});

          const {addPerson = null} = addPersonResult.data || {};
          const {id:node = "", edge = ""} = addPerson || {};

          writeToUseUpsertTrans({
            upsertTransactionLocal:{
              userInput:{
                srcInput:null
              },
              fields:{
                source:[<NonNullable<typeof addPerson>>addPerson]
              }
            }
          });

          payloadFields.source = {edge, node};

        // Create new business
        } else if (rootSrcEdgeId === bizEdgeId) {

          // TODO: implement addBusiness mutation

        } else {
          const msg = "Unable to verify source.";
          writeToUseUpsertTrans({
            upsertTransactionLocal:{
              status:{
                submitError:msg
              }
            }
          });
          throw new Error(msg);
        
        }

      }

      const addTransactionResult = await client.mutate<
        UseAddTransactionMutation, UseAddTransactionMutationVariables>
      ({
        mutation:ADD_TRANSACTION,
        variables:{
          fields:payloadFields
        }
      });

      if(addTransactionResult.data) {
        
        clearTransUpsert();
        
        if(addAndStartNew) {
          newTransUpsert();
        }

        setData(addTransactionResult.data);
        setLoading(false);
      
      } else {

        throw new Error("Cannot confirm transaction was submitted.");

      }

    } catch(error) {

      writeToUseUpsertTrans({
        upsertTransactionLocal:{
          status:{
            submitError:
              error && 'message' in error 
                ? error.message : "Failed to add transaction.",
            submit:UpsertTransSubmitStatusEnum.NotSubmitted,
          }
        }
      });

      setLoading(false);
      setData(null);
      setError(error);

    }

  }

  return [addTransaction, {
    loading: loading || bizPersEdgeLoading || submitStateLoading,
    error:error || bizPersEdgeError || submitStateError || newTransUpsertError, 
    data
  }] as const;

}

export default useAddTransaction;