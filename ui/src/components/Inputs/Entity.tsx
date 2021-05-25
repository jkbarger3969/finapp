import { useQuery } from "@apollo/client";
import TreeSelect, { BranchOption, defaultInput, FreeSoloValue, TreeSelectProps } from "mui-tree-select";
import React, { useCallback, useMemo, useState } from "react";
import { Skeleton } from '@material-ui/lab';

import {
  EntityInputIniValueQuery as EntityInputIniValue,
  EntityInputIniValueQueryVariables as EntityInputIniValueVars,
  EntityInputOptsQuery as EntityInputOpts,
  EntityInputOptsQueryVariables as EntityInputOptsVars,
  EntityBusinessInputOptFragment,
  EntityPersonInputOptFragment,
  DeptInputOptFragment,
  RegexFlags,
  EntitiesWhere,
} from "../../apollo/graphTypes";
import { ENTITY_INPUT_INI_VALUE } from "./entityInputUtils";
import {
  getOptionLabel as getOptionLabelDept,
} from "./departmentInputUtils";

export type EntityDefaultInputOpt =
  | EntityBusinessInputOptFragment["__typename"]
  | EntityPersonInputOptFragment["__typename"];

export type EntityInputOpt =
  | EntityBusinessInputOptFragment
  | DeptInputOptFragment
  | EntityPersonInputOptFragment;

export type EntityBranchInputOpt =
  | EntityDefaultInputOpt
  | EntityBusinessInputOptFragment
  | DeptInputOptFragment;

export type EntityTreeSelectProps = TreeSelectProps<
  EntityInputOpt,
  EntityBranchInputOpt,
  undefined,
  undefined,
  true | false
>;

export type EntityInputProps = {
  treeSelectParams?: Pick<EntityTreeSelectProps, "renderInput" | "disabled" | "onBranchChange" | "branchPath" | "onChange" | "value">;
  iniValue?: EntitiesWhere;
  allowNewBusiness?: boolean;
  allowNewPerson?: boolean;
};

export const getOptionLabel: NonNullable<
  EntityTreeSelectProps["getOptionLabel"]
> = (option) => {
  const opt = option instanceof BranchOption ? option.option : option;

  if (opt instanceof FreeSoloValue) {
    return opt.toString();
  } else if (typeof opt === "string") {
    return opt;
  } else {
    switch (opt.__typename) {
      case "Business":
        return opt.name;
      case "Person":
        return `${opt.personName.first} ${opt.personName.last}`;
      case "Department":
        return getOptionLabelDept(opt);
    }
  }
};

export const getOptionSelected: NonNullable<
  EntityTreeSelectProps["getOptionSelected"]
> = (option, value) => {
  if (typeof option === "string") {
    return option === value;
  } else if (typeof value === "string") {
    return false;
  } else {
    return option.id === value.id;
  }
};

export const SourceInput = (props: EntityInputProps) => {
  const {
    treeSelectParams,
    allowNewBusiness = false,
    allowNewPerson = false,
  } = props;

  const [state, setState] = useState<{
    iniValue?: EntitiesWhere;
    branchPath:NonNullable<EntityTreeSelectProps["branchPath"]>
    value:Exclude<EntityTreeSelectProps["value"], undefined>;
  }>({
    iniValue: props.iniValue,
    branchPath: [],
    value:null
  });

  const branchPathIsControlled = !!treeSelectParams?.branchPath;
  const branchPath = treeSelectParams?.branchPath || state.branchPath;

  const valueIsControlled = treeSelectParams?.value ===  undefined;
  const value = valueIsControlled ? state.value : treeSelectParams?.value;

  const onBranchChange = useCallback<NonNullable<EntityTreeSelectProps["onBranchChange"]>>((...args)=>{

    if(!branchPathIsControlled) {
      setState((state)=>({
        ...state,
        branchPath:args[2]
      }));
    }

    if(treeSelectParams?.onBranchChange) {
      treeSelectParams?.onBranchChange(...args);
    }

  },[treeSelectParams?.onBranchChange, branchPathIsControlled])

  const onChange = useCallback<NonNullable<EntityTreeSelectProps["onChange"]>>((...args)=>{

    if(!valueIsControlled) {
      setState((state)=>({
        ...state,
        value:args[1]
      }));
    }

    if(treeSelectParams?.onChange) {
      treeSelectParams.onChange(...args);
    }

  },[treeSelectParams?.onChange, valueIsControlled]);

  const iniValueResult = useQuery<EntityInputIniValue, EntityInputIniValueVars>(
    ENTITY_INPUT_INI_VALUE,
    {
      skip: !state.iniValue,
      variables:{
        where:state.iniValue as EntitiesWhere
      },
    }
  );

  const renderInput = useCallback<
    NonNullable<EntityTreeSelectProps["renderInput"]>
  >(
    (params) => {
      const curBranch =
        branchPath[branchPath.length - 1]
          ?.option;

      if(iniValueResult.loading) {
        return <Skeleton variant="rect" animation="wave" /> 
      } else if (iniValueResult.error) {
        return (treeSelectParams?.renderInput || defaultInput)({
          ...params,
          error: true,
          helperText: iniValueResult.error?.message,
        });
      } else {
        return (treeSelectParams?.renderInput || defaultInput)({
          ...params,
          placeholder: (() => {
            if (curBranch === "Business") {
              return "Business Name...";
            } else if (curBranch === "Person") {
              return "First... Last...";
            }
          })(),
        });
      }
    },
    [
      treeSelectParams?.renderInput,
      iniValueResult.error,
      iniValueResult.loading,
      branchPath,
    ]
  );

  return (
    <TreeSelect<
      EntityInputOpt,
      EntityBranchInputOpt,
      undefined,
      undefined,
      true | false
    >
      {...treeSelectParams}
      onBranchChange={onBranchChange},
      branchPath={branchPath}
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      disabled={!!treeSelectParams?.disabled || iniValueResult.loading}
      onChange={onChange}
      loading={queryResult.loading}
      renderInput={renderInput}
      value={value}
    />
  );
};
