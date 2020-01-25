import Fraction from 'fraction.js';
import { ApolloClient } from "apollo-client";
import {batch} from "react-redux";
import {parseFullName} from "parse-full-name";
import gql from "graphql-tag";

import {Thunk} from "./types";
import {JournalEntrySourceInput, JournalEntrySourceType,
  JournalEntryCategoryType,
  AddPerson_1Mutation as AddPerson,
  AddPerson_1MutationVariables as AddPersonVars,
  AddJournalEntry_2Mutation as AddJournalEntry,
  AddJournalEntry_2MutationVariables as AddJournalEntryVars,
  AddBusiness_1Mutation as AddBusiness,
  AddBusiness_1MutationVariables as AddBusinessVars,
  CheckValidVendor_1Query as CheckValidVendor,
  CheckValidVendor_1QueryVariables as CheckValidVendorVars

} from "../../apollo/graphTypes";
import {SubmitStatus} from "../reducers/journalEntryUpserts";
import * as upsertActions from "../actionTypes/journalEntryUpsert";
import * as selectors from "../selectors/journalEntryUpsert";

// Upsert Life cycle
export const create = (upsertId:string, entryId?:string)
  :Thunk<upsertActions.Create> => (dispatch, getState) => 
{

  const state = getState();
  const submitStatus = selectors.getSubmitStatus(state, upsertId);

  if(submitStatus !== null) {
    return;
  }

  dispatch({
    type:upsertActions.CREATE,
    payload:{upsertId, entryId}
  });

}

export const cancel = (upsertId:string)
  :Thunk<upsertActions.Cancel> => (dispatch, getState) => 
{
  const state = getState();
  const submitStatus = selectors.getSubmitStatus(state, upsertId);

  if(submitStatus === null || submitStatus === SubmitStatus.Submitting) {
    return;
  }

  dispatch({
    type:upsertActions.CANCEL,
    payload:{upsertId}
  });
  
} 

export const clear = (upsertId:string)
  :Thunk<upsertActions.Clear> => (dispatch, getState) => 
{

  const state = getState();
  const submitStatus = selectors.getSubmitStatus(state, upsertId);

  if(submitStatus === null || submitStatus === SubmitStatus.Submitting) {
    return;
  }

  dispatch({
    type:upsertActions.CLEAR,
    payload:{upsertId}
  });

} 

// Submit
export const validateAll = (upsertId:string):Thunk<any> => (dispatch) => {
  
  batch(()=>{
    dispatch(validateDate(upsertId));
    dispatch(validateDept(upsertId));
    dispatch(validateCat(upsertId));
    dispatch(validateSrc(upsertId));
    dispatch(validatePayMethod(upsertId));
    dispatch(validateTotal(upsertId));
  });
  
}

const ADD_PERSON = gql`
  mutation AddPerson_1($fields:PersonAddFields!) {
    addPerson(fields:$fields) {
      __typename
      id
      name {
        first
        last
      }
    }
  }
`;

const ADD_BUSINESS = gql`
  mutation AddBusiness_1($fields:BusinessAddFields!) {
    addBusiness(fields:$fields) {
      __typename
      id
      name
    }
  }
`;

const ADD_JOURNAL_ENTRY = gql`
  mutation AddJournalEntry_2($fields:JournalEntryAddFields!) {
    addJournalEntry(fields:$fields) {
      __typename
      id
    }
  }
`;

export const submit = (upsertId:string, client:ApolloClient<any>)
  :Thunk<upsertActions.SetSubmitStatus> => (dispatch, getState) =>
{

  const state = getState();
  const submitStatus = selectors.getSubmitStatus(state, upsertId);

  if(submitStatus === null || submitStatus !== SubmitStatus.NotSubmitted) {
    return;
  }

  dispatch(setSubmitStatus(upsertId, SubmitStatus.Submitting));

  dispatch(_submit_(upsertId, client));

}

