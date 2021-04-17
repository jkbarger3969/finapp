import React from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";
import { GridEntrySrcDeptFragment } from "../../../../apollo/graphTypes";

export type DeptProviderProps = Omit<
  DataTypeProviderProps,
  "formatterComponent"
>;

const FormatterComponent = ({
  value,
}: DataTypeProvider.ValueFormatterProps): JSX.Element => (
  <span>{(value as GridEntrySrcDeptFragment).name}</span>
);

export const DeptProvider = (props: DeptProviderProps): JSX.Element => {
  return (
    <DataTypeProvider {...props} formatterComponent={FormatterComponent} />
  );
};
