import React, {useRef, useState} from "react";
import {useQuery} from "@apollo/react-hooks";
import { makeStyles, createStyles, Theme } from "@material-ui/core";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import Box from '@material-ui/core/Box';
import Autocomplete, {AutocompleteProps, RenderInputParams
} from "@material-ui/lab/Autocomplete";
import ChevronRight from '@material-ui/icons/ChevronRight';
import Skeleton from "@material-ui/lab/Skeleton";
import gql from "graphql-tag";

import useJournalEntryUpsert from "../useJournalEntryUpsert";
import {BusinessSrcOptsInput_1Query as BusinessSrcOptsInputQuery,
  BusinessSrcOptsInput_1QueryVariables as BusinessSrcOptsInputQueryVariables,
  BusinessSrcBizOpts_1Fragment as BusinessSrcBizOptsFragment,
  BusinessSrcDeptOpts_1Fragment as BusinessSrcDeptOptsFragment,
  JournalEntrySourceType
} from "../../../apollo/graphTypes";

const BUSINESS_SRC_OPTS_INPUT_QUERY = gql`
  query BusinessSrcOptsInput_1($searchByName:String!) {
    bizOpts: businesses(searchByName:$searchByName) {
      ...BusinessSrcBizOpts_1Fragment
    }
  }
  fragment BusinessSrcBizOpts_1Fragment on Business {
    __typename
    id
    name
    deptOpts: departments {
      ...BusinessSrcDeptOpts_1Fragment
    }
  }
  fragment BusinessSrcDeptOpts_1Fragment on Department {
    __typename
    id
    name
    parent {
      __typename
      ...on Business {
        id
      }
      ...on Department {
        id
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

export interface BusinessSrcProps {
  entryUpsertId: string;
  autoFocus:boolean;
  variant:"filled" | "outlined";
}

const renderTags:AutocompleteProps["renderTags"] = (
  srcOpts:(BusinessSrcBizOptsFragment | BusinessSrcDeptOptsFragment)[],
  getTagProps) => 
{
  const lastIndex = srcOpts.length - 1;
  return srcOpts.map((srcOpt, index: number) => {
    const isLastIndex = lastIndex === index;
    return <Box 
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
    >
      <Chip
        color={isLastIndex ? "primary" : "default"}
        disabled={!isLastIndex}
        variant={isLastIndex ? "default" : "outlined"}
        label={srcOpt.name}
        size="small"
        {...getTagProps({index})}
      /> {!isLastIndex && <ChevronRight fontSize="small"/>}
    </Box>;
  });
}

const getSrcValue = (srcId:string | null, 
  opts:BusinessSrcOptsInputQuery["bizOpts"] | BusinessSrcDeptOptsFragment[]) =>
{
  if(srcId) {
    for(const opt of opts){
      if(opt.id === srcId){
        return opt;
      }
    }
  }
  return null;
}

const BusinessSrc = function(props:BusinessSrcProps) {
  
  const {entryUpsertId, autoFocus, variant} = props;

  // const classes = styles();
  
  const [open, setOpen] = useState(false);

  const {loading:loading1, error:error1, upsert, update}
    = useJournalEntryUpsert(entryUpsertId);

  const srcInput = upsert?.inputValues?.srcInput?.replace(leadingWS,"") || null;

  const selectedSources = upsert?.fields?.source || [];

  const {loading:loading2, error:error2, data} = 
    useQuery<BusinessSrcOptsInputQuery, BusinessSrcOptsInputQueryVariables>(
    BUSINESS_SRC_OPTS_INPUT_QUERY,{
      skip:!srcInput || selectedSources.length > 0,
      variables:{
        searchByName:(srcInput || "").substr(0,1).toLowerCase()
      }
    });
  
  const bizRefContainer = useRef(data?.bizOpts || []);

  if(loading1) {
    return <Skeleton variant="rect" height={56} />;
  } else if(error1 || error2) {
    console.error(error1 || error2);
    return <p>{(error1 || error2)?.message}</p>;
  }
  
  const bizId = selectedSources[0]?.id || null;
  
  const bizOpts = (() => {

    if(data?.bizOpts) {

      bizRefContainer.current = data.bizOpts;

    }

    return bizRefContainer.current;

  })();
  
  const bizVal = getSrcValue(bizId, bizOpts) as 
  (BusinessSrcBizOptsFragment | null);
  
  const deptOpts = bizVal?.deptOpts || [];
  
  const srcId = selectedSources[selectedSources.length -1]?.id || null;
  const srcVal = bizId === srcId ?
    bizVal : getSrcValue(srcId, deptOpts);
  
  const options = srcVal ? 
    deptOpts.filter((dept) => dept.parent.id === srcId) : [...bizOpts];

  // Switch to multi when there is source and there are option OR already multi
  const value = selectedSources.length > 0 && options.length > 0 ? 
    selectedSources.map(({id:srcId}, i) => {
      return getSrcValue(srcId, i === 0 ? bizOpts : deptOpts);
    }) : srcVal;
  

  const multiple = Array.isArray(value);
  
  const required = !(upsert?.fields?.id);

  const textFieldProps:TextFieldProps = {
    required,
    autoFocus,
    fullWidth:true,
    variant,
    label:multiple ? "Business > Departments..." : "Business"
  };

  const autocompleteProps:AutocompleteProps = {
    loading:loading2,
    open,
    autoHighlight:true,
    disableCloseOnSelect:true,
    renderTags:multiple ? (values: any[], getTagProps) => {
      const lastIndex = values.length - 1;
      return values.map((srcValue: any, index: number) => (<Chip
        disabled={index !== lastIndex}
        variant="outlined"
        label={srcValue.name}
        size="small"
        {...getTagProps({index})}
      />));
    } : undefined,
    getOptionLabel:(opt) => opt.name,
    filterOptions:(opts) => {
      if(srcInput === null || srcInput.length === 1) {
        return opts;
      }
      const test = new RegExp(`(^|\\s)${srcInput}`,'i');
      return opts.filter((opt) => test.test(opt.name));
    },
    renderInput:(params:RenderInputParams) => {
      return <TextField {...textFieldProps} {...params}/>
    },
  };

  // No selected values
  if(!srcVal) {

    autocompleteProps.multiple = false;
    autocompleteProps.freeSolo = true;
    autocompleteProps.options = [...bizOpts];
    autocompleteProps.inputValue = srcInput || "";
    autocompleteProps.value = null;
    autocompleteProps.onChange = (event,
      value:BusinessSrcBizOptsFragment | null = null) => 
    {

      // Allow for free solo, do NOT reset srcInput when there is nothing to 
      // add or clear
      if(value) {
        
        update.inputValues.srcInput(null);

        update.fields.addSource({
          sourceType:value.__typename === "Business" ? 
            JournalEntrySourceType.Business 
            : JournalEntrySourceType.Department,
          id:value.id
        });
      
      }

    }
    autocompleteProps.onInputChange = (event, value) => {
      value = value?.replace(leadingWS,"") || null;
      update.inputValues.srcInput(value);
    }
    autocompleteProps.onBlur = () => setOpen(false);
    autocompleteProps.onFocus = () => setOpen(true);
    autocompleteProps.onClose = () => setOpen(false);
    autocompleteProps.onOpen = () => setOpen(true);
  
  // Selected a business
  } else if(selectedSources.length === 1) {

    const options = deptOpts.filter((dept) => dept.parent.id === srcId)

    autocompleteProps.inputValue = srcInput || "";

    // Has NO depts
    if(options.length === 0) {

      autocompleteProps.multiple = false;
      autocompleteProps.open = false;
      // Change can ONLY be cleared
      autocompleteProps.onChange = (event) => {
        update.fields.clearSources();
      }
      autocompleteProps.value = srcVal;
      autocompleteProps.onInputChange = (event, value:string | null, reason) => 
      {
        value = value?.replace(leadingWS, "") || null;
        if(value !== srcVal.name.replace(leadingWS, "")) {
          update.fields.clearSources();
        }
        update.inputValues.srcInput(value);
      }

    // Has depts
    } else {

      autocompleteProps.multiple = true;
      autocompleteProps.options = options;
      autocompleteProps.value = [getSrcValue(bizVal?.id || null, bizOpts)];
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.onBlur = () => setOpen(false);
      autocompleteProps.onFocus = () => setOpen(true);
      autocompleteProps.onClose = () => setOpen(false);
      autocompleteProps.onOpen = () => setOpen(true);
      autocompleteProps.onChange = (event,
        sources:(BusinessSrcBizOptsFragment | BusinessSrcDeptOptsFragment)[] |
        BusinessSrcDeptOptsFragment | null) => 
      {
        sources = sources || null;
        update.inputValues.srcInput(null);
        if(sources) {

          if(Array.isArray(sources)) {
            
            update.fields.replaceSources(sources.map((src)=>({
              sourceType:src.__typename === "Business" ? 
                JournalEntrySourceType.Business 
                : JournalEntrySourceType.Department,
              id:src.id
            })));

          } else {

            update.fields.addSource({
              sourceType:JournalEntrySourceType.Department,
              id:sources.id
            });

          }

        } else {
          update.fields.clearSources();
        }
      }
      autocompleteProps.onInputChange = (event, value:string | null, reason) => 
      {
        if(reason === "reset") {
          return;
        }
        value = value?.replace(leadingWS, "") || null;
        update.inputValues.srcInput(value);
      }

    }

  } else {

    const options = deptOpts.filter((dept) => dept.parent.id === srcId);

    autocompleteProps.inputValue = srcInput || "";

    // Has NO sub depts
    if(options.length === 0) {
      
      autocompleteProps.disabled = true;
      autocompleteProps.inputValue = "";
      autocompleteProps.multiple = true;
      autocompleteProps.onChange = (event,
        sources:(BusinessSrcBizOptsFragment | BusinessSrcDeptOptsFragment)[] 
        | null) =>  
      {
        sources = sources || null;
        if(sources) {
          update.fields.replaceSources(sources.map((src)=>({
            sourceType:src.__typename === "Business" ? 
              JournalEntrySourceType.Business 
              : JournalEntrySourceType.Department,
            id:src.id
          })));
        } else {
          update.fields.clearSources();
        }
      }
      autocompleteProps.open = false;
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.value = selectedSources.map(({id}, i) => 
          getSrcValue(id, i === 0 ? bizOpts : deptOpts));

    // Has SUB depts
    } else {

      autocompleteProps.autoHighlight = true;
      autocompleteProps.multiple = true;
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.onBlur = () => setOpen(false);
      autocompleteProps.onFocus = () => setOpen(true);
      autocompleteProps.onClose = () => setOpen(false);
      autocompleteProps.onOpen = () => setOpen(true);
      autocompleteProps.options = options;
      autocompleteProps.inputValue = srcInput || "";
      autocompleteProps.value = selectedSources.map(({id}, i) => 
        getSrcValue(id, i === 0 ? bizOpts : deptOpts));
      autocompleteProps.onChange = (event,
        sources:(BusinessSrcBizOptsFragment | BusinessSrcDeptOptsFragment)[] |
        BusinessSrcDeptOptsFragment | null) => 
      {
        sources = sources || null;
        update.inputValues.srcInput(null);
        if(sources) {

          if(Array.isArray(sources)) {
            
            update.fields.replaceSources(sources.map((src)=>({
              sourceType:src.__typename === "Business" ? 
                JournalEntrySourceType.Business 
                : JournalEntrySourceType.Department,
              id:src.id
            })));

          } else {

            update.fields.addSource({
              sourceType:JournalEntrySourceType.Department,
              id:sources.id
            });

          }

        } else {
          update.fields.clearSources();
        }
      }
      autocompleteProps.onInputChange = (event, value:string | null, reason) => 
      {
        if(reason === "reset") {
          return;
        }
        value = value?.replace(leadingWS, "") || null;
        update.inputValues.srcInput(value);
      }

    }

  }

  return <Autocomplete {...autocompleteProps} />;

}

export default BusinessSrc;