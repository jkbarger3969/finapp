import React, { useCallback } from "react";
import { TableCell } from "@material-ui/core";
import TreeSelect, { TreeSelectProps } from "mui-tree-select";

import { EntryType } from "../../../../apollo/graphTypes";
import { treeSelectProps } from "./shared";
import { FilterCellComponentProps } from "../plugins";

type Props = TreeSelectProps<EntryType, false, false, false>;

const options: ReadonlyArray<EntryType> = [
  EntryType.Debit,
  EntryType.Credit,
] as const;

const onBranchChange = () => void undefined;

export const TypeFilter = (props: FilterCellComponentProps): JSX.Element => {
  const {
    colSpan,
    rowSpan,
    onFilter,
    column: { name: columnName },
    filteringEnabled,
  } = props;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value) {
        onFilter({
          columnName,
          value,
        });
      } else {
        onFilter(null);
      }
    },
    [columnName, onFilter]
  );

  return (
    <TableCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      size="small"
      variant="head"
      padding="checkbox"
    >
      <TreeSelect<EntryType, false, false, false>
        {...treeSelectProps}
        disabled={!filteringEnabled}
        options={options as EntryType[]}
        onBranchChange={onBranchChange}
        onChange={onChange}
      />
    </TableCell>
  );
};

export default TypeFilter;