export const _submit_ = (upsertId:string, client:ApolloClient<any>)
  :Thunk<upsertActions.SetSubmitStatus | upsertActions.SetSubmitError |
  upsertActions.SetSrcValue, Promise<void>> => 
{
  return async (dispatch, getState) => {

    const state = getState();

    
    // Run field validations
    dispatch(validateAll(upsertId));
    
    // Wait for all validation actions to update state
    await Promise.resolve();
    
    const upsertType = selectors.getUpsertType(state, upsertId);

    if(upsertType === selectors.UpsertType.Add) {
      
      const dateError = selectors.getDateError(state, upsertId);
      const deptError = selectors.getDeptError(state, upsertId);
      const catError = selectors.getCatError(state, upsertId);
      const srcError = selectors.getSrcError(state, upsertId);
      const payMethodError = selectors.getPayMethodError(state, upsertId);
      const totalError = selectors.getTotalError(state, upsertId);

      if(dateError || deptError || catError || srcError || payMethodError
        || totalError)
      {
        batch(()=>{
          dispatch(setSubmitError(upsertId,
            new Error("Invalid submission, please check fields")));
          dispatch(setSubmitStatus(upsertId, SubmitStatus.NotSubmitted));
        });
        return;
      }

      const source = selectors.getSrc(state, upsertId);
      
      if(!source) {
        
        
        const srcType = selectors.getSrcType(state, upsertId);
        const srcInput = selectors.getSrcInput(state, upsertId);

        if(srcType === JournalEntrySourceType.Person) {

          const parsedName = parseFullName(srcInput);

          try {

            const result = await client.mutate<AddPerson, AddPersonVars>({
              mutation:ADD_PERSON,
              variables:{
                fields:{
                  name:{
                    first:parsedName.first,
                    last:parsedName.last
                  }
                }
              }
            });

            if(!result.data?.addPerson.id) {
              
              throw new Error("Something went wrong. Server did not respond with new person id.");

            }

            dispatch(setSrcValue(upsertId, [{
              sourceType:JournalEntrySourceType.Person,
              id:result.data.addPerson.id
            }]));
            
            await Promise.resolve();

            dispatch(_submit_(upsertId, client));
            
          } catch(error) {
            
            batch(()=>{
              dispatch(setSubmitError(upsertId,
                new Error(error?.message || `${error}`)));
              dispatch(setSubmitStatus(upsertId, SubmitStatus.NotSubmitted));
            });

          }

        } else {
          
          try {

            const result = await client.mutate<AddBusiness, AddBusinessVars>({
              mutation:ADD_BUSINESS,
              variables:{
                fields:{
                  name:srcInput
                }
              }
            });

            if(!result.data?.addBusiness.id) {
              
              throw new Error("Something went wrong. Server did not respond with new business id.");

            }

            dispatch(setSrcValue(upsertId, [{
              sourceType:JournalEntrySourceType.Business,
              id:result.data.addBusiness.id
            }]));
            
            await Promise.resolve();

            dispatch(_submit_(upsertId, client));

          } catch(error) {

            batch(()=>{
              dispatch(setSubmitError(upsertId,
                new Error(error?.message || `${error}`)));
              dispatch(setSubmitStatus(upsertId, SubmitStatus.NotSubmitted));
            });

          }

        }

        return;
      
      }

      const date = selectors.getDate(state, upsertId);
      const department = selectors.getDept(state, upsertId);
      const category = selectors.getCat(state, upsertId);
      const paymentMethod = selectors.getPayMethod(state, upsertId);
      const description = 
        selectors.getDscrptValue(state, upsertId) ?? undefined;
      const total = selectors.getTotalValue(state, upsertId);
      const reconciled = 
        selectors.getReconciledValue(state, upsertId) ?? undefined;

      if(!(date && department && category && paymentMethod && total)) {
        batch(()=>{
          dispatch(setSubmitError(upsertId,
            new Error(`Something went wrong, field values:
              date:${date}
              department:${department}
              source:${source}
              category:${category}
              paymentMethod:${paymentMethod}
              total:${total}
            `)));
          dispatch(setSubmitStatus(upsertId, SubmitStatus.NotSubmitted));
        });
        return;
      }

      try {

        const result = await client
          .mutate<AddJournalEntry, AddJournalEntryVars>({
            mutation:ADD_JOURNAL_ENTRY,
            variables:{
              fields:{
                date:date.toISOString(),
                department,
                source,
                category,
                paymentMethod,
                description,
                total,
                reconciled
              }
            }
          });

          if(!result.data?.addJournalEntry.id) {
            throw new Error("Something went wrong. Server did not respond with journal entry id.");
          }

          dispatch(setSubmitStatus(upsertId, SubmitStatus.Submitted));

          // Allow for any animation triggers for status submitted
          await new Promise((r)=>setTimeout(r, 300));

          // Clear upsert on success
          dispatch(clear(upsertId));

      } catch(error) {

        batch(()=>{
          dispatch(setSubmitError(upsertId,
            new Error(error?.message || `${error}`)));
          dispatch(setSubmitStatus(upsertId, SubmitStatus.NotSubmitted));
        });

        return;

      }

    } else {


    }

  }
}

