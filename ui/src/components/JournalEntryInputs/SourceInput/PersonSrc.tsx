import React, {useRef, useMemo, useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from "react-redux";
import {useQuery} from '@apollo/react-hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import Autocomplete, {AutocompleteProps, RenderInputParams
} from '@material-ui/lab/Autocomplete';
import gql from 'graphql-tag';
import isEqual from "lodash.isequal";

import {PeopleSrcOpts_1Query as PeopleSrcOptsQuery,
  PeopleSrcOpts_1QueryVariables as PeopleSrcOptsQueryVariables,
  JournalEntrySourceType
} from '../../../apollo/graphTypes';
import {Root} from "../../../redux/reducers/root";
import {setSrcInput, clearSrcInput, setSrcValue, clearSrcValue,
} from "../../../redux/actions/journalEntryUpsert";
import {getSrcInput, getSrc, isRequired
} from "../../../redux/selectors/journalEntryUpsert";

const PEOPLE_SRC_OPTS_QUERY = gql`
  query PeopleSrcOpts_1($searchByName:PersonNameInput!) {
    people(searchByName:$searchByName){
      __typename
      id
      name {
        first
        last
      }
    }
  }
`;

const styles = makeStyles((theme:Theme) => createStyles({
  fixHeight:{
    maxHeight:56
  },
}));

type PersonValue = PeopleSrcOptsQuery["people"][0] | null

interface SelectorResult {
  srcInput:string;
  isSrcSet:boolean;
  freeSolo:boolean;
  required:boolean;
}

// Static cbs for AutocompleteProps
const filterOptions = (opts) => opts;
const getOptionLabel = (opt:NonNullable<PersonValue>) => 
  `${opt.name.first} ${opt.name.last}`;

export interface PersonSrcProps {
  entryUpsertId: string;
  autoFocus:boolean;
  variant:"filled" | "outlined";
}


const PersonSrc = function(props:PersonSrcProps) {

  const classes = styles();
  
  const dispatch = useDispatch();

  const {entryUpsertId, autoFocus, variant} = props;
  
  const {srcInput, isSrcSet, required, freeSolo} = 
    useSelector<Root, SelectorResult>((state) => {
    
      const src = getSrc(state, entryUpsertId);

      return {
        srcInput:getSrcInput(state, entryUpsertId),
        isSrcSet:!!src,
        freeSolo:!src,
        required:isRequired(state, entryUpsertId)
      };

    }, shallowEqual);

  const searchCharRef = useRef("");
  if(!isSrcSet) {
    searchCharRef.current = srcInput.substr(0,1).toLowerCase();
  }

  const {loading, error, data} = 
    useQuery<PeopleSrcOptsQuery, PeopleSrcOptsQueryVariables>(
    PEOPLE_SRC_OPTS_QUERY, {
      skip:!searchCharRef.current,
      variables:{
        searchByName:{
          first:searchCharRef.current,
          last:searchCharRef.current
        }
      }
  });

  const options = useMemo(()=>{
    const options = data?.people || [];
    if(!isSrcSet || !srcInput) {
      return options;
    }
    const test = new RegExp(`(^|\\s)${srcInput}`,'i');
    return options
      .filter((opt) => test.test(`${opt.name.first} ${opt.name.last}`));
  },[srcInput, data, isSrcSet]);

  const value = useSelector<Root, PersonValue | null>((state) => {

    const src = getSrc(state, entryUpsertId);      
    
    if(src){
      for(const person of options) {
        if(person.id === src.id) {
          return person;
        }
      }
    }

    return null;

  }, isEqual);

  const inputValue = isSrcSet ? 
    `${value?.name.first} ${value?.name.last}` : srcInput;

  const onChange = useCallback((event, newSrc:PersonValue)=> {
    newSrc = newSrc || null;
    if(newSrc) {
      dispatch(setSrcValue(entryUpsertId, [{
        sourceType:JournalEntrySourceType.Person,
        id:newSrc.id
      }]));
    } else {
      dispatch(clearSrcValue(entryUpsertId));
    }
  },[dispatch, entryUpsertId]);

  const onInputChange = useCallback((event:any, value:string) => {
    if(value) {
      dispatch(setSrcInput(entryUpsertId, value));
    } else {
      dispatch(clearSrcInput(entryUpsertId));
    }
  },[dispatch, entryUpsertId]);

  const textFieldProps:TextFieldProps = {
    required,
    autoFocus,
    label:"Name",
    fullWidth:true,
    variant,
  };

  const renderInput = useCallback((params:RenderInputParams) => {
    const InputProps  = params?.InputProps;
    if(InputProps) {
      const className = InputProps?.className || "";
      InputProps.className = `${className} ${classes.fixHeight}`
    } else {
      params.InputProps = {
        className:classes.fixHeight
      } as  RenderInputParams['InputProps'];
    }
    return <TextField {...textFieldProps} {...params}/>
  },[classes, textFieldProps]);

  if(error) {
    console.error(error);
    return <p>{error?.message || `${error}`}</p>;
  }

  const autoCompleteProps:AutocompleteProps = {
    loading,
    autoHighlight:true,
    autoSelect:false,
    autoComplete:true,
    freeSolo,
    options,
    inputValue,
    value,
    onChange,
    onInputChange,
    renderInput,
    filterOptions,
    getOptionLabel
  };

  return <Autocomplete {...autoCompleteProps}/>;

}

export default PersonSrc;