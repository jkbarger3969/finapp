import React, { useCallback, useMemo } from 'react';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';

import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setDscrptValue, clearDscrptValue
} from "../../redux/actions/journalEntryUpsert";
import { getDscrptValue } from "../../redux/selectors/journalEntryUpsert";
import { useSelector } from 'react-redux';

export interface DescriptionInputProps {
  entryUpsertId:string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const DescriptionInput = function(props:DescriptionInputProps) {
  
  const {entryUpsertId, autoFocus = false, variant = 'filled'} = props;
  
  const dispatch = useDebounceDispatch();

  const description = useSelector<Root, string>((state)=>{
    return getDscrptValue(state, entryUpsertId) || "";
  });
  
  const onChange = useCallback((event)=> {
    const value = (event.target.value || "");
    if(value) {
      dispatch(setDscrptValue(entryUpsertId, value));
    } else {
      dispatch(clearDscrptValue(entryUpsertId));
    }

  }, [dispatch, entryUpsertId]);

  const textFieldProps:TextFieldProps = {
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