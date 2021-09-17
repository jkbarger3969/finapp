import React, { useCallback, useMemo, useState } from "react";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";
import { capitalCase } from "capital-case";
import TreeSelect, {
  BranchNode,
  ValueNode,
  TreeSelectProps,
} from "mui-tree-select";

import { EntryType, GridEntryFragment } from "../../../../apollo/graphTypes";
import { OnFilter } from "../plugins";
import { Filter, LogicFilter } from "../plugins";
import {
  CategoryInputOpt,
  getOptionLabel,
  getOptionSelected,
} from "../../../Inputs/Category";
import {
  inlineAutoCompleteProps,
  inlinePadding,
  renderFilterInput,
} from "./shared";

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

export const defaultOptions: BranchNode<EntryType>[] = [
  new BranchNode(EntryType.Credit),
  new BranchNode(EntryType.Debit),
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
  const value = option.valueOf();

  if (isEntryType(value)) {
    return capitalCase(value as EntryType);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getOptionLabel(value as any);
  }
};

const getFilterOptionSelected: NonNullable<
  CategoryFilterSelect["getOptionSelected"]
> = (option, value): boolean => {
  const opt = option.valueOf();
  const val = value.valueOf();

  const optionIsEntry = isEntryType(opt);
  const valueIsEntry = isEntryType(val);

  if (optionIsEntry || valueIsEntry) {
    return opt === val;
  } else if (!optionIsEntry && !valueIsEntry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getOptionSelected(opt as any, val as any);
  } else {
    return false;
  }
};

// const renderFilterInput: NonNullable<CategoryFilterSelect["renderInput"]> = (
//   params
// ) =>
//   defaultInput({
//     ...params,
//     InputProps: {
//       ...(params.InputProps || {}),
//       ...inlineInputProps,
//     },
//   });

export const CategoryFilter = (props: CategoryFilterProps): JSX.Element => {
  const { categoryFilterOpts, ...rest } = props;

  const columnName = props.column.name;

  const [state, setState] = useState<{
    branch: BranchNode<CategoryFilterInputOpt> | null;
  }>({
    branch: null,
  });

  const onBranchChange = useCallback<
    NonNullable<CategoryFilterSelect["onBranchChange"]>
  >(
    (_, branch) => {
      setState((state) => ({
        ...state,
        branch,
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
    if (state.branch) {
      if (state.branch.valueOf() === EntryType.Credit) {
        return creditOpts;
      } else {
        return debitOpts;
      }
    } else {
      return defaultOptions.reduce((opts, opt) => {
        if (opt.valueOf() === EntryType.Credit) {
          if (creditOpts.length) {
            opts.push(opt);
          }
          opts.push(opt.valueOf());
        } else {
          if (debitOpts.length) {
            opts.push(opt);
          }
          opts.push(opt.valueOf());
        }

        return opts;
      }, [] as CategoryFilterSelect["options"]);
    }
  }, [creditOpts, debitOpts, state.branch]);

  const { onFilter } = props;

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
            value: option.valueOf() as CategoryInputOpt,
          });
        }

        onFilter({
          columnName,
          filters: [logicFilter],
        });
      } else {
        onFilter(null);
      }
    },
    [columnName, onFilter]
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
        branch={state.branch}
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
    const filterValue = (filter as unknown as Filter<CategoryFilterInputOpt>)
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
            new ValueNode(value),
            new ValueNode(filterValue as CategoryInputOpt)
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
            new ValueNode(value),
            new ValueNode(filterValue as CategoryInputOpt)
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

export type CategoryRowChanges = {
  category: ValueNode<CategoryInputOpt, CategoryInputOpt> | null;
};