export const setSubmitStatus = (upsertId:string, status:SubmitStatus)
  :upsertActions.SetSubmitStatus => ({
    type:upsertActions.SET_SUBMIT_STATUS,
    payload:{upsertId, status}
  });

export const setSubmitError = (upsertId:string, error:Error)
  :upsertActions.SetSubmitError => ({
    type:upsertActions.SET_SUBMIT_ERROR,
    payload:{upsertId, error}
  });

// Date
export const setDateInput = (upsertId:string, input:string):
  upsertActions.SetDateInput => ({
    type:upsertActions.SET_DATE_INPUT,
    payload:{upsertId, input}
  });

export const clearDateInput = (upsertId:string):upsertActions.ClearDateInput =>
  ({
    type:upsertActions.CLEAR_DATE_INPUT,
    payload:{upsertId}
  });

export const setDateValue = (upsertId:string, value:Date):
  upsertActions.SetDateValue => ({
    type:upsertActions.SET_DATE_VALUE,
    payload:{upsertId, value}
  });

export const clearDateValue = (upsertId:string):upsertActions.ClearDateValue =>
  ({
    type:upsertActions.CLEAR_DATE_VALUE,
    payload:{upsertId}
  });

export const setDateError = (upsertId:string, error:Error):
  upsertActions.SetDateError => ({
    type:upsertActions.SET_DATE_ERROR,
    payload:{upsertId, error}
  });

export const clearDateError = (upsertId:string):upsertActions.ClearDateError =>
  ({
    type:upsertActions.CLEAR_DATE_ERROR,
    payload:{upsertId}
  });

export const validateDate = (upsertId:string)
  :Thunk<upsertActions.SetDateError | upsertActions.ClearDateError> => 
  (dispatch, getState) => 
{

    const state = getState();

    const date = selectors.getDate(state, upsertId);
    const dateError = selectors.getDateError(state, upsertId);
    const upsertType = selectors.getUpsertType(state, upsertId);

    // Check for valid date
    if(date) {
      
      if(Number.isNaN(date.getTime())) {
        
        dispatch(setDateError(upsertId, new Error("Invalid date.")));
      
      } else if(dateError) {
        
        dispatch(clearDateError(upsertId));
      
      }

    // Required
    } else if(upsertType === selectors.UpsertType.Add) {
      
      dispatch(setDateError(upsertId, new Error("Date is required.")));
    
    // Clear errors
    } else if(dateError) {
      
      dispatch(clearDateError(upsertId));

    }

}

// Department
export const setDeptInput = (upsertId:string, input:string)
  :upsertActions.SetDeptInput => ({
      type:upsertActions.SET_DEPT_INPUT,
      payload:{ upsertId, input}
  });

export const clearDeptInput = (upsertId:string)
  :upsertActions.ClearDeptInput => ({
    type:upsertActions.CLEAR_DEPT_INPUT,
    payload:{upsertId}
  });

export const setDeptValue = (upsertId:string, value:string[])
  :upsertActions.SetDeptValue => ({
      type:upsertActions.SET_DEPT_VALUE,
      payload:{ upsertId, value}
  });

export const clearDeptValue = (upsertId:string)
  :upsertActions.ClearDeptValue => ({
    type:upsertActions.CLEAR_DEPT_VALUE,
    payload:{upsertId}
  });

export const setDeptError = (upsertId:string, error:Error):
  upsertActions.SetDeptError => ({
    type:upsertActions.SET_DEPT_ERROR,
    payload:{upsertId, error}
  });

export const clearDeptError = (upsertId:string)
  :upsertActions.ClearDeptError => ({
    type:upsertActions.CLEAR_DEPT_ERROR,
    payload:{upsertId}
  });

