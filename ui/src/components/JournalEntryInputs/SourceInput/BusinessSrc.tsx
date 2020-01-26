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
import {getSrcInput, getSrc, isRequired, isSrcOpen, getSrcChain, getSrcError,
  getType
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
  query BusinessSrcOptsInput_1($searchByName:String!) {
    bizOpts: businesses(searchByName:$searchByName) {
      ...BusinessSrcBizOpts_1Fragment
    }
  }
  ${BIZ_SRC_BIZ_OPTS_FRAGMENT}
`;

// Static cbs for AutocompleteProps
const filterOptions = (opts) => opts;
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
  disabled:boolean;
  srcInput:string;
  type:JournalEntryType | null;
  src:JournalEntrySourceInput | null;
  bizSrc:JournalEntrySourceInput | null;
  srcChain:JournalEntrySourceInput[];
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
  
  const {disabled, srcInput, type, src, bizSrc, srcChain, isSrcSet, required,
    open, hasError, errorMsg
  } = useSelector<Root, SelectorResult>((state) => {

    const src = getSrc(state, entryUpsertId);

    const error = getSrcError(state, entryUpsertId);

    const srcChain = getSrcChain(state, entryUpsertId);

    return {
      disabled:getType(state, entryUpsertId) === null,
      srcInput:getSrcInput(state, entryUpsertId),
      type:getType(state, entryUpsertId),
      src,
      bizSrc:srcChain[0] || null,
      srcChain,
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
      skip:!searchCharRef.current,
      variables:{
        searchByName:searchCharRef.current
      }
    });
  
  const bizOpts = useMemo(() => {
    
    const bizOpts = data?.bizOpts || [];

    if(type !== JournalEntryType.Credit) {
      return bizOpts.filter(bizOpt => !!(bizOpt?.vendor?.approved));
    }

    return bizOpts;

  }, [data, type]);
  
  const bizVal = useMemo(() => {
    if(bizSrc) {
      // Read fragment, so that when submitting a new business, the new business 
      // is pulled from the cache
      return client.readFragment<BusinessSrcBizOptsFragment>({
        id:`Business:${bizSrc.id}`,
        fragment:BIZ_SRC_BIZ_OPTS_FRAGMENT,
        fragmentName: "BusinessSrcBizOpts_1Fragment",
      }) || null;
    }
    return null;
  },[client, bizSrc]);

  const deptOpts = useMemo(() => bizVal?.deptOpts || [], [bizVal]);

  const srcVal = useMemo(() => {
    if(isEqual(src, bizSrc)) {
  
      return bizVal;
  
    } else if(src) {
      
      return client.readFragment<BusinessSrcDeptOptsFragment>({
        id:`Department:${src.id}`,
        fragment:BIZ_SRC_DEPT_OPTS_FRAGMENT
      }) || null;
    
    }
    return null;
  },[src, bizSrc, client, bizVal]);

  const options = useMemo(()=>{

    // Shape addresses TS weirdness. BE CAREFUL when modifying,
    // Both types of options biz and dept MUST be filtered separately.
    if(!srcInput) {
      
      return srcVal ? 
        deptOpts.filter((opt) => opt.parent.id === srcVal.id) : bizOpts;

    }

    const test = new RegExp(`(^|\\s)${srcInput}`,'i');

    if(srcVal) {
      return deptOpts.filter((opt:any) => 
        opt.parent.id === srcVal.id && test.test(opt.name));
    }
    
    // No src ALWAYS bizOpts
    return bizOpts.filter((opt:any) => test.test(opt.name));
  
  },[srcInput, srcVal, bizOpts, deptOpts]);

  const hasOptions = options.length > 0;

  const value = useMemo(() => {

    const value:(BusinessSrcBizOptsFragment | BusinessSrcDeptOptsFragment)[] = 
      [];

    // If there is NO bizVal there is NO value.
    if(!bizVal) {
      return null;
    }

    value.push(bizVal);

    // bizVal is always the first and srcVal the last value
    for(let i = 1, stop = srcChain.length - 1; i < stop; i++) {
      const src = srcChain[i];
      const deptOpt = client.readFragment<BusinessSrcDeptOptsFragment>({
        id:`Department:${src.id}`,
        fragment:BIZ_SRC_DEPT_OPTS_FRAGMENT
      }) || null;
      
      if(deptOpt) {
        value.push(deptOpt);
      }
    
    }

    if(srcVal && srcVal !== bizVal) {
      value.push(srcVal);
    }

    const numValues = value.length;

    if(numValues === 1) {
      return hasOptions ? value : value[0] as BusinessSrcBizOptsFragment;
    }
    
    return value;

  }, [bizVal, srcVal, srcChain, hasOptions, client]);

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
      
      value = Array.isArray(value) ? value : [value];

      dispatch(setSrcValue(entryUpsertId, value.map((src, i) =>({
        sourceType:i === 0 ? 
          JournalEntrySourceType.Business : JournalEntrySourceType.Department,
        id:src.id
      }))));
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
  } else if(srcChain.length === 1) {

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