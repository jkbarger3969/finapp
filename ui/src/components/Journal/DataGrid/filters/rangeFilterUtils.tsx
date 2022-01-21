import React from "react";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import AddCircleIcon from "@material-ui/icons/AddCircle";

import { DefaultFilterOperations } from "../plugins";

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
  selector: AvailableFilterOperations
): AvailableRangeFilterOperations[] | undefined => {
  switch (selector) {
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

export const isRangeSelector = (
  selector: AvailableFilterOperations
): boolean => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    greaterThanFilterOps.includes(selector as any) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lessThanFilterOps.includes(selector as any)
  );
};

export const isValidRangeSelector = (
  selector: AvailableFilterOperations,
  rangeSelector: AvailableRangeFilterOperations
): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (lessThanFilterOps.includes(selector as any)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return greaterThanFilterOps.includes(rangeSelector as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (greaterThanFilterOps.includes(selector as any)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return lessThanFilterOps.includes(rangeSelector as any);
  } else {
    return false;
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