export const setDeptOpen = (upsertId:string, open:boolean)
  :upsertActions.SetDeptOpen => ({
    type:upsertActions.SET_DEPT_OPEN,
    payload:{upsertId, open}
  });

export const validateDept = (upsertId:string)
  :Thunk<upsertActions.SetDeptError | upsertActions.ClearDeptError> => 
  (dispatch, getState) => 
{

    const state = getState();

    const dept = selectors.getDept(state, upsertId);
    const deptError = selectors.getDeptError(state, upsertId);
    const upsertType = selectors.getUpsertType(state, upsertId);

    // Required
    if(upsertType === selectors.UpsertType.Add && !dept) {
      
      dispatch(setDeptError(upsertId, new Error("Department is required.")));
    
    // Clear errors
    } else if(deptError) {
      
      dispatch(clearDeptError(upsertId));

    }

}

const BUSINESS_VENDOR_CHECK = gql`
  query CheckValidVendor_1($id:ID!) {
    business(id: $id) {
      __typename
      id
      vendor {
        approved
      }
    }
  }
`

// Category
export const setCatType = (upsertId:string,
  catType:JournalEntryCategoryType, client:ApolloClient<any>):
    Thunk<upsertActions.SetCatType | upsertActions.ClearSrcValue> => 
    async (dispatch, getState) => 
{
  const state = getState();

  const src = selectors.getSrc(state, upsertId);

  if(src && catType === JournalEntryCategoryType.Debit) {

    const {id, sourceType} = src;

    let approvedVendor = false;

    if(sourceType === JournalEntrySourceType.Business) {
      
      try {

        const {data} = await client.query<CheckValidVendor,
          CheckValidVendorVars>({
            query:BUSINESS_VENDOR_CHECK,
            variables:{
              id
            }
          });
        
        approvedVendor = !!data.business?.vendor?.approved;

      } catch(error) {

        // TODO: write generic error handler

      }

    }

    if(!approvedVendor) {

      dispatch(clearSrcValue(upsertId));

    }

  }


  dispatch({
    type:upsertActions.SET_CAT_TYPE,
    payload:{upsertId, catType}
  });

}

export const clearCatType = (upsertId:string):upsertActions.ClearCatType => ({
  type:upsertActions.CLEAR_CAT_TYPE,
  payload:{upsertId}
});

export const setCatInput = (upsertId:string, input:string)
  :upsertActions.SetCatInput => ({
      type:upsertActions.SET_CAT_INPUT,
      payload:{ upsertId, input}
  });

export const clearCatInput = (upsertId:string)
  :upsertActions.ClearCatInput => ({
    type:upsertActions.CLEAR_CAT_INPUT,
    payload:{upsertId}
  });

export const setCatValue = (upsertId:string, value:string)
  :upsertActions.SetCatValue => ({
      type:upsertActions.SET_CAT_VALUE,
      payload:{ upsertId, value}
  });

export const clearCatValue = (upsertId:string)
  :upsertActions.ClearCatValue => ({
    type:upsertActions.CLEAR_CAT_VALUE,
    payload:{upsertId}
  });

export const setCatError = (upsertId:string, error:Error):
  upsertActions.SetCatError => ({
    type:upsertActions.SET_CAT_ERROR,
    payload:{upsertId, error}
  });

export const clearCatError = (upsertId:string)
  :upsertActions.ClearCatError => ({
    type:upsertActions.CLEAR_CAT_ERROR,
    payload:{upsertId}
  });

export const setCatOpen = (upsertId:string, open:boolean)
  :upsertActions.SetCatOpen => ({
    type:upsertActions.SET_CAT_OPEN,
    payload:{upsertId, open}
  });

export const validateCat = (upsertId:string)
  :Thunk<upsertActions.SetCatError | upsertActions.ClearCatError> => 
  (dispatch, getState) => 
{

    const state = getState();

    const cat = selectors.getCat(state, upsertId);
    const catError = selectors.getCatError(state, upsertId);
    const upsertType = selectors.getUpsertType(state, upsertId);

    // Required
    if(upsertType === selectors.UpsertType.Add && !cat) {
      
      dispatch(setCatError(upsertId, new Error("Category is required.")));
    
    // Clear errors
    } else if(catError) {
      
      dispatch(clearCatError(upsertId));

    }

}

