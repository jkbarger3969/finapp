import React, { useCallback, useMemo, useState } from "react";
import { ApolloError } from "@apollo/client";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import { treeSelectProps } from "./shared";
import CategoryInput, {
  CategoryInputPropsWithGetOptions,
  CategoryInputOpt,
} from "../../../Inputs/CategoryInput";
import { Filter, LogicFilter } from "./FilterColumnsState";
import { FilterCellProps } from "./FilterColumnsStateProvider";
import { GridEntryFragment as GridEntry } from "../../../../apollo/graphTypes";

export const columnExtension: IntegratedFiltering.ColumnExtension = {
  columnName: "category",
  predicate: (_, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          ((filter as unknown) as Filter<CategoryInputOpt>).value.id ===
          (row as GridEntry).category.id
        );
      case "notEqual":
        return (
          ((filter as unknown) as Filter<CategoryInputOpt>).value.id !==
          (row as GridEntry).category.id
        );
      default:
        return false;
    }
  },
};

type CatInputProps = CategoryInputPropsWithGetOptions<true, false, false>;
export const CategoryFilter = (props: FilterCellProps): JSX.Element => {
  const {
    categoryFilterOpts,
    changeColumnFilter,
    column,
    colSpan,
    rowSpan,
  } = props;

  const [{ error, value }, setState] = useState<{
    error?: ApolloError;
    value: CategoryInputOpt[];
  }>({ value: [] });

  const columnName = column.name;

  const getOptions = useCallback<NonNullable<CatInputProps["getOptions"]>>(
    () => categoryFilterOpts || [],
    [categoryFilterOpts]
  );

  const onChange = useCallback<CatInputProps["onChange"]>(
    (value) => {
      setState((state) => ({
        ...state,
        value,
      }));

      if (value.length === 0) {
        changeColumnFilter({
          columnName,
          config: null,
        });
      } else {
        const logicFilter: LogicFilter<CategoryInputOpt> = {
          operator: "or",
          filters: [],
        };

        for (const categoryOpt of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: categoryOpt,
          });
        }

        changeColumnFilter({
          columnName,
          config: {
            filters: [logicFilter],
          },
        });
      }
    },
    [changeColumnFilter, columnName, setState]
  );

  const onGQLError = useCallback<CatInputProps["onGQLError"]>(
    (error) => {
      setState((state) => ({
        ...state,
        error,
      }));
    },
    [setState]
  );

  const textFieldProps = useMemo<
    NonNullable<CatInputProps["textFieldProps"]>
  >(() => {
    if (error) {
      return {
        error: true,
        helperText: `Category Options Fetch Error: ${error.message}`,
      };
    } else {
      return {};
    }
  }, [error]);

  return (
    <TableCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      size="small"
      variant="head"
      padding="checkbox"
    >
      <CategoryInput<true, false, false>
        {...treeSelectProps}
        onChange={onChange}
        onGQLError={onGQLError}
        disabled={
          !!error || !categoryFilterOpts || categoryFilterOpts.length === 0
        }
        textFieldProps={textFieldProps}
        value={value}
        getOptions={getOptions}
        multiple
      />
    </TableCell>
  );
};

export default CategoryFilter;
