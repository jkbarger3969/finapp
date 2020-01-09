import React from 'react';
import {useQuery} from '@apollo/react-hooks';
import FormControl, {FormControlProps} from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select, {SelectProps} from '@material-ui/core/Select';
import MenuItem, {MenuItemProps} from '@material-ui/core/MenuItem';
import Skeleton from '@material-ui/lab/Skeleton';
import {capitalCase} from 'change-case';
import gql from 'graphql-tag';

import {TypeInput_1Query} from '../../apollo/graphTypes';
import useJournalEntryUpsert from "./useJournalEntryUpsert";

const TYPE_INPUT_QUERY = gql`
  query TypeInput_1 {
    journalEntryTypes {
      __typename
      id
      type
    }
  }
`; 

export interface TypeInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const TypeInput = function(props:TypeInputProps) {

  const {entryUpsertId, autoFocus = false, variant = "filled"} = props;

  const {loading:loading1, error:error1, data} 
    = useQuery<TypeInput_1Query>(TYPE_INPUT_QUERY);
  
  const {loading:loading2, error:error2, upsert, update} 
    = useJournalEntryUpsert(entryUpsertId);

  if(loading1 || loading2){
    return <Skeleton variant="rect" height={56} />;
  } else if(error1 || error2) {
    console.error(error1 || error2);
    return <p>{(error1 || error2)?.message}</p>;
  }

  const journalEntryTypes = data?.journalEntryTypes || [];
  const required = !(upsert?.fields?.id);
  const value = upsert?.fields?.type || "";

  const formControlProps:FormControlProps = {
    required,
    fullWidth:true,
    variant
  };
  
  const selectProps:SelectProps = {
    autoFocus,
    children:journalEntryTypes.map(({id, type})=>(<MenuItem {...{
      value:id,
      key:id,
      children:capitalCase(type)
    } as MenuItemProps as any }/>)),
    onChange:(event)=> {
      update.fields.type((event?.target?.value) as string || null);
    },
    MenuProps:{
      disablePortal:true
    },
    value
  };

  return <FormControl {...formControlProps}>
    <InputLabel>Type</InputLabel>
    <Select {...selectProps}/>
  </FormControl>;

}

export default TypeInput;