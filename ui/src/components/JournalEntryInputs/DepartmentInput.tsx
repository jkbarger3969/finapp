import React, {useMemo, useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import Autocomplete, {AutocompleteProps, RenderInputParams
} from '@material-ui/lab/Autocomplete';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Skeleton from '@material-ui/lab/Skeleton';
import gql from 'graphql-tag';

import useJournalEntryUpsert from "./useJournalEntryUpsert";
import {DeptInputOpts_1Query as DeptInputOptsQuery, 
  DeptInputOpts_1QueryVariables as DeptInputOptsQueryVariables,
  DeptInputOptsDept_1Fragment as DeptInputOptsDeptFragment
} from '../../apollo/graphTypes';

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

const leadingWS = /^\s+/;

const rootParentId = "5dc4b09bcf96e166daaa0090";
const variables = {fromParent:rootParentId};

export interface DepartmentInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

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

const DepartmentInput = function(props:DepartmentInputProps) 
{
  
  const {entryUpsertId, autoFocus = false, variant = 'filled'} = props;
  
  const {loading:loading1, error:error1, upsert, update, write}
    = useJournalEntryUpsert(entryUpsertId);

  const {loading:loading2, error:error2, data} = 
    useQuery<DeptInputOptsQuery, DeptInputOptsQueryVariables>(
      DEPT_INPUT_OPTS_QUERY,{
      variables
    });
  
  const [open, setOpen] = useState(false);

  
  const required = !(upsert?.fields?.id);
  const selectedDepts = upsert?.fields?.department || [];
  const deptId = selectedDepts[selectedDepts.length -1] || null;
  
  const deptInput = upsert?.inputValues?.deptInput || null;
  
  const deptOpts = data?.deptOpts || [];
  
  const deptVal = 
    useMemo(()=>getDeptValue(deptId, deptOpts),[deptOpts, deptId]);
  

  if(loading1){
    return <Skeleton variant="rect" height={56}/>;
  } else if(error1 || error2) {
    console.error(error1 || error2);
    return <p>{(error1 || error2)?.message}</p>;
  }

  const textFieldProps:TextFieldProps = {
    required,
    autoFocus,
    fullWidth:true,
    label:"Department",
    variant
  };

  const autocompleteProps:AutocompleteProps = {
    loading:loading2,
    autoComplete:true,
    disableCloseOnSelect:true,
    getOptionLabel:(opt) => opt.name,
    filterOptions:(opts) => {
      if(!deptInput) {
        return opts;
      }
      const test = new RegExp(`(^|\\s)${deptInput.trim().split(' ')
        .join('\\s')}`,'i');
      return opts.filter((opt) => test.test(opt.name));
    },
    open,
    renderInput:(params:RenderInputParams) => {
      return <TextField {...textFieldProps} {...params}/>
    },
  };
  
  // No selected values
  if(!deptVal) {
    
    autocompleteProps.autoHighlight = true;
    autocompleteProps.autoSelect = true;
    autocompleteProps.onChange = (event, dept:DeptInputOptsDeptFragment) => {
      // update.inputValues.deptInput(null);
      if(dept) {
        write({
          inputValues:{
            deptInput:null,
          },
          fields:{
            department:[dept.id]
          }
        },"replace", true);
      } else {
        write({
          inputValues:{
            deptInput:null,
          },
          fields:{
            department:[]
          }
        },"replace", true);
      }
    }
    autocompleteProps.onBlur = () => setOpen(false);
    autocompleteProps.onFocus = () => setOpen(true);
    autocompleteProps.onClose = () => setOpen(false);
    autocompleteProps.onOpen = () => setOpen(true);
    autocompleteProps.onInputChange = (event, value:string | null, reason) => {
      value = value?.replace(leadingWS, "") || null;
      write({
        inputValues:{
          deptInput:value,
        }
      },"replace", true);
    }
    autocompleteProps.options = 
      deptOpts.filter(({parent}) => parent.id === rootParentId);
    autocompleteProps.inputValue = deptInput || "";
    autocompleteProps.value = null;
  
  // Only ROOT department is selected
  } else if(selectedDepts.length === 1) {

    const options = deptOpts.filter(({parent}) => parent.id === deptVal.id);

    autocompleteProps.inputValue = deptInput || "";

    // Has NO sub-depts
    if(options.length === 0) {

      // Change can ONLY be cleared
      autocompleteProps.onChange = (event) => {
        update.fields.clearDepartments();
      }
      autocompleteProps.onInputChange = (event, value:string | null, reason) => 
      {
        value = value?.replace(leadingWS, "") || null;
        if(value !== deptVal.name.replace(leadingWS, "")) {
          update.fields.clearDepartments();
        }
        update.inputValues.deptInput(value);   
      }
      autocompleteProps.open = false;
      autocompleteProps.value = deptVal;

    // Has sub-depts
    } else {
      
      autocompleteProps.autoHighlight = true;
      autocompleteProps.multiple = true;
      autocompleteProps.onChange = (event,
        depts:DeptInputOptsDeptFragment[] | null) => 
      {
        depts = depts || null;
        // update.inputValues.deptInput(null);
        if(depts) {
          write({
            inputValues:{
              deptInput:null
            },
            fields:{
              department:depts.map(({id})=>id)
            }
          },"replace", true);
          // update.fields.replaceDepartments(depts.map(({id})=>id));
        // Clear input and departments 
        } else {
          write({
            inputValues:{
              deptInput:null,
            },
            fields:{
              department:[]
            }
          },"replace", true);
        }
      }
      autocompleteProps.onInputChange = (event, value:string | null, reason) => 
      {
        if(reason === "reset") {
          return;
        }
        value = value?.replace(leadingWS, "") || null;
        write({
          inputValues:{
            deptInput:value,
          }
        },"replace", true);
      }
      autocompleteProps.onBlur = () => setOpen(false);
      autocompleteProps.onFocus = () => setOpen(true);
      autocompleteProps.onClose = () => setOpen(false);
      autocompleteProps.onOpen = () => setOpen(true);
      autocompleteProps.options = options;
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.value = 
        selectedDepts.map((deptId) => getDeptValue(deptId, deptOpts));
      
    }

  } else {

    const options = deptOpts.filter(({parent}) => parent.id === deptVal.id);

    // Has NO sub-depts
    if(options.length === 0) {
      
      autocompleteProps.disabled = true;
      autocompleteProps.inputValue = "";
      autocompleteProps.multiple = true;
      autocompleteProps.onChange = (event,
        depts:DeptInputOptsDeptFragment[] | null) => 
      {
        depts = depts || [];
        if(depts) {
          update.fields.replaceDepartments(depts.map(({id})=>id));
        } else {
          update.fields.clearDepartments();
        }
      }
      autocompleteProps.open = false;
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.value = 
        selectedDepts.map((deptId) => getDeptValue(deptId, deptOpts));
    
    // Has sub-depts
    } else {
      
      autocompleteProps.autoHighlight = true;
      autocompleteProps.inputValue = deptInput || "";
      autocompleteProps.multiple = true;
      autocompleteProps.onChange = (event,
        depts:DeptInputOptsDeptFragment[] | null) => 
      {
        depts = depts || null;
        update.inputValues.deptInput(null);
        if(depts) {
          update.fields.replaceDepartments(depts.map(({id})=>id));
        } else {
          update.fields.clearDepartments();
        }
      }
      autocompleteProps.onInputChange = (event, value:string | null, reason) => 
      {
        if(reason === "reset") {
          return;
        }
        value = value?.replace(leadingWS, "") || null;
        update.inputValues.deptInput(value);
      }
      autocompleteProps.onBlur = () => setOpen(false);
      autocompleteProps.onFocus = () => setOpen(true);
      autocompleteProps.onClose = () => setOpen(false);
      autocompleteProps.onOpen = () => setOpen(true);
      autocompleteProps.options = options
      autocompleteProps.renderTags = renderTags;
      autocompleteProps.value = 
        selectedDepts.map((deptId) => getDeptValue(deptId, deptOpts));

    }

  }

  return <Autocomplete {...autocompleteProps} />;

}

export default DepartmentInput;