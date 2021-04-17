import React from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";
import { GridEntryFragment } from "../../../../apollo/graphTypes";

export type CategoryProviderProps = Omit<
  DataTypeProviderProps,
  "formatterComponent"
>;

const FormatterComponent = ({
  value,
}: DataTypeProvider.ValueFormatterProps): JSX.Element => (
  <span>{(value as GridEntryFragment["category"]).name}</span>
);

export const CategoryProvider = (props: CategoryProviderProps): JSX.Element => {
  return (
    <DataTypeProvider {...props} formatterComponent={FormatterComponent} />
  );
};
