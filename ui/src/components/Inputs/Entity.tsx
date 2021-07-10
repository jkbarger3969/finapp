import { gql, useQuery, QueryHookOptions } from "@apollo/client";
import TreeSelect, {
  BranchNode,
  defaultInput,
  FreeSoloNode,
  ValueNode,
  TreeSelectProps,
  TreeSelectValue,
} from "mui-tree-select";
import React, { forwardRef, Ref, useCallback, useMemo, useState } from "react";
import { MarkOptional, MarkRequired } from "ts-essentials";
import { Control, UseControllerProps } from "react-hook-form";

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
import { useControlled } from "@material-ui/core";
import { LoadingDefaultBlank } from "./shared";
import { useController } from "../../utils/reactHookForm";

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

export type EntityTreeSelectProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = TreeSelectProps<
  EntityInputOpt,
  EntityBranchInputOpt,
  Multiple,
  DisableClearable,
  FreeSolo
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
  EntityTreeSelectProps<undefined, undefined, true | false>["getOptionLabel"]
> = (option): string => {
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
  EntityTreeSelectProps<undefined, undefined, true | false>["getOptionSelected"]
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

const businessBranch = new BranchNode<EntityBranchInputOpt>("Business");
const personBranch = new BranchNode<EntityBranchInputOpt>("Person");

const defaultOptions: NonNullable<EntityTreeSelectProps["options"]> = [
  businessBranch,
  personBranch,
];

export type EntityInputBaseProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = MarkOptional<
  MarkRequired<
    Omit<
      EntityTreeSelectProps<Multiple, DisableClearable, FreeSolo>,
      "branch" | "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "onBranchChange"
> & {
  allowNewBusiness?: FreeSolo;
  allowNewPerson?: FreeSolo;
};

export const EntityInputBase = forwardRef(function EntityInputBase<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: EntityInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    inputValue: inputValueProp,
    onInputChange: onInputChangeProp,
    onBranchChange: onBranchChangeProp,
    loading,
    autoSelect,
    renderInput: renderInputProp = defaultInput,
    allowNewBusiness,
    allowNewPerson,
    ...rest
  } = props;

  const [inputValue, setInputValue] = useControlled({
    controlled: inputValueProp,
    default: "",
    name: "EntityInputBase",
    state: "inputValue",
  });

  const [state, setState] = useState<{
    branch: Exclude<EntityTreeSelectProps["branch"], undefined>;
  }>({
    branch: props.value instanceof ValueNode ? props.value.parent : null,
  });

  const queryResult = useQuery<EntityInputOpts, EntityInputOptsVars>(
    ENTITY_INPUT_OPTS,
    useMemo(() => {
      const curBranch = state.branch?.valueOf();

      if (!curBranch) {
        return {
          skip: true,
          variables: {
            where: {},
          },
        };
      } else if (curBranch === "Business") {
        const firstLetter = inputValue.trim().slice(0, 1);

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
        const firstLetter = inputValue.trim().slice(0, 1);

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
    }, [state.branch, inputValue])
  );

  const onBranchChange = useCallback<
    NonNullable<EntityTreeSelectProps["onBranchChange"]>
  >(
    (...args) => {
      setState((state) => ({
        ...state,
        branch: args[1],
      }));
      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp]
  );

  const onInputChange = useCallback<
    NonNullable<EntityTreeSelectProps["onInputChange"]>
  >(
    (...args) => {
      setInputValue(args[1]);

      if (onInputChangeProp) {
        onInputChangeProp(...args);
      }
    },
    [onInputChangeProp, setInputValue]
  );

  const renderInput = useCallback<
    NonNullable<EntityTreeSelectProps["renderInput"]>
  >(
    (params) => {
      const curBranch = state.branch?.valueOf();

      return renderInputProp({
        name: "entity",
        ...params,
        ...(() => {
          if (curBranch === "Business") {
            return { placeholder: "Business Name...", label: "Business" };
          } else if (curBranch === "Person") {
            return { placeholder: "First... Last...", label: "Person" };
          } else if (curBranch) {
            return {
              label: "Department",
            };
          }
          return {};
        })(),
        ...(queryResult?.error
          ? {
              error: true,
              helperText: queryResult.error.message,
            }
          : {}),
      });
    },
    [queryResult.error, renderInputProp, state.branch]
  );

  const options = useMemo<EntityTreeSelectProps["options"]>(() => {
    const options: EntityTreeSelectProps["options"] = [];

    if (!state.branch) {
      return defaultOptions;
    } else {
      return (queryResult.data?.entities || []).reduce((options, entity) => {
        switch (entity.__typename) {
          case "Business":
            if (entity.departments.length) {
              options.push(new BranchNode(entity, state.branch));
            }
            options.push(entity);
            break;
          case "Department":
            if (entity.children.length) {
              options.push(new BranchNode(entity, state.branch));
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
  }, [queryResult.data?.entities, state.branch]);

  const freeSolo = useMemo<FreeSolo>(() => {
    const curBranch = state.branch?.valueOf();
    return ((curBranch === "Person" && !!allowNewPerson) ||
      (curBranch === "Business" && !!allowNewBusiness)) as FreeSolo;
  }, [state.branch, allowNewPerson, allowNewBusiness]);

  return (
    <TreeSelect<
      EntityInputOpt,
      EntityBranchInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      {...rest}
      ref={ref}
      onBranchChange={onBranchChange}
      branch={state.branch}
      loading={queryResult.loading || loading}
      renderInput={renderInput}
      inputValue={inputValue}
      onInputChange={onInputChange}
      options={options}
      freeSolo={freeSolo}
      autoSelect={!!autoSelect || (freeSolo && !props.value)}
    />
  );
});

export type EntityInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  defaultValue?: EntitiesWhere;
  control?: Control;
  name?: string;
  rules?: UseControllerProps["rules"];
} & Omit<
  EntityInputBaseProps<Multiple, DisableClearable, FreeSolo>,
  "onChange" | "value"
>;

const EntityInputControlled = forwardRef(function EntityInputControlled<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: Omit<
    EntityInputProps<Multiple, DisableClearable, FreeSolo>,
    "defaultValue"
  > & {
    defaultValue: TreeSelectValue<
      EntityInputOpt,
      EntityBranchInputOpt,
      Multiple,
      false,
      false
    >;
  },
  ref: Ref<unknown>
): JSX.Element {
  const {
    control,
    name: nameProp = "entity",
    defaultValue,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    rules,
    ...rest
  } = props;

  const {
    field: {
      onBlur: onBlurControlled,
      name,
      onChange: onChangeControlled,
      ref: inputRef,
      ...field
    },
    fieldState: { isTouched, error },
    formState: { isSubmitting, isValidating },
  } = useController({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: nameProp as any,
    control,
    defaultValue,
    rules,
    shouldUnregister: true,
  });

  const handleBlur = useCallback<NonNullable<EntityInputBaseProps["onBlur"]>>(
    (...args) => {
      onBlurControlled();
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [onBlurControlled, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<EntityInputBaseProps["renderInput"]>
  >(
    (params) =>
      renderInputProp({
        ...params,
        inputRef,
        name,
        ...(isTouched && error
          ? {
              error: true,
              helperText: error?.message || "Invalid",
            }
          : {}),
      }),
    [renderInputProp, inputRef, name, isTouched, error]
  );

  const handleChange = useCallback<
    NonNullable<
      EntityInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (_, value) => {
      onChangeControlled(value);
    },
    [onChangeControlled]
  );

  return (
    <EntityInputBase
      {...rest}
      {...field}
      disabled={isValidating || isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});

export const EntityInput = forwardRef(function EntityInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: EntityInputProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    defaultValue: defaultValueProp,
    renderInput: renderInputProp = defaultInput,
    ...rest
  } = props;

  const { loading, error, data } = useQuery<
    EntityInputIniValue,
    EntityInputIniValueVars
  >(
    ENTITY_INPUT_INI_VALUE,
    useMemo<QueryHookOptions<EntityInputIniValue, EntityInputIniValueVars>>(
      () => ({
        skip: !defaultValueProp,
        variables: {
          where: defaultValueProp as EntitiesWhere,
        },
      }),
      [defaultValueProp]
    )
  );

  const renderInput = useCallback<
    NonNullable<
      EntityInputProps<Multiple, DisableClearable, FreeSolo>["renderInput"]
    >
  >(
    (params) =>
      renderInputProp({
        ...params,
        ...(error
          ? {
              error: true,
              helperText: error.message,
            }
          : {}),
      }),
    [error, renderInputProp]
  );

  const defaultValues = useMemo(
    () =>
      (data?.entities || []).map(
        (value) =>
          new ValueNode(
            value,
            (() => {
              switch (value.__typename) {
                case "Business":
                  return new ValueNode<EntityInputOpt, EntityBranchInputOpt>(
                    value,
                    businessBranch
                  );
                case "Department":
                  return new ValueNode<EntityInputOpt, EntityBranchInputOpt>(
                    value,
                    value.ancestors.reduceRight(
                      (branch, ancestor) =>
                        new BranchNode<EntityBranchInputOpt>(ancestor, branch),
                      businessBranch
                    )
                  );

                case "Person":
                  return new ValueNode<EntityInputOpt, EntityBranchInputOpt>(
                    value,
                    personBranch
                  );
              }
            })()
          )
      ),
    [data?.entities]
  );

  if (loading) {
    return <LoadingDefaultBlank {...rest} />;
  }

  return (
    <EntityInputControlled<Multiple, DisableClearable, FreeSolo>
      {...rest}
      ref={ref}
      renderInput={renderInput}
      defaultValue={
        ((props.multiple
          ? defaultValues
          : defaultValues[0] ?? null) as unknown) as TreeSelectValue<
          EntityInputOpt,
          EntityBranchInputOpt,
          Multiple,
          false,
          false
        >
      }
    />
  );
});
