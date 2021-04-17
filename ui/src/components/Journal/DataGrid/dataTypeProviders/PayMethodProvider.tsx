import React from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";

import { GridPaymentMethodFragment } from "../../../../apollo/graphTypes";
import { composeAlias } from "../../../../utils/alias";

export type PayMethodProviderProps = Omit<
  DataTypeProviderProps,
  "formatterComponent"
>;

export const payMethodToStr = (
  payMethod: GridPaymentMethodFragment
): string => {
  const { aliases } = payMethod;
  return aliases.length
    ? composeAlias(aliases, payMethod.name)
    : payMethod.name;
};

const FormatterComponent = ({
  value,
}: DataTypeProvider.ValueFormatterProps): JSX.Element => (
  <span>{payMethodToStr(value as GridPaymentMethodFragment)}</span>
);
export const PayMethodProvider = (
  props: PayMethodProviderProps
): JSX.Element => {
  return (
    <DataTypeProvider {...props} formatterComponent={FormatterComponent} />
  );
};
