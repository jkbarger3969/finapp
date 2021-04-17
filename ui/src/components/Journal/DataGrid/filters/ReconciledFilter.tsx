import React, { useCallback } from "react";
import { TableCell } from "@material-ui/core";
import TreeSelect, { TreeSelectProps } from "mui-tree-select";

import { Entry } from "../../../../apollo/graphTypes";
import { treeSelectProps } from "./shared";
import { FilterCellComponentProps } from "../plugins";

type ReconciledType = Entry["reconciled"];

type Props = TreeSelectProps<ReconciledType, false, false, false>;

const getOptionLabel: Props["getOptionLabel"] = (opt) =>
  opt ? "Reconciled" : "Unreconciled";

const onBranchChange = () => void undefined;

const options: ReadonlyArray<boolean> = [true, false] as const;

export const ReconciledFilter = (
  props: FilterCellComponentProps
): JSX.Element => {
  const {
    colSpan,
    rowSpan,
    onFilter,
    column: { name: columnName },
    filteringEnabled,
  } = props;

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value === true) {
        onFilter({
          columnName,
          value: (value as ReconciledType).toString(),
        });
      } else if (value === false) {
        onFilter({
          columnName,
          value: (value as ReconciledType).toString(),
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
      <TreeSelect<ReconciledType, false, false, false>
        {...treeSelectProps}
        options={options as ReconciledType[]}
        onBranchChange={onBranchChange}
        disabled={!filteringEnabled}
        onChange={onChange}
        getOptionLabel={getOptionLabel}
      />
    </TableCell>
  );
};

export default ReconciledFilter;
