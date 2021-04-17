import React from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";

import { GridEntryFragment } from "../../../../apollo/graphTypes";

export type SourceProviderProps = Omit<
  DataTypeProviderProps,
  "formatterComponent"
>;

export const sourceToStr = (src: GridEntryFragment["source"]): string => {
  switch (src.__typename) {
    case "Business":
    case "Department":
      return src.name;
    case "Person":
      return `${src.personName.first} ${src.personName.last}`;
  }
};

const FormatterComponent = ({
  value,
}: DataTypeProvider.ValueFormatterProps): JSX.Element => (
  <span>{sourceToStr(value as GridEntryFragment["source"])}</span>
);

export const SourceProvider = (props: SourceProviderProps): JSX.Element => {
  return (
    <DataTypeProvider {...props} formatterComponent={FormatterComponent} />
  );
};
