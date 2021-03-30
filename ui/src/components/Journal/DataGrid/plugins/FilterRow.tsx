import React, { useCallback } from "react";
import {
  TableFilterRow,
  TableFilterRowProps,
} from "@devexpress/dx-react-grid-material-ui";

export const FilterRow = (props: TableFilterRowProps): JSX.Element => {
  return (
    <TableFilterRow
      {...props}
      cellComponent={useCallback((props) => {
        return <TableFilterRow.Cell {...props} />;
      }, [])}
    />
  );
};
