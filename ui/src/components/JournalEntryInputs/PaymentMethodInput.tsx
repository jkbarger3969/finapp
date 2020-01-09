import React from 'react';
import {useQuery} from '@apollo/react-hooks';
import FormControl, {FormControlProps} from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select, {SelectProps} from '@material-ui/core/Select';
import MenuItem, {MenuItemProps} from '@material-ui/core/MenuItem';
import Skeleton from '@material-ui/lab/Skeleton';
import {capitalCase} from 'change-case';
import gql from 'graphql-tag';

import useJournalEntryUpsert from "./useJournalEntryUpsert";
import {PayMethodInput_1Query as PayMethodInputQuery
} from '../../apollo/graphTypes';

const PAY_METHOD_INPUT_QUERY = gql`
  query PayMethodInput_1 {
    paymentMethods {
      __typename
      id
      method
    }
  }
`;

export interface PaymentMethodInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const PaymentMethod = function(props:PaymentMethodInputProps) {

  const {entryUpsertId, autoFocus = false, variant = "filled"} = props;

  const {loading:loading1, error:error1, upsert, update} 
    = useJournalEntryUpsert(entryUpsertId);

  const {loading:loading2, error:error2, data} 
    = useQuery<PayMethodInputQuery>(PAY_METHOD_INPUT_QUERY);

  if(loading1 || loading2){
    return <Skeleton variant="rect" height={56}/>;
  } else if(error1 || error2) {
    console.error(error1 || error2);
    return <p>{(error1 || error2)?.message}</p>;
  }

  const paymentMethods = data?.paymentMethods || [];
  const required = !(upsert?.fields?.id);
  const value = upsert?.fields?.paymentMethod || "";

  const formControlProps:FormControlProps = {
    required,
    fullWidth:true,
    variant
  };
  
  const selectProps:SelectProps = {
    autoFocus,
    children:(paymentMethods || []).map(({id, method})=>(<MenuItem 
      {...{
        value:id,
        key:id,
        children:capitalCase(method)
      } as MenuItemProps as any}
    />)),
    onChange:(event)=> {
      update.fields.paymentMethod((event?.target?.value) as string || null);
    },
    MenuProps:{
      disablePortal:true
    },
    value
  };

  return <FormControl {...formControlProps}>
    <InputLabel>Payment Method</InputLabel>
    <Select {...selectProps}/>
  </FormControl>;

}

export default PaymentMethod;