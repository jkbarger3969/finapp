import { gql, useQuery, QueryHookOptions } from "@apollo/client";
import TreeSelect, {
  BranchNode,
  defaultInput,
  FreeSoloNode,
  mergeInputEndAdornment,
  ValueNode,
  TreeSelectProps,
} from "mui-tree-select";
import React, { useCallback, useMemo, useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { MarkRequired } from "ts-essentials";

import {
  EntityInputIniValueQuery as EntityInputIniValue,
  EntityInputIniValueQueryVariables as EntityInputIniValueVars,
  EntityInputOptsQuery as EntityInputOpts,
  EntityInputOptsQueryVariables as EntityInputOptsVars,
  EntityBusinessInputOptFragment,
  EntityPersonInputOptFragment,
  DepartmentInputOptFragment,
  RegexFlags,
  EntitiesWhere,
} from "../../apollo/graphTypes";
import {
  getOptionLabel as getOptionLabelDept,
  DEPT_INPUT_OPT_FRAGMENT,
} from "./Department";

export type EntityDefaultInputOpt =
  | EntityBusinessInputOptFragment["__typename"]
  | EntityPersonInputOptFragment["__typename"];

export type EntityInputOpt =
  | EntityBusinessInputOptFragment
  | DepartmentInputOptFragment
  | EntityPersonInputOptFragment;

export type EntityBranchInputOpt =
  | EntityDefaultInputOpt
  | EntityBusinessInputOptFragment
  | DepartmentInputOptFragment;

export type EntityTreeSelectProps = TreeSelectProps<
  EntityInputOpt,
  EntityBranchInputOpt,
  undefined,
  undefined,
  true | false
>;

export type EntityInputProps = {
  iniValue?: EntitiesWhere;
  allowNewBusiness?: boolean;
  allowNewPerson?: boolean;
  error?: string | Error;
  name?: string;
} & MarkRequired<
  Pick<
    EntityTreeSelectProps,
    | "renderInput"
    | "disabled"
    | "onChange"
    | "value"
    | "onBlur"
    | "fullWidth"
    | "autoSelect"
  >,
  "onChange" | "value"
>;

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
      ...DepartmentInputOpt
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
      ...DepartmentInputOpt
      ...EntityPersonInputOpt
      ... on Department {
        ancestors {
          ...EntityBusinessInputOpt
          ...DepartmentInputOpt
        }
      }
    }
  }
  ${DEPT_INPUT_OPT_FRAGMENT}
  ${ENTITY_INPUT_OPT_FRAGMENTS}
