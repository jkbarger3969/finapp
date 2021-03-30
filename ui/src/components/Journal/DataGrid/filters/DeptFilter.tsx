import React, { useCallback, useMemo, useState } from "react";
import { ApolloError } from "@apollo/client";
import { TableCell } from "@material-ui/core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import { treeSelectProps } from "./shared";
import DepartmentInput, {
  DepartmentInputPropsWithGetOptions,
  DeptInputOpt,
} from "../../../Inputs/DepartmentInput";
import { Filter, LogicFilter } from "./FilterColumnsState";
import { FilterCellProps } from "./FilterColumnsStateProvider";
import { GridEntryFragment as GridEntry } from "../../../../apollo/graphTypes";

export const columnExtension: IntegratedFiltering.ColumnExtension = {
  columnName: "department",
  predicate: (_, filter, row): boolean => {
    switch (filter.operation) {
      case "equal":
        return (
          ((filter as unknown) as Filter<DeptInputOpt>).value.id ===
          (row as GridEntry).department.id
        );
      case "notEqual":
        return (
          ((filter as unknown) as Filter<DeptInputOpt>).value.id !==
          (row as GridEntry).department.id
        );
      default:
        return false;
    }
  },
};

type DeptInputProps = DepartmentInputPropsWithGetOptions<true, false, false>;
export const DeptFilter = (props: FilterCellProps): JSX.Element => {
  const {
    deptFilterOpts,
    changeColumnFilter,
    column,
    colSpan,
    rowSpan,
  } = props;

  const [{ error, value }, setState] = useState<{
    error?: ApolloError;
    value: DeptInputOpt[];
  }>({ value: [] });

  const columnName = column.name;

  const getOptions = useCallback<NonNullable<DeptInputProps["getOptions"]>>(
    () => deptFilterOpts || [],
    [deptFilterOpts]
  );

  const onChange = useCallback<DeptInputProps["onChange"]>(
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
        const logicFilter: LogicFilter<DeptInputOpt> = {
          operator: "or",
          filters: [],
        };

        for (const deptOpt of value) {
          logicFilter.filters.push({
            operation: "equal",
            value: deptOpt,
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

  const onGQLError = useCallback<DeptInputProps["onGQLError"]>(
    (error) => {
      setState((state) => ({
        ...state,
        error,
      }));
    },
    [setState]
  );

  const textFieldProps = useMemo<
    NonNullable<DeptInputProps["textFieldProps"]>
  >(() => {
    if (error) {
      return {
        error: true,
        helperText: `Department Options Fetch Error: ${error.message}`,
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
      <DepartmentInput<true, false, false>
        {...treeSelectProps}
        onChange={onChange}
        onGQLError={onGQLError}
        disabled={!!error || !deptFilterOpts || deptFilterOpts.length === 0}
        textFieldProps={textFieldProps}
        value={value}
        getOptions={getOptions}
        multiple
      />
    </TableCell>
  );
};

export default DeptFilter;
