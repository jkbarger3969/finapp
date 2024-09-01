import React, {
  forwardRef,
  Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import TreeSelect, {
  ValueNode,
  BranchNode,
  FreeSoloNode,
  TreeSelectProps,
  defaultInput,
  TreeSelectValue,
} from "mui-tree-select";
import { gql, QueryHookOptions, useQuery } from "@apollo/client";
import { MarkOptional, MarkRequired } from "ts-essentials";

import {
  DepartmentInputOptsQuery as DepartmentInputOpts,
  DepartmentInputOptsQueryVariables as DepartmentInputOptsVars,
  DepartmentInputOptFragment,
  DepartmentInputDefaultValueFragment,
  DepartmentsWhere,
  DepartmentInputFiscalYearQuery,
  DepartmentInputFiscalYearQueryVariables,
} from "../../apollo/graphTypes";
import { LoadingDefaultBlank, sortBranchesToTop } from "./shared";
import {
  FieldValue,
  IsEqualFn,
  useField,
  UseFieldOptions,
  useFormContext,
} from "../../useKISSForm/form";
import { useControlled } from "@material-ui/core";

export type DepartmentInputOpt = MarkOptional<
  DepartmentInputOptFragment,
  "children"
>;

export const DEPARTMENT_INPUT_OPT_FRAGMENT = gql`
  fragment DepartmentInputOpt on Department {
    __typename
    id
    name
    children {
      __typename
      id
    }
    disable {
      __typename
      id
    }
  }
`;

export const DEPARTMENT_DEFAULT_VALUE_FRAGMENT = gql`
  fragment DepartmentInputDefaultValue on Department {
    ...DepartmentInputOpt
    ancestors(root: $deptRoot) {
      __typename
      ... on Department {
        ...DepartmentInputOpt
      }
    }
  }
  ${DEPARTMENT_INPUT_OPT_FRAGMENT}
`;

export const DEPARTMENT_DEFAULT_VALUE = gql`
  query DepartmentInputDefaultValues(
    $where: DepartmentsWhere!
    $deptRoot: DepartmentsWhere
  ) {
    departments(where: $where) {
      ...DepartmentInputDefaultValue
    }
  }
`;

export const DEPARTMENT_INPUT_OPTS = gql`
  query DepartmentInputOpts($where: DepartmentsWhere!) {
    departments(where: $where) {
      ...DepartmentInputOpt
    }
  }
  ${DEPARTMENT_INPUT_OPT_FRAGMENT}
`;

export const DEPARTMENT_INPUT_FISCAL_YEAR = gql`
  query DepartmentInputFiscalYear($where: FiscalYearsWhere) {
    fiscalYears(where: $where) {
      __typename
      id
    }
  }
`;

export const useDepartmentDefaultValue = (
  defaultValue?: DepartmentInputDefaultValueFragment
): ValueNode<DepartmentInputOpt, DepartmentInputOpt> | undefined =>
  useMemo(
    () =>
      defaultValue
        ? new ValueNode(
            defaultValue,
            defaultValue.ancestors
              .reduceRight((path, parent) => {
                if (parent.__typename !== "Business") {
                  path.push(parent);
                }

                return path;
              }, [] as DepartmentInputOpt[])
              .reverse()
          )
        : undefined,
    [defaultValue]
  );

export type DepartmentTreeSelectProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = TreeSelectProps<
  DepartmentInputOpt,
  DepartmentInputOpt,
  Multiple,
  DisableClearable,
  FreeSolo
>;

const deptIsEqual: IsEqualFn<
  TreeSelectValue<
    DepartmentInputOpt,
    DepartmentInputOpt,
    true | false,
    true | false,
    true | false
  >
> = (a, b) => {
  type TIsEqual = TreeSelectValue<
    DepartmentInputOpt,
    DepartmentInputOpt,
    false,
    false,
    true
  >;

  const isEqual = (a: TIsEqual, b: TIsEqual) => {
    if (!a || !b) {
      return a === b;
    } else if (a instanceof FreeSoloNode || b instanceof FreeSoloNode) {
      return a.valueOf() === b.valueOf();
    } else {
      return a.valueOf().id === b.valueOf().id;
    }
  };

  if (Array.isArray(a) || Array.isArray(b)) {
    type TMulti = TreeSelectValue<
      DepartmentInputOpt,
      DepartmentInputOpt,
      true,
      true | false,
      true | false
    >;

    if ((a as TMulti).length !== (b as TMulti).length) {
      return false;
    } else {
      return (a as TMulti).every((a, i) => isEqual(a, (b as TMulti)[i]));
    }
  } else {
    return isEqual(a, b);
  }
};

export const getOptionLabel: NonNullable<
  DepartmentTreeSelectProps<
    undefined,
    undefined,
    true | false
  >["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloNode) {
    return option.toString();
  } else {
    return option.valueOf().name;
  }
};

export const getOptionSelected: NonNullable<
  DepartmentTreeSelectProps<
    undefined,
    undefined,
    true | false
  >["getOptionSelected"]
> = (option, value) =>
  !(option instanceof FreeSoloNode) &&
  !(value instanceof FreeSoloNode) &&
  option.valueOf().id === value.valueOf().id;

export type DepartmentInputBaseProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = MarkOptional<
  MarkRequired<
    Omit<
      DepartmentTreeSelectProps<Multiple, DisableClearable, FreeSolo>,
      "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "branch" | "onBranchChange"
> & {
  root: DepartmentsWhere;
  fyID?: string;
};

