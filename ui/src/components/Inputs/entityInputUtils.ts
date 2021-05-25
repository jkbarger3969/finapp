import { useCallback, useMemo, useState } from "react";
import { TreeSelectProps, FreeSoloValue, BranchOption } from "mui-tree-select";
import { useQuery, gql, QueryHookOptions, QueryResult } from "@apollo/client";
import { MarkOptional } from "ts-essentials";

import {
  EntityInputIniValueQuery as EntityInputIniValue,
  EntityInputIniValueQueryVariables as EntityInputIniValueVars,
  EntityInputOptsQuery as EntityInputOpts,
  EntityInputOptsQueryVariables as EntityInputOptsVars,
  EntityBusinessInputOptFragment,
  EntityPersonInputOptFragment,
  DeptInputOptFragment,
  RegexFlags,
} from "../../apollo/graphTypes";
import {
  getOptionLabel as getOptionLabelDept,
  DEPT_INPUT_OPT_FRAGMENT,
} from "./departmentInputUtils";

export type EntityPersonInputOpt = EntityPersonInputOptFragment;
export type EntityBusinessInputOpt = MarkOptional<
  EntityBusinessInputOptFragment,
  "departments"
>;

export type EntityDefaultInputOpt =
  | EntityBusinessInputOpt["__typename"]
  | EntityPersonInputOpt["__typename"];

export type EntityInputOpt =
  | EntityBusinessInputOpt
  | DeptInputOptFragment
  | EntityPersonInputOpt;

export type EntityBranchInputOpt =
  | EntityDefaultInputOpt
  | EntityBusinessInputOpt
  | DeptInputOptFragment;

export const ENTITY_INPUT_OPT_FRAGMENTS = gql`
  fragment EntityBusinessInputOpt on Business {
    __typename
    id
    name
    departments(root: true) {
      __typename
      id
    }
  }

  fragment EntityPersonInputOpt on Person {
    __typename
    id
    personName: name {
      first
      last
    }
  }
`;

export const ENTITY_INPUT_OPTS = gql`
  query EntityInputOpts($where: EntitiesWhere!) {
    entities(where: $where) {
      ...EntityBusinessInputOpt
      ...DeptInputOpt
      ...EntityPersonInputOpt
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
  ${ENTITY_INPUT_OPT_FRAGMENTS}
`;

export const ENTITY_INPUT_INI_VALUE = gql`
  query EntityInputIniValue($where: EntitiesWhere!) {
    entities(where: $where) {
      ...EntityBusinessInputOpt
      ...DeptInputOpt
      ...EntityPersonInputOpt
      ... on Department {
        ancestors {
          ...EntityBusinessInputOpt
          ...DeptInputOpt
        }
      }
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
  ${ENTITY_INPUT_OPT_FRAGMENTS}
`;

export type EntityTreeSelectProps = TreeSelectProps<
  EntityInputOpt,
  EntityBranchInputOpt,
  undefined,
  undefined,
  true | false
>;

export enum EntityOptionsType {
  Default,
  Business,
  Person,
  Department,
}

export type EntityQueryResult = QueryResult<
  EntityInputOpts,
  EntityInputOptsVars
>;

export const defaultOptions: BranchOption<EntityDefaultInputOpt>[] = [
  new BranchOption("Business"),
  new BranchOption("Person"),
];

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

export interface UseSourceTreeOptions {
  queryHookOptions?: Omit<QueryHookOptions, "variables">;
  allowNewBusiness?: boolean;
  allowNewPerson?: boolean;
  iniValue?: Required<
    Pick<
      | EntityBusinessInputOptFragment
      | DeptInputOptFragment
      | EntityPersonInputOpt,
      "__typename" | "id"
    >
  >;
}

export type TreeSelectParams = Required<
  Pick<
    EntityTreeSelectProps,
    | "branchPath"
    | "freeSolo"
    | "onBranchChange"
    | "options"
    | "inputValue"
    | "onInputChange"
  >
>;

/* {
  branchPath: NonNullable<EntityTreeSelectProps["branchPath"]>;
  inputValue: string;
  onBranchChange: NonNullable<EntityTreeSelectProps["onBranchChange"]>;
  onInputChange: NonNullable<EntityTreeSelectProps["onInputChange"]>;
  options: EntityTreeSelectProps["options"];
  freeSolo: NonNullable<EntityTreeSelectProps["freeSolo"]>;
} */

