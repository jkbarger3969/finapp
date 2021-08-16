import { gql, useQuery } from "@apollo/client";
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

import {
  EntityInputOptsQuery as EntityInputOpts,
  EntityInputOptsQueryVariables as EntityInputOptsVars,
  EntityBusinessInputOptFragment,
  EntityPersonInputOptFragment,
  EntityInputDefaultValueFragment,
  DepartmentInputOptFragment,
  RegexFlags,
} from "../../apollo/graphTypes";
import {
  getOptionLabel as getOptionLabelDept,
  DEPARTMENT_INPUT_OPT_FRAGMENT,
  DEPARTMENT_DEFAULT_VALUE_FRAGMENT,
} from "./Department";
import { useControlled } from "@material-ui/core";
import {
  FieldValue,
  useField,
  UseFieldOptions,
  useFormContext,
} from "../../useKISSForm/form";

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

export type EntityTreeSelectValue<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = TreeSelectValue<
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

export const ENTITY_INPUT_DEFAULT_VALUE_FRAGMENT = gql`
  fragment EntityInputDefaultValue on Entity {
    ...EntityBusinessInputOpt
    ...EntityPersonInputOpt
    ...DepartmentInputDefaultValue
    ... on Department {
      ancestors {
        ...EntityBusinessInputOpt
        ...DepartmentInputOpt
      }
    }
  }
  ${ENTITY_INPUT_OPT_FRAGMENTS}
  ${DEPARTMENT_DEFAULT_VALUE_FRAGMENT}
  ${DEPARTMENT_INPUT_OPT_FRAGMENT}
`;

export const ENTITY_INPUT_OPTS = gql`
  query EntityInputOpts($where: EntitiesWhere!) {
    entities(where: $where) {
      ...EntityBusinessInputOpt
      ...DepartmentInputOpt
      ...EntityPersonInputOpt
    }
  }
  ${DEPARTMENT_INPUT_OPT_FRAGMENT}
  ${ENTITY_INPUT_OPT_FRAGMENTS}
`;

export const ENTITY_INPUT_DEFAULT_VALUE = gql`
  query EntityInputDefaultValue($where: EntitiesWhere!) {
    entities(where: $where) {
      ...EntityInputDefaultValue
    }
  }
  ${ENTITY_INPUT_DEFAULT_VALUE_FRAGMENT}
`;

export const useEntityDefaultValue = (
  defaultValue?: EntityInputDefaultValueFragment
): ValueNode<EntityInputOpt, EntityBranchInputOpt> | undefined =>
  useMemo(() => {
    switch (defaultValue?.__typename) {
      case undefined:
        return undefined;
      case "Business":
        return new ValueNode(defaultValue, businessBranch);
      case "Department":
        return new ValueNode(
          defaultValue,
          defaultValue.ancestors.reduceRight(
            (branch, ancestor) =>
              new BranchNode<EntityBranchInputOpt>(ancestor, branch),
            businessBranch
          )
        );
      case "Person":
        return new ValueNode(defaultValue, personBranch);
    }
  }, [defaultValue]);

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

export const ENTITY_NAME = "entity";
export type EntityInputProps<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  name?: string;
  defaultValue?: TreeSelectValue<
    EntityInputOpt,
    EntityBranchInputOpt,
    Multiple,
    true,
    false
  >;
} & MarkOptional<
  Omit<EntityInputBaseProps<Multiple, DisableClearable, FreeSolo>, "value">,
  "onChange"
> &
  Pick<UseFieldOptions, "form">;

export type EntityFieldDef<
  Name extends string = typeof ENTITY_NAME,
  Multiple extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
> = {
  [key in Name]: FieldValue<
    TreeSelectValue<
      EntityInputOpt,
      EntityBranchInputOpt,
      Multiple,
      false,
      FreeSolo
    >
  >;
};
export const EntityInput = forwardRef(function EntityInput<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: EntityInputProps<Multiple, DisableClearable, FreeSolo>,
  ref: Ref<unknown>
): JSX.Element {
  const {
    name: nameProp = ENTITY_NAME,
    defaultValue,
    form,
    renderInput: renderInputProp = defaultInput,
    disabled,
    onBlur: onBlurProp,
    onChange: onChangeProp,
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
      EntityInputOpt,
      EntityBranchInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
  >({
    name: nameProp,
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: defaultValue as any,
  });

  const value = useMemo(
    () => fieldValue || (rest.multiple ? [] : null),
    [fieldValue, rest.multiple]
  ) as TreeSelectValue<
    EntityInputOpt,
    EntityBranchInputOpt,
    Multiple,
    DisableClearable,
    FreeSolo
  >;

  const handleBlur = useCallback<NonNullable<EntityInputBaseProps["onBlur"]>>(
    (...args) => {
      setTouched(true);
      if (onBlurProp) {
        onBlurProp(...args);
      }
    },
    [setTouched, onBlurProp]
  );

  const renderInput = useCallback<
    NonNullable<EntityInputBaseProps["renderInput"]>
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
      EntityInputBaseProps<Multiple, DisableClearable, FreeSolo>["onChange"]
    >
  >(
    (...args) => {
      setValue(args[1] ?? undefined);
      if (onChangeProp) {
        onChangeProp(...args);
      }
    },
    [onChangeProp, setValue]
  );

  return (
    <EntityInputBase<Multiple, DisableClearable, FreeSolo>
      {...rest}
      value={value}
      disabled={isSubmitting || disabled}
      ref={ref}
      onChange={handleChange}
      renderInput={renderInput}
      onBlur={handleBlur}
    />
  );
});

/* export const EntityInput = forwardRef(function EntityInput<
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
    ENTITY_INPUT_DEFAULT_VALUE,
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

  useLoading({
    loading,
    name: rest.name || ENTITY_NAME,
    form: rest.form,
  });

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
      (data?.entities || []).map((value) => {
        switch (value.__typename) {
          case "Business":
            return new ValueNode(value, businessBranch);
          case "Department":
            return new ValueNode(
              value,
              value.ancestors.reduceRight(
                (branch, ancestor) =>
                  new BranchNode<EntityBranchInputOpt>(ancestor, branch),
                businessBranch
              )
            );
          case "Person":
            return new ValueNode(value, personBranch);
        }
      }),
    [data?.entities]
  );

  if (loading) {
    return <LoadingDefaultBlank {...rest} renderInput={renderInput} />;
  }
  return (
    <EntityInputControlled<Multiple, DisableClearable, FreeSolo>
      {...rest}
      ref={ref}
      renderInput={renderInput}
      defaultValue={
        (props.multiple
          ? defaultValues.length
            ? defaultValues
            : undefined
          : defaultValues[0] ?? undefined) as unknown as TreeSelectValue<
          EntityInputOpt,
          EntityBranchInputOpt,
          Multiple,
          true,
          false
        >
      }
    />
  );
}); */
