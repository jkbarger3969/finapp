import React, {useRef, useMemo, useCallback} from "react";
import {useSelector} from "react-redux";
import {useQuery, useApolloClient} from "@apollo/react-hooks";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import Box from '@material-ui/core/Box';
import Autocomplete, {AutocompleteProps, RenderInputParams
} from "@material-ui/lab/Autocomplete";
import ChevronRight from '@material-ui/icons/ChevronRight';
import gql from "graphql-tag";
import isEqual from "lodash.isequal";

import {BusinessSrcOptsInput_1Query as BusinessSrcOptsInputQuery,
  BusinessSrcOptsInput_1QueryVariables as BusinessSrcOptsInputQueryVariables,
  BusinessSrcBizOpts_1Fragment as BusinessSrcBizOptsFragment,
  BusinessSrcDeptOpts_1Fragment as BusinessSrcDeptOptsFragment,
  JournalEntrySourceType, JournalEntrySourceInput,
  JournalEntryType
} from "../../../apollo/graphTypes";
import {Root} from "../../../redux/reducers/root";
import {useDebounceDispatch} from "../../../redux/hooks";
import {setSrcInput, clearSrcInput, clearSrcValue, setSrcOpen, setSrcValue,
  validateSrc
} from "../../../redux/actions/journalEntryUpsert";
import {getSrcInput, getSrc, isRequired, isSrcOpen, getSrcError,
  getType, getUpsertType, UpsertType
} from "../../../redux/selectors/journalEntryUpsert";

const BIZ_SRC_DEPT_OPTS_FRAGMENT = gql`
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

const BIZ_SRC_BIZ_OPTS_FRAGMENT = gql`
  fragment BusinessSrcBizOpts_1Fragment on Business {
    __typename
    id
    name
    vendor {
      approved
      vendorId
    }
    deptOpts: departments {
      ...BusinessSrcDeptOpts_1Fragment
    }
  }
  ${BIZ_SRC_DEPT_OPTS_FRAGMENT}
`;

const BUSINESS_SRC_OPTS_INPUT_QUERY = gql`
  query BusinessSrcOptsInput_1($searchByName:String!, $deptId:ID!, $bizId:ID!,
    $withBizOpt:Boolean!, $withDeptAncestors:Boolean!, $withBizOpts:Boolean!)
  {
    bizOpt: business(id: $bizId) @include(if:$withBizOpt) {
      ...BusinessSrcBizOpts_1Fragment
    }
    deptAncestors: department(id: $deptId) @include(if:$withDeptAncestors) {
      __typename
      id
      ancestors {
        ...BusinessSrcBizOpts_1Fragment
        ...BusinessSrcDeptOpts_1Fragment
      }
    }
    bizOpts: businesses(searchByName:$searchByName) @include(if:$withBizOpts) {
      ...BusinessSrcBizOpts_1Fragment
    }
  }
  ${BIZ_SRC_BIZ_OPTS_FRAGMENT}
