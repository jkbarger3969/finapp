import React, { useCallback, useMemo } from 'react';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';

import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setDscrptValue, clearDscrptValue
} from "../../redux/actions/journalEntryUpsert";
import { getDscrptValue, getType
} from "../../redux/selectors/journalEntryUpsert";
import { useSelector } from 'react-redux';

interface SelectorResult {
  disabled:boolean;
  description:string;
}

export interface DescriptionInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const DescriptionInput = function(props:DescriptionInputProps) {
  
  const {entryUpsertId, autoFocus = false, variant = 'filled'} = props;
  
  const dispatch = useDebounceDispatch();

  const {description, disabled} = useSelector<Root, SelectorResult>((state)=>({
    disabled:getType(state, entryUpsertId) === null,
    description:getDscrptValue(state, entryUpsertId) || ""
  }));
  
  const onChange = useCallback((event)=> {
    const value = (event.target.value || "");
    if(value) {
      dispatch(setDscrptValue(entryUpsertId, value));
    } else {
      dispatch(clearDscrptValue(entryUpsertId));
    }

  }, [dispatch, entryUpsertId]);

  const textFieldProps:TextFieldProps = {
    disabled,
    fullWidth:true,
    value: description,
    variant,
    required:false,
    label:"Description",
    name:"description",
    onChange,
    InputProps:useMemo(() => ({
      type:"text",
      autoFocus,
    }),[autoFocus]),
  }

  return <TextField {...textFieldProps} />;

}

export default DescriptionInput;