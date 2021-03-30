import React from "react";
import { Plugin } from "@devexpress/dx-react-core";
import { IntegratedFiltering } from "@devexpress/dx-react-grid";

import { columnExtension as deptColumnExtension } from "./DeptFilter";
import { columnExtension as categoryColumnExtension } from "./CategoryFilter";
import { columnExtension as payMethodColumnExtension } from "./PayMethodFilter";

const columnExtensions: IntegratedFiltering.ColumnExtension[] = [
  deptColumnExtension,
  categoryColumnExtension,
  payMethodColumnExtension,
];

export const FilterColumns = (): JSX.Element => {
  return (
    <Plugin>
      <IntegratedFiltering columnExtensions={columnExtensions} />
    </Plugin>
  );
};

export default FilterColumns;