`;

// Static cbs for AutocompleteProps
const getOptionLabel = (opt) => opt.name;
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

interface SelectorResult  {
  upsertType:UpsertType | null;
  disabled:boolean;
  srcInput:string;
  type:JournalEntryType | null;
  src:JournalEntrySourceInput | null;
  isSrcSet:boolean;
  required:boolean;
  open:boolean;
  hasError:boolean;
  errorMsg:string | null;
}

export interface BusinessSrcProps {
  entryUpsertId: string;
  autoFocus:boolean;
  variant:"filled" | "outlined";
}

const BusinessSrc = function(props:BusinessSrcProps) {
  
  const {entryUpsertId, autoFocus, variant} = props;
  
  const client = useApolloClient();

  const dispatch = useDebounceDispatch();
  
  const {disabled, srcInput, type, src, isSrcSet, required,
    open, hasError, errorMsg, upsertType
  } = useSelector<Root, SelectorResult>((state) => {

    const src = getSrc(state, entryUpsertId);

    const error = getSrcError(state, entryUpsertId);

    return {
      upsertType:getUpsertType(state, entryUpsertId),
      disabled:getType(state, entryUpsertId) === null,
      srcInput:getSrcInput(state, entryUpsertId),
      type:getType(state, entryUpsertId),
      src,
      isSrcSet:!!src,
      required:isRequired(state, entryUpsertId),
      open:isSrcOpen(state, entryUpsertId),
      hasError:!!error,
      errorMsg:error?.message || null
    };

  }, isEqual);

  const validate  = useCallback(() => {
    dispatch(validateSrc(entryUpsertId))
  },[dispatch, entryUpsertId]);

  const onBlur = useCallback(() => {
    dispatch(setSrcOpen(entryUpsertId, false));
    validate();
  },[
    entryUpsertId, 
    dispatch,
    validate
  ]);
  const onFocus = useCallback(() => dispatch(setSrcOpen(entryUpsertId, true)),[
    entryUpsertId, 
    dispatch
  ]);
  const onClose = useCallback(() => dispatch(setSrcOpen(entryUpsertId, false)),[
    entryUpsertId, 
    dispatch
  ]);
  const onOpen = useCallback(() => dispatch(setSrcOpen(entryUpsertId, true)),[
    entryUpsertId, 
    dispatch
  ]);

  const searchCharRef = useRef("");
  if(!isSrcSet) {
    searchCharRef.current = srcInput.substr(0,1).toLowerCase();
  }

  const {loading, error, data} = 
    useQuery<BusinessSrcOptsInputQuery, BusinessSrcOptsInputQueryVariables>(
    BUSINESS_SRC_OPTS_INPUT_QUERY,{
      skip:!searchCharRef.current && upsertType !== UpsertType.Update,
      variables:{
        searchByName:searchCharRef.current,
        deptId:src?.id || "",
        bizId:src?.id || "",
        withBizOpts:upsertType === UpsertType.Add || !isSrcSet,
        withBizOpt:upsertType === UpsertType.Update &&
          src?.sourceType === JournalEntrySourceType.Business,
        withDeptAncestors:upsertType === UpsertType.Update &&
        src?.sourceType === JournalEntrySourceType.Department
      }
    });

  const srcVal = useMemo(() => {
    if(!src || !data) {
    
      return null;
    
    } else if(src.sourceType === JournalEntrySourceType.Business) {
      
      return client.readFragment<BusinessSrcDeptOptsFragment>({
        id:`Business:${src.id}`,
        fragment:BIZ_SRC_BIZ_OPTS_FRAGMENT,
        fragmentName:"BusinessSrcBizOpts_1Fragment"
      }) || null;
      
    }

    return client.readFragment<BusinessSrcDeptOptsFragment>({
      id:`Department:${src.id}`,
      fragment:BIZ_SRC_DEPT_OPTS_FRAGMENT
    }) || null;
  
  },[src, client, data]);

  const valueChain = useMemo(() => {

    if(!srcVal) {
      return [];
    }

    const value:(BusinessSrcBizOptsFragment | BusinessSrcDeptOptsFragment)[] = 
      [srcVal];

    const getParent = (srcVal:BusinessSrcBizOptsFragment |
      BusinessSrcDeptOptsFragment):BusinessSrcBizOptsFragment |
        BusinessSrcDeptOptsFragment | null =>
    {

      if(srcVal.__typename === "Business") {
        return null;
      
      } else if(srcVal.parent.__typename === "Business") {

        return client.readFragment({
          id:`Business:${srcVal.parent.id}`,
          fragment:BIZ_SRC_BIZ_OPTS_FRAGMENT,
          fragmentName:"BusinessSrcBizOpts_1Fragment"
        }) || null;

      }

      return client.readFragment({
        id:`Department:${srcVal.parent.id}`,
        fragment:BIZ_SRC_DEPT_OPTS_FRAGMENT
      }) || null;


    }

    let parent = getParent(srcVal);
    while(parent) {
      value.unshift(parent);
      parent = getParent(parent);
    }
    
    return value;

  }, [srcVal, client]);

  const options = useMemo(() => {

    if(!valueChain || !srcVal) {
      return data?.bizOpts || [];
    }

    const bizVal = valueChain[0] as BusinessSrcBizOptsFragment;

    return (bizVal?.deptOpts || [])
      .filter((deptOpt) => deptOpt.parent.id === srcVal.id);

  },[srcVal, valueChain, data]);

  const hasOptions = options.length > 0;

  const value = useMemo(() => {
    if(valueChain.length > 1) {
      return valueChain;
    } else if(valueChain.length === 1 && !hasOptions) {
      return valueChain[0] as BusinessSrcBizOptsFragment;
    } 
    return null;
  },[valueChain, hasOptions]);

  const multiple = Array.isArray(value);
  
  const textFieldProps:TextFieldProps = useMemo(()=>({
    required,
    autoFocus,
    fullWidth:true,
    variant,
    label:multiple ? "Business > Departments..." : "Business",
    error:hasError,
    helperText: type === null ? "Select a Category to unlock." : errorMsg
  }),[required, autoFocus, variant, multiple, hasError, errorMsg, type]);
  
  const renderInput = useCallback((params:RenderInputParams) => {
    return <TextField {...textFieldProps} {...params}/>
  },[textFieldProps]);

  type Value = typeof value;

  const onChange = useCallback((event, value:Value) => {

    if(value) {
      
      const newValue = Array.isArray(value) ? value[value.length - 1] : value;

      dispatch(setSrcValue(entryUpsertId, {
        sourceType:newValue.__typename === "Business" ? 
        JournalEntrySourceType.Business : JournalEntrySourceType.Department,
        id:newValue.id
      }));
      dispatch(clearSrcInput(entryUpsertId));

      if(hasError) {
        validate();
      }
      
    } else {
      
      dispatch(clearSrcValue(entryUpsertId));

    }

  },[entryUpsertId, dispatch, hasError, validate]);

  const onInputChange = useCallback((event:any, value:string) => {
    if(value) {
      dispatch(setSrcInput(entryUpsertId, value));
    } else {
      dispatch(clearSrcInput(entryUpsertId));
    }
  },[dispatch, entryUpsertId]);

  const filterOptions = useCallback((opts:(BusinessSrcBizOptsFragment |
    BusinessSrcDeptOptsFragment)[]) => 
  {

    const searchText = srcInput.trimStart().split(" ").join("\\s");

    if(searchText === "") {
      return opts;
    }

    const test = new RegExp(`\\s*${searchText}`,"i");

    return opts.filter((opt) => test.test(opt.name));

  },[srcInput]);

  const autocompleteProps:AutocompleteProps = {
    loading,
    disabled:!type || disabled,
    multiple,
    open,
    options,
    autoHighlight:true,
    disableCloseOnSelect:true,
    getOptionLabel,
    filterOptions,
    renderInput,
    onChange,
    onInputChange,
    value,
    inputValue:srcInput
  };

  if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

  // No selected values
  if(!srcVal) {

    autocompleteProps.multiple = false;
    autocompleteProps.freeSolo = true;
    
    autocompleteProps.onBlur = onBlur;
    autocompleteProps.onFocus = onFocus;
    autocompleteProps.onClose = onClose;
    autocompleteProps.onOpen = onOpen;
  
  // Selected a business
  } else if(!Array.isArray(value) || value.length === 1) {

    // Has NO depts
    if(options.length === 0) {
      
      autocompleteProps.inputValue = srcVal.name;
      autocompleteProps.open = false;

    // Has depts
    } else {

      autocompleteProps.renderTags = renderTags;
      autocompleteProps.onBlur = onBlur;
      autocompleteProps.onFocus = onFocus;
      autocompleteProps.onClose = onClose;
      autocompleteProps.onOpen = onOpen;

    }

  } else {


    // Has NO sub depts
    if(options.length === 0) {
      
      autocompleteProps.disabled = true;
      autocompleteProps.inputValue = "";
      autocompleteProps.open = false;
      autocompleteProps.renderTags = renderTags;

    // Has SUB depts
    } else {

      autocompleteProps.autoHighlight = true;
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.onBlur = onBlur;
      autocompleteProps.onFocus = onFocus;
      autocompleteProps.onClose = onClose;
      autocompleteProps.onOpen = onOpen;

    }

  }

  return <Autocomplete {...autocompleteProps} />;

}

export default BusinessSrc;