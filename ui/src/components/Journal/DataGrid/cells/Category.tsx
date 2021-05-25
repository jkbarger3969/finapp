import React, { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableFilterRow,
  TableEditRow,
} from "@devexpress/dx-react-grid-material-ui";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import { capitalCase } from "capital-case";
import TreeSelect, {
  BranchOption,
  TreeSelectProps,
  defaultInput,
} from "mui-tree-select";

import { EntryType, GridEntryFragment } from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins";
import { Filter, LogicFilter } from "../plugins";
import {
  CategoryInputOpt,
  getOptionLabel,
  getOptionSelected,
  useCategoryTree,
  CategoryTreeRoot,
} from "../../../Inputs/categoryInputUtils";
import {
  inlineAutoCompleteProps,
  inlineInputProps,
  inlinePadding,
  RowChangesProp,
} from "./shared";
import { QueryHookOptions } from "../../../Inputs/shared";

export const CategoryCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;

  return (
    <Table.Cell
      {...rest}
      value={(value as GridEntryFragment["category"]).name}
    />
  );
};

// Filter Cell
export type CategoryFilterProps = Omit<TableFilterRow.CellProps, "onFilter"> & {
  onFilter: OnFilter<CategoryInputOpt, "equal">;
  categoryFilterOpts?: Exclude<CategoryInputOpt, EntryType>[];
};

export const defaultOptions: BranchOption<EntryType>[] = [
  new BranchOption(EntryType.Credit),
  new BranchOption(EntryType.Debit),
];

type CategoryFilterInputOpt = CategoryInputOpt | EntryType;

type CategoryFilterSelect = TreeSelectProps<
  CategoryFilterInputOpt,
  CategoryFilterInputOpt,
  true,
  false,
  false
>;

const isEntryType = (value: CategoryFilterInputOpt) =>
  value === EntryType.Credit || value === EntryType.Debit;

const getFilterOptionLabel: NonNullable<
  CategoryFilterSelect["getOptionLabel"]
> = (option): string => {
  if (option instanceof BranchOption) {
    if (isEntryType(option.option)) {
      return capitalCase(option.option as EntryType);
    } else {
      return getOptionLabel((option as unknown) as CategoryInputOpt);
    }
  } else if (isEntryType(option)) {
    return `All ${capitalCase(option as EntryType)}s`;
  } else {
    return getOptionLabel((option as unknown) as CategoryInputOpt);
  }
};

const getFilterOptionSelected: NonNullable<
  CategoryFilterSelect["getOptionSelected"]
> = (option, value): boolean => {
  const optionIsEntry = isEntryType(option);
  const valueIsEntry = isEntryType(value);

  if (optionIsEntry || valueIsEntry) {
    return option === value;
  } else if (!optionIsEntry && !valueIsEntry) {
    return getOptionSelected(
      option as CategoryInputOpt,
      value as CategoryInputOpt
    );
  } else {
    return false;
  }
};

const renderFilterInput: NonNullable<CategoryFilterSelect["renderInput"]> = (
  params
) =>
  defaultInput({
    ...params,
    InputProps: {
      ...(params.InputProps || {}),
      ...inlineInputProps,
    },
  });

export const CategoryFilter = (props: CategoryFilterProps): JSX.Element => {
  const { categoryFilterOpts, ...rest } = props;

  const columnName = props.column.name;

  const [state, setState] = useState({
    branchPath: [] as BranchOption<CategoryFilterInputOpt>[],
  });

  const onBranchChange = useCallback<
    NonNullable<CategoryFilterSelect["onBranchChange"]>
  >(
    (...[, , branchPath]) => {
      setState((state) => ({
        ...state,
        branchPath,
      }));
    },
    [setState]
  );

  const [creditOpts, debitOpts] = useMemo<
    [
      Exclude<CategoryInputOpt, EntryType>[],
      Exclude<CategoryInputOpt, EntryType>[]
    ]
  >(() => {
    if (categoryFilterOpts) {
      return categoryFilterOpts.reduce(
        (parsedOpts, opt) => {
          if (opt.type === EntryType.Credit) {
            parsedOpts[0].push(opt);
          } else {
            parsedOpts[1].push(opt);
          }

          return parsedOpts;
        },
        [[], []] as [
          Exclude<CategoryInputOpt, EntryType>[],
          Exclude<CategoryInputOpt, EntryType>[]
        ]
      );
    }
    return [[], []];
  }, [categoryFilterOpts]);

  const options = useMemo<CategoryFilterSelect["options"]>(() => {
    if (state.branchPath.length) {
      if (state.branchPath[0].option === EntryType.Credit) {
        return creditOpts;
      } else {
        return debitOpts;
      }
    } else {
      return defaultOptions.reduce((opts, opt) => {
        if (opt.option === EntryType.Credit) {
          if (creditOpts.length) {
            opts.push(opt);
          }
          opts.push(opt.option);
        } else {
          if (debitOpts.length) {
            opts.push(opt);
          }
          opts.push(opt.option);
        }

        return opts;
      }, [] as CategoryFilterSelect["options"]);
    }
  }, [creditOpts, debitOpts, state.branchPath]);

  const onChange = useCallback<NonNullable<CategoryFilterSelect["onChange"]>>(
    (_, value) => {
      if (value.length) {
        const logicFilter: LogicFilter<CategoryInputOpt, "equal"> = {
          operator: "or",
          filters: [],
        };

        for (const option of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: option as CategoryInputOpt,
          });
        }

        props.onFilter({
          columnName,
          filters: [logicFilter],
        });
      } else {
        props.onFilter(null);
      }
    },
    [columnName, props.onFilter]
  );

  return (
    <TableFilterRow.Cell
      {...(rest as TableFilterRow.CellProps)}
      style={inlinePadding}
    >
      <TreeSelect<
        CategoryFilterInputOpt,
        CategoryFilterInputOpt,
        true,
        false,
        false
      >
        branchPath={state.branchPath}
        disabled={!props.filteringEnabled}
        getOptionLabel={getFilterOptionLabel}
        getOptionSelected={getFilterOptionSelected}
        multiple
        onBranchChange={onBranchChange}
        onChange={onChange}
        options={options}
        renderInput={renderFilterInput}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};