// Source
export const setSrcType = (upsertId:string, srcType:JournalEntrySourceType)
  :upsertActions.SetSrcType => ({
    type:upsertActions.SET_SRC_TYPE,
    payload:{upsertId, srcType}
  });

export const clearSrcType = (upsertId:string):upsertActions.ClearSrcType => ({
  type:upsertActions.CLEAR_SRC_TYPE,
  payload:{upsertId}
});

export const setSrcInput = (upsertId:string, input:string)
  :upsertActions.SetSrcInput => ({
      type:upsertActions.SET_SRC_INPUT,
      payload:{ upsertId, input}
  });

export const clearSrcInput = (upsertId:string)
  :upsertActions.ClearSrcInput => ({
    type:upsertActions.CLEAR_SRC_INPUT,
    payload:{upsertId}
  });

export const setSrcValue = (upsertId:string, value:JournalEntrySourceInput[])
  :upsertActions.SetSrcValue => ({
      type:upsertActions.SET_SRC_VALUE,
      payload:{ upsertId, value}
  });

export const clearSrcValue = (upsertId:string)
  :upsertActions.ClearSrcValue => ({
    type:upsertActions.CLEAR_SRC_VALUE,
    payload:{upsertId}
  });

export const setSrcError = (upsertId:string, error:Error):
  upsertActions.SetSrcError => ({
    type:upsertActions.SET_SRC_ERROR,
    payload:{upsertId, error}
  });

export const clearSrcError = (upsertId:string):upsertActions.ClearSrcError => ({
  type:upsertActions.CLEAR_SRC_ERROR,
  payload:{upsertId}
});

export const setSrcOpen = (upsertId:string, open:boolean)
  :upsertActions.SetSrcOpen => ({
    type:upsertActions.SET_SRC_OPEN,
    payload:{upsertId, open}
  });
export const validateSrc = (upsertId:string)
  :Thunk<upsertActions.SetSrcError | upsertActions.ClearSrcError> => 
  (dispatch, getState) => 
{

    const state = getState();

    const src = selectors.getSrc(state, upsertId);
    const srcError = selectors.getSrcError(state, upsertId);

    if(src) {
      if(srcError) {
        dispatch(clearSrcError(upsertId));
      }
      return;
    }
    
    const srcType = selectors.getSrcType(state, upsertId);
    const srcInput = selectors.getSrcInput(state, upsertId);
    const upsertType = selectors.getUpsertType(state, upsertId);

    if(srcInput) {
      
      if(srcType !== JournalEntrySourceType.Person) {
        if(srcError) {
          dispatch(clearSrcError(upsertId));
        }
        return;
      }

      // Validate name
      const parsedName = parseFullName(srcInput);

      if(!parsedName.first.trim()) {
        dispatch(setSrcError(upsertId, new Error("First name is required.")));
      } else if(!parsedName.last.trim()) {
        dispatch(setSrcError(upsertId, new Error("Last name is required.")));
      } else if(srcError){
        dispatch(clearSrcError(upsertId));
      }

    // Required
    } else if(upsertType === selectors.UpsertType.Add) {
    
      dispatch(setSrcError(upsertId, new Error("Source is required.")));
    
    // Clear errors
    } else if(srcError) {
        
      dispatch(clearSrcError(upsertId));

    }
      

}
// Payment Method
export const setPayMethodValue = (upsertId:string, value:string)
  :upsertActions.SetPayMethodValue => ({
    type:upsertActions.SET_PAY_METHOD_VALUE,
    payload:{upsertId, value}
  });
export const clearPayMethodValue = (upsertId:string):upsertActions.ClearPayMethodValue => 
({
  type:upsertActions.CLEAR_PAY_METHOD_VALUE,
  payload:{upsertId}
});
export const setPayMethodError = (upsertId:string, error:Error):
  upsertActions.SetPayMethodError => ({
    type:upsertActions.SET_PAY_METHOD_ERROR,
    payload:{upsertId, error}
  });

export const clearPayMethodError = (upsertId:string)
  :upsertActions.ClearPayMethodError => ({
    type:upsertActions.CLEAR_PAY_METHOD_ERROR,
    payload:{upsertId}
  });
