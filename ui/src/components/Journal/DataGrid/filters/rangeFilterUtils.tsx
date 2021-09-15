import React from "react";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import { DefaultFilterOperations } from "../plugins/FilteringState";

export type AvailableFilterOperations = Extract<
  DefaultFilterOperations,
  | "equal"
  | "notEqual"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
>;

export const availableFilterOperations: ReadonlyArray<AvailableFilterOperations> =
  [
    "equal",
    "notEqual",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
  ];

export type AvailableRangeFilterOperations = Extract<
  AvailableFilterOperations,
  "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual"
>;

export const lessThanFilterOps: ReadonlyArray<
  Extract<AvailableRangeFilterOperations, "lessThan" | "lessThanOrEqual">
> = ["lessThan", "lessThanOrEqual"];

export const greaterThanFilterOps: ReadonlyArray<
  Extract<AvailableRangeFilterOperations, "greaterThan" | "greaterThanOrEqual">
> = ["greaterThan", "greaterThanOrEqual"];

export const getAvailableRangeOps = (
  selectorValue: AvailableFilterOperations
): AvailableRangeFilterOperations[] | undefined => {
  switch (selectorValue) {
    case "greaterThan":
    case "greaterThanOrEqual":
      return lessThanFilterOps as AvailableRangeFilterOperations[];
    case "lessThan":
    case "lessThanOrEqual":
      return greaterThanFilterOps as AvailableRangeFilterOperations[];
    default:
      return undefined;
  }
};

export const RangeFilterIcons = ({
  type,
  ...rest
}: TableFilterRow.IconProps): JSX.Element =>
  type === "addRangeBound" ? (
    <AddCircleIcon {...rest} />
  ) : (
    <TableFilterRow.Icon type={type} {...rest} />
  );