export const categoryFilterColumnExtension = (
  columnName: string,
  toString: (value: CategoryInputOpt) => string
): IntegratedFiltering.ColumnExtension => ({
  columnName,
  predicate: (value, filter, row): boolean => {
    const filterValue = ((filter as unknown) as Filter<CategoryFilterInputOpt>)
      .value;
    switch (filter.operation) {
      case "equal":
        if (isEntryType(filterValue)) {
          return (
            (filterValue as EntryType) ===
            (value as GridEntryFragment["category"]).type
          );
        } else {
          return getOptionSelected(
            value,
            ((filter as unknown) as Filter<CategoryInputOpt>).value
          );
        }

      case "notEqual": {
        if (isEntryType(filterValue)) {
          return (
            (filterValue as EntryType) !==
            (value as GridEntryFragment["category"]).type
          );
        } else {
          return !getOptionSelected(
            value,
            ((filter as unknown) as Filter<CategoryInputOpt>).value
          );
        }
      }
      default:
        return IntegratedFiltering.defaultPredicate(
          toString(value as CategoryInputOpt),
          filter,
          row
        );
    }
  },
});

type CategoryEditorSelect = TreeSelectProps<
  CategoryInputOpt,
  CategoryInputOpt,
  false,
  true,
  false
>;

export type CategoryRowChanges = {
  category: CategoryInputOpt | null;
};

export type CategoryEditorProps = TableEditRow.CellProps & {
  root?: CategoryTreeRoot;
  treeSelectParams?: Partial<
    Pick<CategoryEditorSelect, "renderInput" | "disabled">
  >;
  queryHookOptions?: QueryHookOptions;
} & RowChangesProp<CategoryRowChanges>;

export const CategoryEditor = (props: CategoryEditorProps): JSX.Element => {
  const {
    root,
    treeSelectParams: treeSelectParamsProp,
    queryHookOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChanges,
    ...rest
  } = props;

  const { onValueChange } = props;

  const { treeSelectParams, queryResult } = useCategoryTree({
    root,
    queryHookOptions,
    iniValue: props.value?.id,
  });

  const onChange = useCallback<NonNullable<CategoryEditorSelect["onChange"]>>(
    (...[, value]) => {
      onValueChange(value);
    },
    [onValueChange]
  );

  const renderInput = useCallback<
    NonNullable<CategoryEditorSelect["renderInput"]>
  >(
    (params) => {
      if (queryResult.error) {
        return (treeSelectParamsProp?.renderInput || defaultInput)({
          ...params,
          error: true,
          helperText: queryResult.error.message,
        });
      }

      return defaultInput(params);
    },
    [treeSelectParamsProp?.renderInput, queryResult.error]
  );

  return (
    <TableEditRow.Cell {...rest}>
      <TreeSelect<CategoryInputOpt, CategoryInputOpt, false, true, false>
        {...(treeSelectParamsProp || {})}
        {...treeSelectParams}
        disabled={!props.editingEnabled || !!treeSelectParamsProp?.disabled}
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        loading={queryResult.loading}
        onChange={onChange}
        renderInput={renderInput}
        value={props.value ?? null}
      />
    </TableEditRow.Cell>
  );
};