export const validatePayMethod = (upsertId:string)
  :Thunk<upsertActions.SetPayMethodError | upsertActions.ClearPayMethodError> => 
  (dispatch, getState) => 
{

    const state = getState();

    const payMethod = selectors.getPayMethod(state, upsertId);
    const payMethodError = selectors.getPayMethodError(state, upsertId);
    const upsertType = selectors.getUpsertType(state, upsertId);

    // Required
    if(upsertType === selectors.UpsertType.Add && !payMethod) {
      
      dispatch(setPayMethodError(upsertId, 
        new Error("Payment Method is required.")));
    
    // Clear errors
    } else if(payMethodError) {
      
      dispatch(clearPayMethodError(upsertId));

    }

}

// Description
export const setDscrptValue = (upsertId:string, value:string)
  :upsertActions.SetDscrptValue => ({
      type:upsertActions.SET_DSCRPT_VALUE,
      payload:{ upsertId, value}
  });

export const clearDscrptValue = (upsertId:string)
  :upsertActions.ClearDscrptValue => ({
    type:upsertActions.CLEAR_DSCRPT_VALUE,
    payload:{upsertId}
  });

// Total
export const setTotalInput = (upsertId:string, input:string)
  :upsertActions.SetTotalInput | upsertActions.SetTotalError =>
{

  const inputNum = Number.parseFloat(input);

  if(Number.isNaN(inputNum)){
    return setTotalError(upsertId, new TypeError(`Invalid Number.`));
  }

  let formattedInput = "";
  for(let i = 0, len = input.length; i < len; i++) {
    const char = input[i];
    if(char === ".") {
      formattedInput += char;
      len = Math.min(len, i + 3);
    } else if(!Number.isNaN(Number.parseInt(char))) {
      formattedInput += char;
    }
  }

  return {
    type:upsertActions.SET_TOTAL_INPUT,
    payload:{ upsertId, input:formattedInput}
  };

}

export const clearTotalInput = (upsertId:string)
  :upsertActions.ClearTotalInput => ({
    type:upsertActions.CLEAR_TOTAL_INPUT,
    payload:{upsertId}
  });

export const setTotalValue = (upsertId:string, total:number)
  : upsertActions.SetTotalValue => 
{
  
  // Convert to rational
  const {n:num, d:den} = new Fraction(total.toFixed(2));
  const value = {num, den};

  return {
    type:upsertActions.SET_TOTAL_VALUE,
    payload:{ upsertId, value}
  };

}

export const clearTotalValue = (upsertId:string)
  :upsertActions.ClearTotalValue => ({
    type:upsertActions.CLEAR_TOTAL_VALUE,
    payload:{upsertId}
  });

export const setTotalError = (upsertId:string, error:Error):
  upsertActions.SetTotalError => ({
    type:upsertActions.SET_TOTAL_ERROR,
    payload:{upsertId, error}
  });

export const clearTotalError = (upsertId:string)
  :upsertActions.ClearTotalError => ({
    type:upsertActions.CLEAR_TOTAL_ERROR,
    payload:{upsertId}
  });

export const validateTotal = (upsertId:string)
  :Thunk<upsertActions.SetTotalError | upsertActions.ClearTotalError> => 
  (dispatch, getState) => 
{

    const state = getState();

    const total = selectors.getTotalValue(state, upsertId);
    const totalError = selectors.getTotalError(state, upsertId);
    const upsertType = selectors.getUpsertType(state, upsertId);

    // Required
    if(upsertType === selectors.UpsertType.Add) {
      
      if(total) {

        if(total.num/total.den === 0) {
          dispatch(setTotalError(upsertId, new Error("Total cannot be 0.")));
        } else if(totalError) {
          dispatch(clearTotalError(upsertId));
        }

      } else {

        dispatch(setTotalError(upsertId, new Error("Total is required.")));
      
      }

    
    // Clear errors
    } else if(totalError) {
      
      dispatch(clearTotalError(upsertId));

    }

}

// Reconciled
export const setReconciledValue = (upsertId:string, value:boolean)
  :upsertActions.SetReconciledValue => ({
      type:upsertActions.SET_RECONCILED_VALUE,
      payload:{ upsertId, value}
  });

export const clearReconciledValue = (upsertId:string)
  :upsertActions.ClearReconciledValue => ({
    type:upsertActions.CLEAR_RECONCILED_VALUE,
    payload:{upsertId}
  });