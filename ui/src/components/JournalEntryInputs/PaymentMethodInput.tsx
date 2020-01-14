import React, {useMemo, useCallback} from 'react';
import {useSelector, shallowEqual} from "react-redux";
import {useQuery} from '@apollo/react-hooks';
import FormControl, {FormControlProps} from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select, {SelectProps} from '@material-ui/core/Select';
import MenuItem, {MenuItemProps} from '@material-ui/core/MenuItem';
import Skeleton from '@material-ui/lab/Skeleton';
import {capitalCase} from 'change-case';
import gql from 'graphql-tag';

import {PayMethodInput_1Query as PayMethodInputQuery
} from '../../apollo/graphTypes';
import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setPayMethodValue, clearPayMethodValue
} from "../../redux/actions/journalEntryUpsert";
import { getPayMethod, isRequired
} from "../../redux/selectors/journalEntryUpsert";

const PAY_METHOD_INPUT_QUERY = gql`
  query PayMethodInput_1 {
    paymentMethods {
      __typename
      id
      method
    }
  }
`;

interface SelectorResult {
  required:boolean;
  value:string;
}

export interface PaymentMethodInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const PaymentMethod = function(props:PaymentMethodInputProps) {

  const {entryUpsertId, autoFocus = false, variant = "filled"} = props;

  const dispatch = useDebounceDispatch();

  const {value, required} = 
    useSelector<Root, SelectorResult>((state)=>({
      required:isRequired(state, entryUpsertId),
      value:getPayMethod(state, entryUpsertId)
    }), shallowEqual);

  const {loading, error, data} 
    = useQuery<PayMethodInputQuery>(PAY_METHOD_INPUT_QUERY);
  
  const paymentMethods = useMemo(()=>data?.paymentMethods || [],[data]);

  const formControlProps:FormControlProps = useMemo(()=>({
    required,
    fullWidth:true,
    variant
  }),[required, variant]);

  const onChange = useCallback((event) => {
    const value = event?.target?.value as string || null;
    if(value) {
      dispatch(setPayMethodValue(entryUpsertId, value));
    } else {
      dispatch(clearPayMethodValue(entryUpsertId));
    }
  },[dispatch, entryUpsertId]);

  const children = useMemo(()=>paymentMethods.map(({id, method})=>(
    <MenuItem {...{
      value:id,
      key:id,
      children:capitalCase(method)
    } as MenuItemProps as any }/>)),[paymentMethods]);

  if(loading){
    return <Skeleton variant="rect" height={56}/>;
  } else if(error) {
    console.error(error);
    return <p>{error?.message}</p>;
  }
  
  const selectProps:SelectProps = {
    autoFocus,
    children,
    onChange,
    value
  };

  return <FormControl {...formControlProps}>
    <InputLabel>Payment Method</InputLabel>
    <Select {...selectProps}/>
  </FormControl>;

}

export default PaymentMethod;