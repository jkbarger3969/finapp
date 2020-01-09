import React, {useRef} from 'react';
import {useQuery} from '@apollo/react-hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import Autocomplete, {AutocompleteProps, RenderInputParams
} from '@material-ui/lab/Autocomplete';
import Skeleton from '@material-ui/lab/Skeleton';
import gql from 'graphql-tag';

import {PeopleSrcOpts_1Query as PeopleSrcOptsQuery,
  PeopleSrcOpts_1QueryVariables as PeopleSrcOptsQueryVariables,
  JournalEntrySourceType
} from '../../../apollo/graphTypes';
import useJournalEntryUpsert from "../useJournalEntryUpsert";

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

const leadingWS = /^\s+/;

const getPerson = (personId:string | null, 
  peopleOpts:PeopleSrcOptsQuery['people']) => 
{
  if(personId) {
    for(const person of peopleOpts) {
      if(person.id === personId) {
        return person;
      }
    }
  }
  return null;
}

export interface PersonSrcProps {
  entryUpsertId: string;
  autoFocus:boolean;
  variant:"filled" | "outlined";
}

const PersonSrc = function(props:PersonSrcProps) {

  const classes = styles();
  
  const {entryUpsertId, autoFocus, variant} = props;

  const {loading:loading1, error:error1, upsert, update, refetchUpsert} 
    = useJournalEntryUpsert(entryUpsertId);

  const srcInput = upsert?.inputValues?.srcInput ? 
    (upsert?.inputValues?.srcInput?.replace(leadingWS,"") || null) : null;
  const selectedSources = upsert?.fields?.source || [];
  const required = !(upsert?.fields?.id);

  const {loading:loading2, error:error2, data} = 
    useQuery<PeopleSrcOptsQuery, PeopleSrcOptsQueryVariables>(
    PEOPLE_SRC_OPTS_QUERY, {
      skip:!srcInput,
      variables:{
        searchByName:{
          first:(srcInput || "").substr(0,1).toLowerCase(),
          last:(srcInput || "").substr(0,1).toLowerCase()
        }
      }
  });

  const peopleOptsRefContainer = useRef(data?.people || []);

  if(loading1){
    return <Skeleton variant="rect" height={56} />;
  } else if(error1 || error2) {
    console.error(error1 || error2);
    return <p>{(error1 || error2)?.message}</p>;
  }
  
  const personId = selectedSources[0]?.id || null;
  
  const peopleOpts = (() => {

    if(data?.people) {

      peopleOptsRefContainer.current = data.people;

    } else if(!personId) {

      peopleOptsRefContainer.current = [];

    }

    return peopleOptsRefContainer.current;

  })();
  
  const person = getPerson(personId, peopleOpts);
  const inputValue = person ? `${person.name.first} ${person.name.last}` :
    (srcInput || "");

  const textFieldProps:TextFieldProps = {
    required,
    autoFocus,
    label:"Name",
    fullWidth:true,
    variant,
  };

  const autoCompleteProps:AutocompleteProps = {
    loading:loading2,
    autoHighlight:true,
    autoSelect:true,
    autoComplete:true,
    // BUG: Clear action does not trigger onInputChange
    disableClearable:selectedSources.length === 0,
    freeSolo:selectedSources.length === 0,
    options:peopleOpts,
    inputValue,
    value:person,
    onChange:(event, value = null)=>{
    
      // Allow for free solo, do NOT reset srcInput when there is nothing to 
      // add or clear
      if(!value) {
       
        const upsert = refetchUpsert();
       
        if(upsert) {
       
          const source = upsert?.fields?.source || [];
       
          if(source.length === 0) {
            return;
          }
       
        } else {
        
          return;
        
        }
      
      }

      update.inputValues.srcInput(null);
      if(value) {
        update.fields.replaceSources([{
          sourceType:JournalEntrySourceType.Person,
          id:value.id
        }]);
      } else {
        update.fields.clearSources();
      }
    
    },
    onInputChange:(event, value) => {
      
      value = value?.replace(leadingWS,"") || null;
      
      const upsert = refetchUpsert();

      if(!upsert) {
        return;
      }
      
      const source = upsert?.fields?.source || [];

      if(value && source.length) {
        update.inputValues.srcInput(null);
      } else {
        update.inputValues.srcInput(value);
      }
    
    },
    renderInput:(params:RenderInputParams) => {
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
    },
    getOptionLabel:(opt) => `${opt.name.first} ${opt.name.last}`,
    filterOptions:(opts) => {
      if(!srcInput || !srcInput.trim()) {
        return opts;
      }
      const test = new RegExp(`(^|\\s)${srcInput}`,'i');
      return opts.filter((opt) => test.test(`${opt.name.first} ${opt.name.last}`));
    },
  };

  return <Autocomplete {...autoCompleteProps}/>;

}

export default PersonSrc;