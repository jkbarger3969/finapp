import useAddTransaction from './useAddTransaction'
import useUpsertSubmitState from './useUpsertSubmitState';



export enum InputSubmitStatus {
  NoActive,
  UpdateInvalid,
  AddInvalid,
  UpdateReady,
  AddReady
}

const useTransUpsertSubmit = function() {

  const [,{
    loading:submitStateLoading,
    error:submitStateError,
    data:submitStateData
  }] = useUpsertSubmitState();
  
  const [addTransaction, {
    loading:addTransLoading,
    error:addTransError,
    data:upsertedTransaction
  }] = useAddTransaction();

  const {upsertTransactionLocal = null} = submitStateData || {};
  const {fields = null, userInput = null} = upsertTransactionLocal || {};
  const {id = null, transactionDate = null, department = null, type = null,
    paymentMethod = null, total = null, source = null} = fields || {}; 
  const {srcInput = null, rootSrcEdge = null} = userInput || {};
  
  let status:InputSubmitStatus | null = null;
  
  // No active transaction upsert
  if(!upsertTransactionLocal) {
    status = InputSubmitStatus.NoActive;
  } else if(id) {
    if(transactionDate ||  department || type || paymentMethod || total ||
      source || srcInput)
    {
      status = InputSubmitStatus.UpdateReady;
    } else {
      status = InputSubmitStatus.UpdateInvalid;
    }
  } else {
    if(transactionDate &&  department && type && paymentMethod && total &&
      (source || (srcInput && rootSrcEdge)))
    {
      status = InputSubmitStatus.AddReady;
    } else {
      status = InputSubmitStatus.AddInvalid;
    }
  }

  return [()=>addTransaction(), {
    loading: submitStateLoading || addTransLoading,
    error: submitStateError || addTransError,
    status, 
    upsertedTransaction
  }] as const;

}

export default useTransUpsertSubmit;