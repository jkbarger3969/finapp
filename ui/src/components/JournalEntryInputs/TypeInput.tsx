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

import {TypeInput_1Query} from '../../apollo/graphTypes';
import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setTypeValue, clearTypeValue
} from "../../redux/actions/journalEntryUpsert";
import { getType, isRequired
} from "../../redux/selectors/journalEntryUpsert";

const TYPE_INPUT_QUERY = gql`
  query TypeInput_1 {
    journalEntryTypes {
      __typename
      id
      type
    }
  }
`; 

interface SelectorResult {
  required:boolean;
  value:string;
}

export interface TypeInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const TypeInput = function(props:TypeInputProps) {

  const {entryUpsertId, autoFocus = false, variant = "filled"} = props;

  const dispatch = useDebounceDispatch();

  const {loading, error, data} 
    = useQuery<TypeInput_1Query>(TYPE_INPUT_QUERY);
  
  const {value, required} = 
    useSelector<Root, SelectorResult>((state)=>({
      required:isRequired(state, entryUpsertId),
      value:getType(state, entryUpsertId)
    }), shallowEqual);
  
  const journalEntryTypes = useMemo(()=> data?.journalEntryTypes || [],[data]);

  const formControlProps:FormControlProps = useMemo(()=>({
    required,
    fullWidth:true,
    variant
  }),[required, variant]);

  const children = useMemo(()=>journalEntryTypes.map(({id, type})=>(
    <MenuItem {...{
      value:id,
      key:id,
      children:capitalCase(type)
    } as MenuItemProps as any }/>)),[journalEntryTypes]);

  const onChange = useCallback((event) => {
    const value = event?.target?.value as string || null;
    if(value) {
      dispatch(setTypeValue(entryUpsertId, value));
    } else {
      dispatch(clearTypeValue(entryUpsertId));
    }
  },[dispatch, entryUpsertId]);

  if(loading){
    return <Skeleton variant="rect" height={56} />;
  } else if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }
  
  const selectProps:SelectProps = {
    autoFocus,
    children,
    onChange,
    value
  };

  return <FormControl {...formControlProps}>
    <InputLabel>Type</InputLabel>
    <Select {...selectProps}/>
  </FormControl>;

}

export default TypeInput;