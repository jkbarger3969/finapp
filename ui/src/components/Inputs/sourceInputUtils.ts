import { useCallback, useMemo, useState } from "react";
import { TreeSelectProps, FreeSoloValue, BranchOption } from "mui-tree-select";
import { useQuery, gql, QueryHookOptions, QueryResult } from "@apollo/client";

import {
  SrcBusinessInputOptsQuery as BusinessOpts,
  SrcBusinessInputOptsQueryVariables as BusinessOptsVars,
  SrcBusinessInputOptFragment,
  SrcPersonInputOptsQuery as PersonOpts,
  SrcPersonInputOptsQueryVariables as PersonOptsVars,
  SrcPersonInputOptFragment,
  DepartmentsWhere,
  BusinessesWhere,
  PeopleWhere,
  RegexFlags,
} from "../../apollo/graphTypes";

import {
  useDepartmentTree,
  DeptInputOpt,
  DeptTreeQueryResult,
  getOptionLabel as getOptionLabelDept,
} from "./departmentInputUtils";

export type SrcDefaultInputOpt =
  | SrcBusinessInputOpt["__typename"]
  | SrcPersonInputOpt["__typename"];
export type SrcPersonInputOpt = SrcPersonInputOptFragment;
export type SrcBusinessInputOpt = SrcBusinessInputOptFragment;

export type SrcTypedInputOpt =
  | (Omit<SrcBusinessInputOptFragment, "departments"> &
      Partial<Pick<SrcBusinessInputOptFragment, "departments">>)
  | SrcPersonInputOpt
  | DeptInputOpt;

export type SrcInputOpt = SrcDefaultInputOpt | SrcTypedInputOpt;

export const SRC_INPUT_OPT_FRAGMENTS = gql`
  fragment SrcBusinessInputOpt on Business {
    __typename
    id
    name
    departments {
      __typename
      id
    }
  }

  fragment SrcPersonInputOpt on Person {
    __typename
    id
    name {
      first
      last
    }
  }
`;

const SRC_BUSINESS_INPUT_OPTS = gql`
  query SrcBusinessInputOpts($where: BusinessesWhere!) {
    businesses(where: $where) {
      ...SrcBusinessInputOpt
    }
  }
  ${SRC_INPUT_OPT_FRAGMENTS}
`;

const SRC_PEOPLE_INPUT_OPTS = gql`
  query SrcPersonInputOpts($where: PeopleWhere!) {
    people(where: $where) {
      ...SrcPersonInputOpt
    }
  }
  ${SRC_INPUT_OPT_FRAGMENTS}
`;

const DEPT_WHERE_DEFAULT = {} as const;

type SrcTreeSelectProps = TreeSelectProps<
  SrcInputOpt,
  undefined,
  undefined,
  true | false
>;

export type SrcTreeRoot =
  | undefined
  | { people: PeopleWhere }
  | { businesses: BusinessesWhere }
  | { departments: BusinessesWhere };

export enum SrcOptionsType {
  Default,
  Business,
  Person,
  Department,
}

export type SrcQueryResult = (
  | Partial<Omit<QueryResult<BusinessOpts, BusinessOptsVars>, "loading">>
  | Partial<Omit<QueryResult<PersonOpts, PersonOptsVars>, "loading">>
  | Partial<Omit<DeptTreeQueryResult, "loading">>
) & {
  loading: boolean;
};

export const defaultOptions: BranchOption<SrcDefaultInputOpt>[] = [
  new BranchOption("Business"),
  new BranchOption("Person"),
];

export const getOptionLabel: NonNullable<
  SrcTreeSelectProps["getOptionLabel"]
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
        return `${opt.name.first} ${opt.name.last}`;
      case "Department":
        return getOptionLabelDept(opt);
    }
  }
};

export const getOptionSelected: NonNullable<
  SrcTreeSelectProps["getOptionSelected"]
> = (option, value) => {
  if (typeof option === "string") {
    return option === value;
  } else if (typeof value === "string") {
    return false;
  } else {
    return option.id === value.id;
  }
};

const getWhere = (
  root: SrcTreeRoot
): [
  optionType: SrcOptionsType,
  where?: BusinessesWhere | DepartmentsWhere | PeopleWhere
] => {
  if (root === undefined) {
    return [SrcOptionsType.Default];
  } else if ("businesses" in root) {
    return [SrcOptionsType.Business, root.businesses];
  } else if ("people" in root) {
    return [SrcOptionsType.Person, root.people];
  } else {
    return [SrcOptionsType.Department, root.departments];
  }
};