export const DepartmentInputBase = forwardRef(function DepartmentInputBase<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    root,
    renderInput: renderInputProp = defaultInput,
    branch: branchProp,
    onBranchChange: onBranchChangeProp,
    loading,
    fyID,
    ...rest
  } = props;

  const [branch, setBranch] = useControlled({
    controlled: branchProp,
    default: null,
    name: "CategoryInputBaseProps",
    state: "branch",
  });

  const branchRef = useRef(branch);
  branchRef.current = branch;

  const rootResult = useQuery<DepartmentInputOpts, DepartmentInputOptsVars>(
    DEPARTMENT_INPUT_OPTS,
    useMemo<QueryHookOptions<DepartmentInputOpts, DepartmentInputOptsVars>>(
      () => ({
        variables: {
          where: root,
        },
      }),
      [root]
    )
  );

  const queryResult = useQuery<DepartmentInputOpts, DepartmentInputOptsVars>(
    DEPARTMENT_INPUT_OPTS,
    useMemo<QueryHookOptions<DepartmentInputOpts, DepartmentInputOptsVars>>(
      () => ({
        skip: !branch,
        variables: {
          where: {
            parent: {
              eq: {
                type: "Department",
                id: branch?.valueOf()?.id as string,
              },
            },
          },
        },
      }),
      [branch]
    )
  );

  const onBranchChange = useCallback<
    NonNullable<DepartmentTreeSelectProps["onBranchChange"]>
  >(
    (...args) => {
      setBranch(args[1]);

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp, setBranch]
  );

  const renderInput = useCallback<
    NonNullable<
      DepartmentTreeSelectProps<
        Multiple,
        DisableClearable,
        FreeSolo
      >["renderInput"]
    >
  >(
    (params) =>
      renderInputProp({
        name: "department",
        ...params,
        ...(rootResult.error || queryResult.error
          ? {
              error: true,
              helperText:
                rootResult.error?.message || queryResult.error?.message,
            }
          : {}),
      }),
    [queryResult.error, renderInputProp, rootResult.error]
  );

  const options = useMemo<DepartmentTreeSelectProps["options"]>(() => {
    const options: DepartmentTreeSelectProps["options"] = [];

    if (rootResult.loading) {
      return options;
    }

    return (
      (branch ? queryResult.data?.departments : rootResult.data?.departments) ||
      []
    )
      .filter(({ disable }) => disable.every(({ id }) => id !== fyID))
      .reduce((options, department) => {
        if (department.children.length) {
          options.push(new BranchNode(department, branch));
        }
        options.push(department);

        return options;
      }, options)
      .sort(sortBranchesToTop);
  }, [
    rootResult.loading,
    rootResult.data?.departments,
    branch,
    queryResult.data?.departments,
    fyID,
  ]);

  if (rootResult.loading) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <LoadingDefaultBlank {...(props as any)} />;
  }

  return (
    <TreeSelect<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      {...rest}
      ref={ref}
      loading={queryResult.loading || !!loading}
      onBranchChange={onBranchChange}
      branch={branch}
      renderInput={renderInput}
      options={options}
    />
  );
});

export type DepartmentInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  defaultValue?: TreeSelectValue<
    DepartmentInputOpt,
    DepartmentInputOpt,
    Multiple,
    true,
    false
  >;
} & MarkOptional<
  Omit<
    DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>,
    "branch" | "value" | "name"
  >,
  "onChange"
> &
  Pick<UseFieldOptions, "form">;

const BRANCH_NOT_SET = Symbol();

export type DepartmentFieldDef<
  Multiple extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  department: FieldValue<
    TreeSelectValue<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      false,
      FreeSolo
    >
  >;
};
export const DEPARTMENT_NAME: keyof DepartmentFieldDef = "department";
export const DepartmentInput = forwardRef(function DepartmentInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: DepartmentInputProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue,
    form,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onBranchChange: onBranchChangeProp,
    ...rest
  } = props;

  const isSubmitting = useFormContext(form)?.isSubmitting ?? false;

  const {
    props: { value: fieldValue, name },
    state: { isTouched, errors },
    setValue,
    setTouched,
  } = useField<
    TreeSelectValue<
      DepartmentInputOpt,
      DepartmentInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
  >({
    name: DEPARTMENT_NAME,
    form,
    isEqual: deptIsEqual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: defaultValue as any,
  });

  const value = useMemo(
    () => fieldValue || (rest.multiple ? [] : null),
    [fieldValue, rest.multiple]
  ) as TreeSelectValue<
    DepartmentInputOpt,
    DepartmentInputOpt,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  const handleBlur = useCallback<
    NonNullable<DepartmentInputBaseProps["onBlur"]>
  >(
    (...args) => {
      setTouched(true);
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<DepartmentInputBaseProps["renderInput"]>
  >(
    (params) =>
      renderInputProp({
        ...params,
        name,
        ...(isTouched && errors.length
          ? {
              error: true,
              helperText: errors[0].message,
            }
          : {}),
      }),
    [renderInputProp, name, isTouched, errors]
  );

  const handleChange = useCallback<
    NonNullable<
      DepartmentInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (...args) => {
      setValue(args[1] ?? undefined);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [setValue, onChangeProp]
  );

  // The following accommodates async default value lookups.
  const [branch, setBranch] = useState(() =>
    value instanceof ValueNode ? value.parent : BRANCH_NOT_SET
  );

  const handleBranchChange = useCallback<
    NonNullable<
      DepartmentInputBaseProps<
        Multiple,
        DisableClearable,
        FreeSolo
      >["onBranchChange"]
    >
  >(
    (...args) => {
      setBranch(args[1]);

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp]
  );

  return (
    <DepartmentInputBase
      {...rest}
      value={value}
      disabled={isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      branch={
        branch === BRANCH_NOT_SET
          ? value instanceof ValueNode
            ? value.parent
            : null
          : branch
      }
      onBranchChange={handleBranchChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});