`;

export const getOptionLabel: NonNullable<
  EntityTreeSelectProps["getOptionLabel"]
> = (option) => {
  if (option instanceof FreeSoloNode) {
    return option.toString();
  } else {
    const opt = option.valueOf();

    if (typeof opt === "string") {
      return opt;
    }

    switch (opt.__typename) {
      case "Business":
        return opt.name;
      case "Person":
        return `${opt.personName.first} ${opt.personName.last}`;
      case "Department":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return getOptionLabelDept(option as any);
    }
  }
};

export const getOptionSelected: NonNullable<
  EntityTreeSelectProps["getOptionSelected"]
> = (option, value) => {
  if (option instanceof FreeSoloNode || value instanceof FreeSoloNode) {
    return false;
  }

  const opt = option.valueOf();
  const val = value.valueOf();

  if (typeof opt === "string") {
    return opt === val;
  } else if (typeof val === "string") {
    return false;
  } else {
    return opt.id === val.id;
  }
};

const defaultOptions: NonNullable<EntityTreeSelectProps["options"]> = [
  new BranchNode("Business"),
  new BranchNode("Person"),
];

export const EntityInput = (props: EntityInputProps): JSX.Element => {
  const {
    iniValue: iniValueProp,
    renderInput: renderInputProp = defaultInput,
    allowNewBusiness = false,
    allowNewPerson = false,
    disabled: disabledProp = false,
    onChange: onChangeProp,
    value: valueProp,
    name: nameProp = "entity",
    error: errorProp,
    autoSelect,
    ...rest
  } = props;

  const [state, setState] = useState<{
    iniValue?: NonNullable<EntityTreeSelectProps["value"]> | null;
    inputValue: string;
    useIniValue: boolean;
    branch: NonNullable<EntityTreeSelectProps["branch"]> | null;
  }>({
    inputValue: "",
    useIniValue: !!iniValueProp,
    branch: null,
  });

  const iniValueResult = useQuery<EntityInputIniValue, EntityInputIniValueVars>(
    ENTITY_INPUT_INI_VALUE,
    {
      skip: !!state.iniValue || !iniValueProp,
      variables: {
        where: iniValueProp as EntitiesWhere,
      },
      onCompleted: useCallback<
        NonNullable<
          QueryHookOptions<
            EntityInputIniValue,
            EntityInputIniValueVars
          >["onCompleted"]
        >
      >(
        (data) => {
          if (state.useIniValue && !state.iniValue && data.entities[0]) {
            const value = data.entities[0];

            const iniValue = new ValueNode(
              value,
              (() => {
                switch (value.__typename) {
                  case "Business":
                    return ["Business" as EntityDefaultInputOpt];
                  case "Department":
                    return [
                      ...value.ancestors,
                      "Business" as EntityDefaultInputOpt,
                    ].reverse();
                  case "Person":
                    return ["Person" as EntityDefaultInputOpt];
                }
              })()
            );

            setState((state) => ({
              ...state,
              branch: iniValue.parent,
              iniValue,
              inputValue: getOptionLabel(iniValue),
            }));
          }
        },
        [state.iniValue, state.useIniValue]
      ),
    }
  );

  const queryResult = useQuery<EntityInputOpts, EntityInputOptsVars>(
    ENTITY_INPUT_OPTS,
    useMemo(() => {
      const curBranch = state.branch?.valueOf();

      if (!curBranch || iniValueResult.loading) {
        return {
          skip: true,
          variables: {
            where: {},
          },
        };
      } else if (curBranch === "Business") {
        const firstLetter = state.inputValue.trim().slice(0, 1);

        return {
          skip: !firstLetter,
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
        };
      } else if (curBranch === "Person") {
        const firstLetter = state.inputValue.trim().slice(0, 1);

        return {
          skip: !firstLetter,
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
        };
      } else if (curBranch.__typename === "Business") {
        return {
          skip: !curBranch.departments.length,
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
        };
      } else if (curBranch.__typename === "Department") {
        return {
          skip: !curBranch.children.length,
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
        };
      }
    }, [state.branch, iniValueResult.loading, state.inputValue])
  );

  const onBranchChange = useCallback<
    NonNullable<EntityTreeSelectProps["onBranchChange"]>
  >(
    (_, branch) =>
      setState((state) => ({
        ...state,
        branch,
      })),
    []
  );

  const onInputChange = useCallback<
    NonNullable<EntityTreeSelectProps["onInputChange"]>
  >(
    (...[, inputValue]) =>
      setState((state) => ({
        ...state,
        inputValue,
      })),
    []
  );

  const renderInput = useCallback<
    NonNullable<EntityTreeSelectProps["renderInput"]>
  >(
    (params) => {
      const errorMsg =
        typeof errorProp === "string"
          ? errorProp.trim()
          : errorProp?.message || "";

      if (iniValueResult.loading) {
        return renderInputProp({
          ...params,
          InputProps: mergeInputEndAdornment(
            "append",
            <CircularProgress size={20} color="inherit" />,
            params.InputProps || {}
          ),
          name: nameProp,
        });
      } else if (iniValueResult.error || queryResult.error || errorMsg) {
        return renderInputProp({
          ...params,
          error: true,
          helperText:
            iniValueResult.error?.message ||
            queryResult.error?.message ||
            errorMsg,
          name: nameProp,
        });
      } else {
        const curBranch = state.branch?.valueOf();

        return renderInputProp({
          ...params,
          ...(() => {
            if (curBranch === "Business") {
              return { placeholder: "Business Name...", label: "Business" };
            } else if (curBranch === "Person") {
              return { placeholder: "First... Last...", label: "Person" };
            }
            return {};
          })(),
          name: nameProp,
        });
      }
    },
    [
      renderInputProp,
      iniValueResult.error,
      iniValueResult.loading,
      queryResult.error,
      state.branch,
      nameProp,
      errorProp,
    ]
  );

  const options = useMemo<EntityTreeSelectProps["options"]>(() => {
    const options: EntityTreeSelectProps["options"] = [];

    if (iniValueResult.loading) {
      return options;
    } else if (!state.branch) {
      return defaultOptions;
    } else {
      return (queryResult.data?.entities || []).reduce((options, entity) => {
        switch (entity.__typename) {
          case "Business":
            if (entity.departments.length) {
              options.push(new BranchNode(entity));
            }
            options.push(entity);
            break;
          case "Department":
            if (entity.children.length) {
              options.push(new BranchNode(entity));
            }
            options.push(entity);
            break;
          case "Person":
            options.push(entity);
            break;
        }

        return options;
      }, options);
    }
  }, [queryResult.data?.entities, iniValueResult.loading, state.branch]);

  const freeSolo = useMemo<
    NonNullable<EntityTreeSelectProps["freeSolo"]>
  >(() => {
    const curBranch = state.branch?.valueOf();
    return (
      (curBranch === "Person" && allowNewPerson) ||
      (curBranch === "Business" && allowNewBusiness)
    );
  }, [state.branch, allowNewPerson, allowNewBusiness]);

  const onChange = useCallback<NonNullable<EntityTreeSelectProps["onChange"]>>(
    (...args) => {
      onChangeProp(...args);
      if (state.useIniValue) {
        setState((state) => ({
          ...state,
          useIniValue: false,
        }));
      }
    },
    [onChangeProp, state.useIniValue]
  );

  const value = useMemo<EntityTreeSelectProps["value"]>(() => {
    return (state.useIniValue ? state.iniValue : valueProp) ?? null;
  }, [state.iniValue, state.useIniValue, valueProp]);

  return (
    <TreeSelect<
      EntityInputOpt,
      EntityBranchInputOpt,
      undefined,
      undefined,
      true | false
    >
      {...rest}
      onBranchChange={onBranchChange}
      branch={state.branch}
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      disabled={disabledProp || iniValueResult.loading}
      loading={queryResult.loading || iniValueResult.loading}
      renderInput={renderInput}
      inputValue={state.inputValue}
      onInputChange={onInputChange}
      options={options}
      freeSolo={freeSolo}
      autoSelect={!!autoSelect || (freeSolo && !value)}
      value={value}
      onChange={onChange}
    />
  );
};
