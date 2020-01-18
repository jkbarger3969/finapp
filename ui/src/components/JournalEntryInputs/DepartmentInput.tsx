import React, {useMemo, useCallback} from "react";
import {useSelector} from "react-redux";
import {useQuery} from '@apollo/react-hooks';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import Autocomplete, {AutocompleteProps, RenderInputParams
} from '@material-ui/lab/Autocomplete';
import ChevronRight from '@material-ui/icons/ChevronRight';
import gql from 'graphql-tag';
import isEqual from "lodash.isequal";

import {DeptInputOpts_1Query as DeptInputOptsQuery, 
  DeptInputOpts_1QueryVariables as DeptInputOptsQueryVariables,
  DeptInputOptsDept_1Fragment as DeptInputOptsDeptFragment
} from '../../apollo/graphTypes';
import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch} from "../../redux/hooks";
import {setDeptInput, clearDeptInput, clearDeptValue, setDeptOpen, setDeptValue,
  validateDept
} from "../../redux/actions/journalEntryUpsert";
import {getDeptInput, getDept, isRequired, isDeptOpen, getDeptChain,
  getDeptError
} from "../../redux/selectors/journalEntryUpsert";

const DEPT_INPUT_OPTS_QUERY = gql`
  query DeptInputOpts_1($fromParent:ID) {
    deptOpts: departments(fromParent:$fromParent) {
      ...DeptInputOptsDept_1Fragment
    }
  }
  fragment DeptInputOptsDept_1Fragment on Department {
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

const rootParentId = "5dc4b09bcf96e166daaa0090";
const variables = {fromParent:rootParentId};

// Static cbs for AutocompleteProps
const filterOptions = (opts) => opts;
const getOptionLabel = (opt) => opt.name;
const renderTags:AutocompleteProps["renderTags"] = (
  values: DeptInputOptsDeptFragment[], getTagProps) => 
{
  const lastIndex = values.length - 1;
  return values.map((dept:any, index: number) => {
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
        label={dept.name}
        size="small"
        {...getTagProps({index})}
      /> {!isLastIndex && <ChevronRight fontSize="small"/>}
    </Box>;
  });
}

const getDeptValue = (deptId:string | null, 
    deptOpts:DeptInputOptsQuery['deptOpts']) =>
{
  if(deptId) {
    for(const dept of deptOpts){
      if(dept.id === deptId){
        return dept;
      }
    }
  }
  return null;
}

interface SelectorResult {
  deptInput:string;
  dept:string | null;
  deptChain:string[];
  required:boolean;
  open:boolean;
  hasError:boolean;
  errorMsg:string | null;
}

export interface DepartmentInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const DepartmentInput = function(props:DepartmentInputProps) 
{
  
  const {entryUpsertId, autoFocus = false, variant = 'filled'} = props;
  
  const dispatch = useDebounceDispatch();

  const validate  = useCallback(() => {
    dispatch(validateDept(entryUpsertId))
  },[dispatch, entryUpsertId]);

  const onBlur = useCallback(() => {
    dispatch(setDeptOpen(entryUpsertId, false));
    validate();
  },[
    entryUpsertId, 
    dispatch,
    validate
  ]);
  const onFocus = useCallback(() => dispatch(setDeptOpen(entryUpsertId, true)),[
    entryUpsertId, 
    dispatch
  ]);
  const onClose = useCallback(() => {
    dispatch(setDeptOpen(entryUpsertId, false));
    validate();
  },[
    entryUpsertId, 
    dispatch,
    validate
  ]);
  const onOpen = useCallback(() => dispatch(setDeptOpen(entryUpsertId, true)),[
    entryUpsertId, 
    dispatch
  ]);

  const {
    deptInput, dept, deptChain, required, open, hasError, errorMsg
  } = useSelector<Root, SelectorResult>((state)=>{

    const dept = getDept(state, entryUpsertId);

    const error = getDeptError(state, entryUpsertId);

    const deptChain = getDeptChain(state, entryUpsertId);

    return {
      deptInput:getDeptInput(state, entryUpsertId),
      dept,
      deptChain,
      required:isRequired(state, entryUpsertId),
      open:isDeptOpen(state, entryUpsertId),
      hasError:!!error,
      errorMsg:error?.message || null
    };

  },isEqual);

  const {loading, error, data} = 
    useQuery<DeptInputOptsQuery, DeptInputOptsQueryVariables>(
      DEPT_INPUT_OPTS_QUERY,{
      variables
    });
  
  const deptOpts = data?.deptOpts || [];

  const deptVal = useMemo(()=>getDeptValue(dept, deptOpts),[dept, deptOpts]);

  const options = useMemo(()=>{
    
    if(!deptInput) {
      return dept ? deptOpts.filter((opt)=> opt.parent.id === dept) : deptOpts;
    }

    const test = new RegExp(`(^|\\s)${deptInput}`,'i');

    if(dept) {
      return deptOpts.filter((opt) => 
        opt.parent.id === dept && test.test(opt.name));
    }

    return deptOpts.filter((opt) => test.test(opt.name));

  },[dept, deptInput, deptOpts]);

  const hasOptions = options.length > 0;

  const value = useMemo(()=>{

    if(!deptVal) {
      return null;
    }

    const value:typeof deptOpts = [];

    // deptVal is ALWAYS the last dept in the chain
    for(let i = 0, len = deptChain.length -1; i < len; i++) {
      value.push(
        getDeptValue(deptChain[i], deptOpts) as DeptInputOptsDeptFragment);
    }

    value.push(deptVal);

    if(value.length === 1) {
      return hasOptions ? value : value[0];
    }

    return value;

  },[deptOpts, deptChain, deptVal, hasOptions]);

  const multiple = Array.isArray(value);
  
  type Value = typeof value;

  const onChange = useCallback((event, value:Value) => {

    if(value) {
      
      value = Array.isArray(value) ? value : [value];

      dispatch(setDeptValue(entryUpsertId, value.map((dept, i) => dept.id)));
      dispatch(clearDeptInput(entryUpsertId));

      if(hasError) {
        validate();
      }
      
    } else {
      
      dispatch(clearDeptValue(entryUpsertId));

    }

  },[entryUpsertId, dispatch, hasError, validate]);

  const onInputChange = useCallback((event:any, value:string) => {
    if(value) {
      dispatch(setDeptInput(entryUpsertId, value));
    } else {
      dispatch(clearDeptInput(entryUpsertId));
    }
  },[dispatch, entryUpsertId]);

  const textFieldProps:TextFieldProps = {
    required,
    autoFocus,
    fullWidth:true,
    label:"Department",
    variant,
    error:hasError,
    helperText:errorMsg
  };
  
  const renderInput = useCallback((params:RenderInputParams) => {
    return <TextField {...textFieldProps} {...params}/>
  },[textFieldProps]);

  const autocompleteProps:AutocompleteProps = {
    loading,
    multiple,
    autoComplete:true,
    disableCloseOnSelect:true,
    getOptionLabel,
    filterOptions,
    open,
    renderInput,
    options,
    onChange,
    onInputChange,
    value,
    inputValue:deptInput
  };
  
  if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

  // No selected values
  if(!deptVal) {
    
    autocompleteProps.autoHighlight = true;
    autocompleteProps.autoSelect = true;
    autocompleteProps.onBlur = onBlur;
    autocompleteProps.onFocus = onFocus;
    autocompleteProps.onClose = onClose;
    autocompleteProps.onOpen = onOpen;
  
  // Only ROOT department is selected
  } else if(deptChain.length === 1) {

    // Has sub-depts
    if(hasOptions) {
      
      autocompleteProps.autoHighlight = true;
      autocompleteProps.onBlur = onBlur;
      autocompleteProps.onFocus = onFocus;
      autocompleteProps.onClose = onClose;
      autocompleteProps.onOpen = onOpen;
      autocompleteProps.options = options;
      autocompleteProps.renderTags = renderTags;

    // Has NO sub-depts
    } else {

      autocompleteProps.onBlur = validate as any;
      autocompleteProps.inputValue = deptVal.name;
      autocompleteProps.open = false;

    }

  } else {

    // Has NO sub-depts
    if(hasOptions) {
      
      autocompleteProps.autoHighlight = true;
      autocompleteProps.onBlur = onBlur;
      autocompleteProps.onFocus = onFocus;
      autocompleteProps.onClose = onClose;
      autocompleteProps.onOpen = onOpen;
      autocompleteProps.options = options
      autocompleteProps.renderTags = renderTags;
    
    // Has sub-depts
    } else {
      
      autocompleteProps.onBlur = validate as any;
      autocompleteProps.disabled = true;
      autocompleteProps.inputValue = "";
      autocompleteProps.open = false;
      autocompleteProps.renderTags = renderTags;

    }

  }

  return <Autocomplete {...autocompleteProps} />;

}

export default DepartmentInput;