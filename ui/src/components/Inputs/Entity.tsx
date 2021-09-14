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
  IsEqualFn,
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

const entityIsEqual: IsEqualFn<
  EntityTreeSelectValue<true | false, true | false, true | false>
> = (a, b) => {
  type TIsEqual = EntityTreeSelectValue<false, false, true>;

  const isEqual = (a: TIsEqual, b: TIsEqual) => {
    if (!a || !b) {
      return a === b;
    } else if (a instanceof FreeSoloNode || b instanceof FreeSoloNode) {
      return a.valueOf() === b.valueOf();
    } else {
      const aVal = a.valueOf();
      const bVal = b.valueOf();
      return aVal.id === bVal.id && aVal.__typename === bVal.__typename;
    }
  };

  if (Array.isArray(a) || Array.isArray(b)) {
    type TMulti = EntityTreeSelectValue<true, true | false, true | false>;

    if ((a as TMulti).length !== (b as TMulti).length) {
      return false;
    } else {
      return (a as TMulti).every((a, i) => isEqual(a, (b as TMulti)[i]));
    }
  } else {
    return isEqual(a, b);
  }
};

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
      ancestors(root: $deptRoot) {
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
  query EntityInputDefaultValue(
    $where: EntitiesWhere!
    $deptRoot: DepartmentsWhere
  ) {
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
      "options" | "defaultValue"
    >,
    "onChange" | "value"
  >,
  "branch" | "onBranchChange"
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
    branch: branchProp,
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

  const [branch, setBranch] = useControlled({
    controlled: branchProp,
    default: null,
    name: "EntityInputBase",
    state: "branch",
  });

  const queryResult = useQuery<EntityInputOpts, EntityInputOptsVars>(
    ENTITY_INPUT_OPTS,
    useMemo(() => {
      const curBranch = branch?.valueOf();
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
    }, [branch, inputValue])
  );

  const onBranchChange = useCallback<
    NonNullable<EntityTreeSelectProps["onBranchChange"]>
  >(
    (...args) => {
      setBranch(args[1]);

      if (onBranchChangeProp) {
        onBranchChangeProp(...args);
      }
    },
    [onBranchChangeProp, setBranch]
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
      const curBranch = branch?.valueOf();

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
    [queryResult.error, renderInputProp, branch]
  );

  const options = useMemo<EntityTreeSelectProps["options"]>(() => {
    const options: EntityTreeSelectProps["options"] = [];

    if (!branch) {
      return defaultOptions;
    } else {
      return (queryResult.data?.entities || []).reduce((options, entity) => {
        switch (entity.__typename) {
          case "Business":
            if (entity.departments.length) {
              options.push(new BranchNode(entity, branch));
            }
            options.push(entity);
            break;
          case "Department":
            if (entity.children.length) {
              options.push(new BranchNode(entity, branch));
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
  }, [queryResult.data?.entities, branch]);

  const freeSolo = useMemo<FreeSolo>(() => {
    const curBranch = branch?.valueOf();
    return ((curBranch === "Person" && !!allowNewPerson) ||
      (curBranch === "Business" && !!allowNewBusiness)) as FreeSolo;
  }, [branch, allowNewPerson, allowNewBusiness]);

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
      branch={branch}
      loading={queryResult.loading || loading}
      renderInput={renderInput}
      inputValue={inputValue}
      onInputChange={onInputChange}
      options={options}
      freeSolo={freeSolo}
      // !props.value condition keeps the inputValue being taken as a
      // FreeSoloNode onBlur when a value is selected from the options.
      autoSelect={(autoSelect ?? false) || (freeSolo && !props.value)}
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
  Omit<
    EntityInputBaseProps<Multiple, DisableClearable, FreeSolo>,
    "branch" | "value"
  >,
  "onChange"
> &
  Pick<UseFieldOptions, "form">;

const BRANCH_NOT_SET = Symbol();

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
      EntityInputOpt,
      EntityBranchInputOpt,
      Multiple,
      DisableClearable,
      FreeSolo
    >
  >({
    name: nameProp,
    form,
    isEqual: entityIsEqual,
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

  // The following accommodates async default value lookups.
  const [branch, setBranch] = useState(() =>
    value instanceof ValueNode ? value.parent : BRANCH_NOT_SET
  );

  const handleBranchChange = useCallback<
    NonNullable<
      EntityInputBaseProps<
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
    <EntityInputBase<Multiple, DisableClearable, FreeSolo>
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