export const useSourceTree = (
  root: SrcTreeRoot,
  queryHookOptions: Omit<QueryHookOptions, "variables"> = {}
): {
  inputValue: SrcTreeSelectProps["inputValue"];
  onBranchChange: SrcTreeSelectProps["onBranchChange"];
  onInputChange: SrcTreeSelectProps["onInputChange"];
  options: SrcTreeSelectProps["options"];
  optionsType: SrcOptionsType;
  queryResult: SrcQueryResult;
} => {
  const [{ inputValue, optionsType, variables }, setState] = useState(() => {
    const [optionsType, where] = getWhere(root);
    return {
      inputValue: "",
      optionsType,
      variables: { where },
    };
  });

  // Regex search business names based on inputValue
  const isRegex =
    (optionsType === SrcOptionsType.Business ||
      optionsType === SrcOptionsType.Person) &&
    !variables.where;

  const businessResults = useQuery<BusinessOpts, BusinessOptsVars>(
    SRC_BUSINESS_INPUT_OPTS,
    {
      ...queryHookOptions,
      variables: {
        ...variables,
        where: (isRegex
          ? {
              // Regex search business names based on inputValue
              name: {
                pattern: `^${inputValue[0].toLowerCase()}|[^A-z0-9]+${inputValue[0].toLowerCase()}`,
                flags: [RegexFlags.I],
              },
            }
          : variables.where) as BusinessesWhere,
      },
      skip:
        queryHookOptions.skip ||
        optionsType !== SrcOptionsType.Business ||
        // Do NOT regex search when there is NO inputValue
        (isRegex && inputValue.trim() === ""),
    }
  );

  const peopleResults = useQuery<PersonOpts, PersonOptsVars>(
    SRC_PEOPLE_INPUT_OPTS,
    {
      ...queryHookOptions,
      variables: {
        ...variables,
        where: (isRegex
          ? {
              // Regex search business names based on inputValue
              name: {
                first: {
                  pattern: `^${inputValue[0].toLowerCase()}`,
                  flags: [RegexFlags.I],
                },
                last: {
                  pattern: `^${inputValue[0].toLowerCase()}`,
                  flags: [RegexFlags.I],
                },
              },
            }
          : variables.where) as PeopleWhere,
      },
      skip:
        queryHookOptions.skip ||
        optionsType !== SrcOptionsType.Person ||
        // Do NOT regex search when there is NO inputValue
        (isRegex && inputValue.trim() === ""),
    }
  );

  const departmentResults = useDepartmentTree(
    (optionsType === SrcOptionsType.Department
      ? variables.where
      : // Prevents unnecessary useDepartmentTree instance updates.
        DEPT_WHERE_DEFAULT) as DepartmentsWhere,
    {
      ...queryHookOptions,
      skip: queryHookOptions.skip || optionsType !== SrcOptionsType.Department,
    }
  );

  const onInputChange = useCallback<
    NonNullable<SrcTreeSelectProps["onInputChange"]>
  >(
    (...[, inputValue]) =>
      setState((state) => ({
        ...state,
        inputValue,
      })),
    [setState]
  );

  const onBranchChange = useCallback<SrcTreeSelectProps["onBranchChange"]>(
    (...args) => {
      const option = args[1]?.option;

      if (option === undefined) {
        const [optionsType, where] = getWhere(root);

        setState((state) => ({
          ...state,
          variables: {
            ...state.variables,
            where,
          },
          optionsType,
        }));
      } else if (option === "Business") {
        setState((state) => ({
          ...state,
          variables: {
            ...state.variables,
            // Regex search business names based on inputValue
            where: undefined,
          },
          optionsType: SrcOptionsType.Business,
        }));
      } else if (option === "Person") {
        setState((state) => ({
          ...state,
          variables: {
            ...state.variables,
            // Regex search people names based on inputValue
            where: undefined,
          },
          optionsType: SrcOptionsType.Person,
        }));
      } else if (option.__typename === "Business") {
        setState((state) => ({
          ...state,
          variables: {
            ...state.variables,
            where: {
              parent: {
                eq: {
                  type: "Business",
                  id: option.id,
                },
              },
            } as DepartmentsWhere,
          },
          optionsType: SrcOptionsType.Department,
        }));
      } else if (option.__typename === "Department") {
        departmentResults.onBranchChange(
          ...(args as Parameters<typeof departmentResults.onBranchChange>)
        );
      }
    },
    [root, optionsType, departmentResults.onBranchChange]
  );

  const options = useMemo<SrcTreeSelectProps["options"]>(() => {
    switch (optionsType) {
      case SrcOptionsType.Default:
        return defaultOptions;
      case SrcOptionsType.Business:
        return (businessResults.data?.businesses || []).reduce(
          (options, option) => {
            if (option.departments.length) {
              options.push(new BranchOption(option));
            }
            options.push(option);

            return options;
          },
          [] as SrcTreeSelectProps["options"]
        );
      case SrcOptionsType.Person:
        return peopleResults.data?.people || [];
      case SrcOptionsType.Department:
        return departmentResults.options;
      default:
        return [];
    }
  }, [
    businessResults.data?.businesses,
    departmentResults.options,
    optionsType,
    peopleResults.data?.people,
  ]);

  return {
    inputValue,
    onBranchChange,
    onInputChange,
    options,
    optionsType,
    queryResult: (() => {
      if (optionsType === SrcOptionsType.Business) {
        return businessResults;
      } else if (optionsType === SrcOptionsType.Person) {
        return peopleResults;
      } else if (optionsType === SrcOptionsType.Department) {
        return departmentResults.queryResult;
      } else {
        return { loading: false };
      }
    })(),
  };
};
