import React, { useCallback } from "react";
import { TableCell } from "@material-ui/core";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import TreeSelect, { TreeSelectProps, Option, NodeType } from "mui-tree-select";

import { EntryType } from "../../../../apollo/graphTypes";
import { treeSelectProps } from "./shared";

type Props = TreeSelectProps<EntryType, false, false, false>;

const options: Option<EntryType>[] = [
  { option: EntryType.Debit, type: NodeType.Leaf },
  { option: EntryType.Credit, type: NodeType.Leaf },
];
const getOptions: Props["getOptions"] = () => options;

export const TypeFilter = (props: TableFilterRow.CellProps): JSX.Element => {
  const {
    colSpan,
    rowSpan,
    onFilter,
    column: { name: columnName },
    filteringEnabled,
  } = props;

  const onChange = useCallback<Props["onChange"]>(
    (value) => {
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
        getOptions={getOptions}
        onChange={onChange}
      />
    </TableCell>
  );
};

export default TypeFilter;
