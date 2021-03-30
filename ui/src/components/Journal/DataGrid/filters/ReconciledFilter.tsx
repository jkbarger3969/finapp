import React, { useCallback } from "react";
import { TableCell } from "@material-ui/core";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import TreeSelect, { TreeSelectProps, Option, NodeType } from "mui-tree-select";

import { Entry } from "../../../../apollo/graphTypes";
import { treeSelectProps } from "./shared";

type ReconciledType = Entry["reconciled"];

type Props = TreeSelectProps<ReconciledType, false, false, false>;

const options: Option<ReconciledType>[] = [
  { option: true, type: NodeType.Leaf },
  { option: false, type: NodeType.Leaf },
];
const getOptions: Props["getOptions"] = () => options;

const getOptionLabel: Props["getOptionLabel"] = (opt) =>
  opt ? "Reconciled" : "Unreconciled";

export const ReconciledFilter = (
  props: TableFilterRow.CellProps
): JSX.Element => {
  const {
    colSpan,
    rowSpan,
    onFilter,
    column: { name: columnName },
    filteringEnabled,
  } = props;

  const onChange = useCallback<Props["onChange"]>(
    (value) => {
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
        disabled={!filteringEnabled}
        getOptions={getOptions}
        onChange={onChange}
        getOptionLabel={getOptionLabel}
      />
    </TableCell>
  );
};

export default ReconciledFilter;