export const useEntryTree = (
  options: UseSourceTreeOptions = {}
): {
  iniValue?: EntityInputOpt;
  treeSelectParams: TreeSelectParams;
  queryResult: EntityQueryResult;
} => {
  const {
    queryHookOptions = {},
    allowNewBusiness = false,
    allowNewPerson = false,
  } = options;

  const [state, setState] = useState<{
    branchPath: NonNullable<EntityTreeSelectProps["branchPath"]>;
    inputValue: string;
    iniValue?: {
      value?: EntityInputOpt;
      query?: EntityInputOptsVars;
    };
    variables?: EntityInputOptsVars;
  }>(() => {
    return {
      inputValue: "",
      iniValue: (() => {
        if (!options.iniValue) {
          return;
        }

        switch (options.iniValue.__typename) {
          case "Business":
            return {
              query: {
                where: {
                  businesses: {
                    id: {
                      eq: options.iniValue.id,
                    },
                  },
                },
              } as EntityInputIniValueVars,
            };
          case "Department":
            return {
              query: {
                where: {
                  departments: {
                    id: {
                      eq: options.iniValue.id,
                    },
                  },
                },
              } as EntityInputIniValueVars,
            };
          case "Person":
            return {
              query: {
                where: {
                  people: {
                    id: {
                      eq: options.iniValue.id,
                    },
                  },
                },
              } as EntityInputIniValueVars,
            };
        }
      })(),
      branchPath: [],
    };
  });

  const iniValueResult = useQuery<EntityInputIniValue, EntityInputIniValueVars>(
    ENTITY_INPUT_INI_VALUE,
    {
      skip: !state.iniValue?.query,
      variables: state.iniValue?.query,
      onCompleted: useCallback<
        NonNullable<QueryHookOptions<EntityInputIniValue>["onCompleted"]>
      >(
        (data) => {
          if (!state.iniValue?.query) {
            return;
          }

          for (const entity of data.entities) {
            switch (entity.__typename) {
              case "Business":
                setState((state) => ({
                  ...state,
                  branchPath: [new BranchOption("Business")],
                  inputValue: getOptionLabel(entity),
                  iniValue: {
                    value: entity,
                  },
                }));
                break;
              case "Department":
                setState((state) => ({
                  ...state,
                  branchPath: [
                    new BranchOption("Business"),
                    ...entity.ancestors
                      .map((ancestor) => new BranchOption(ancestor))
                      .reverse(),
                  ],
                  inputValue: getOptionLabel(entity),
                  iniValue: {
                    value: entity,
                  },
                }));
                break;
              case "Person":
                setState((state) => ({
                  ...state,
                  branchPath: [new BranchOption("Person")],
                  inputValue: getOptionLabel(entity),
                  iniValue: {
                    value: entity,
                  },
                }));
                break;
            }

            // This query will (should) only return ONE result
            return;
          }
        },
        [state.iniValue?.query, setState]
      ),
    }
  );

  const entityResults = useQuery<EntityInputOpts, EntityInputOptsVars>(
    ENTITY_INPUT_OPTS,
    {
      ...queryHookOptions,
      skip: queryHookOptions.skip || !state.variables,
      variables: state.variables,
    }
  );

  const onInputChange = useCallback<
    NonNullable<EntityTreeSelectProps["onInputChange"]>
  >(
    (...[, inputValue]) => {
      const curBranch = state.branchPath[state.branchPath.length - 1]?.option;

      if (!curBranch || typeof curBranch !== "string") {
        setState((state) => ({
          ...state,
          inputValue,
        }));
        return;
      } else {
        const firstLetter = inputValue.trim().slice(0, 1).toLowerCase();

        if (!firstLetter) {
          return setState((state) => ({
            ...state,
            inputValue,
            variables: undefined,
          }));
        } else if (curBranch === "Business") {
          setState((state) => ({
            ...state,
            inputValue,
            variables: {
              where: {
                businesses: {
                  name: {
                    pattern: `^${firstLetter}|[^A-z0-9]+${firstLetter}`,
                    flags: [RegexFlags.I],
                  },
                },
              },
            },
          }));
        } else {
          setState((state) => ({
            ...state,
            inputValue,
            variables: {
              where: {
                people: {
                  or: [
                    {
                      name: {
                        first: {
                          pattern: `^${firstLetter}|[^A-z0-9]+${firstLetter}`,
                          flags: [RegexFlags.I],
                        },
                      },
                    },
                    {
                      name: {
                        last: {
                          pattern: `^${firstLetter}|[^A-z0-9]+${firstLetter}`,
                          flags: [RegexFlags.I],
                        },
                      },
                    },
                  ],
                },
              },
            },
          }));
        }
      }
    },
    [state.branchPath, setState]
  );

  const onBranchChange = useCallback<EntityTreeSelectProps["onBranchChange"]>(
    (...args) => {
      const [, branchOption, branchPath] = args;

      const curBranch = branchOption?.option;

      if (curBranch && typeof curBranch !== "string") {
        setState((state) => ({
          ...state,
          branchPath,
          inputValue: "",
          variables: {
            where: {
              departments: {
                parent: {
                  eq: {
                    type: curBranch.__typename,
                    id: curBranch.id,
                  },
                },
              },
            },
          },
        }));
      } else {
        setState((state) => ({
          ...state,
          branchPath,
          inputValue: "",
          variables: undefined,
        }));
      }
    },
    [setState]
  );

  const treeSelectParams = useMemo<
    Pick<TreeSelectParams, "freeSolo" | "options">
  >(() => {
    const treeSelectParams: Pick<TreeSelectParams, "freeSolo" | "options"> = {
      freeSolo: false,
      options: [],
    };

    if (entityResults.data?.entities) {
      for (const entity of entityResults.data?.entities) {
        switch (entity.__typename) {
          case "Business":
            if (entity.departments.length) {
              treeSelectParams.options.push(new BranchOption(entity));
            }
            treeSelectParams.freeSolo = allowNewBusiness;
            treeSelectParams.options.push(entity);
            break;
          case "Department":
            if (entity.children.length) {
              treeSelectParams.options.push(new BranchOption(entity));
            }
            treeSelectParams.options.push(entity);
            break;
          case "Person":
            treeSelectParams.freeSolo = allowNewPerson;
            treeSelectParams.options.push(entity);
            break;
        }
      }
    } else if (!iniValueResult.loading && !state.branchPath.length) {
      treeSelectParams.options = defaultOptions;
    }

    return treeSelectParams;
  }, [
    state.branchPath,
    entityResults.data?.entities,
    allowNewBusiness,
    allowNewPerson,
    iniValueResult.loading,
  ]);

  return {
    iniValue: state.iniValue?.value,
    treeSelectParams: {
      ...treeSelectParams,
      inputValue: state.inputValue,
      onInputChange,
      branchPath: state.branchPath,
      onBranchChange,
    },
    queryResult: {
      ...entityResults,
      error: entityResults.error || iniValueResult.error,
      loading: entityResults.loading || iniValueResult.loading,
    },
  };
};
