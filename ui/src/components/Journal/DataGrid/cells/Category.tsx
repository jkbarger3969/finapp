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
import { TableFilterCellProps } from "../plugins";
import { Filter } from "../plugins";
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
import { GridEntry } from "../Grid";
import { AvailableFilterOperations } from "../filters/rangeFilterUtils";

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
export type CategoryFilterProps = TableFilterCellProps<
  CategoryInputOpt,
  Extract<AvailableFilterOperations, "equal">
> & {
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

export const CategoryFilter = (props: CategoryFilterProps): JSX.Element => {
  const { categoryFilterOpts, ...rest } = props;

  const { filter, onFilter } = props;

  const columnName = props.column.name;

  const [state, setState] = useState<{
    branch: BranchNode<CategoryFilterInputOpt> | null;
  }>({
    branch: null,
  });

  const handleBranchChange = useCallback<
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

  const handleChange = useCallback<
    NonNullable<CategoryFilterSelect["onChange"]>
  >(
    (_, value) => {
      if (value.length) {
        onFilter({
          columnName,
          operator: "or",
          filters: value.map((option) => ({
            operation: "equal",
            value: option.valueOf() as CategoryInputOpt,
          })),
        });
      } else {
        onFilter(null);
      }
    },
    [columnName, onFilter]
  );

  const value = useMemo<
    ValueNode<CategoryFilterInputOpt, CategoryFilterInputOpt>[]
  >(() => {
    if (!filter) {
      return [];
    } else if ("operator" in filter) {
      return filter.filters.reduce((value, filter) => {
        if ("operation" in filter && filter.value) {
          value.push(new ValueNode(filter.value, state.branch));
        }
        return value;
      }, [] as ValueNode<CategoryFilterInputOpt, CategoryFilterInputOpt>[]);
    }
    return "operation" in filter && filter.value
      ? [new ValueNode(filter.value, state.branch)]
      : [];
  }, [filter, state.branch]);

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
        onBranchChange={handleBranchChange}
        onChange={handleChange}
        options={options}
        renderInput={renderFilterInput}
        value={value}
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

    if (filterValue === undefined) {
      return true;
    }

    switch (filter.operation) {
      case "equal":
        if (isEntryType(filterValue)) {
          return (
            (filterValue as EntryType) ===
              (value as GridEntryFragment["category"]).type ||
            (row as GridEntry).__typename === "EntryRefund"
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
              (value as GridEntryFragment["category"]).type &&
            (row as GridEntry).__typename === "Entry"
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
