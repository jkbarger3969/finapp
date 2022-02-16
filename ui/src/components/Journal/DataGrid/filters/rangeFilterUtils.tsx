import React from "react";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";

import AddCircleIcon from "@material-ui/icons/AddCircle";

import { DefaultFilterOperations } from "../plugins";
import { SvgIconProps, SvgIcon } from "@material-ui/core";

export type AvailableFilterOperations = Extract<
  DefaultFilterOperations,
  | "equal"
  | "notEqual"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
>;

const EqualIcon = (props: Exclude<SvgIconProps, "children">) => (
  <SvgIcon {...props}>
    <path d="M19,10H5V8H19V10M19,16H5V14H19V16Z" />
  </SvgIcon>
);

const NotEqualIcon = (props: Exclude<SvgIconProps, "children">) => (
  <SvgIcon {...props}>
    <path d="M14.08,4.61L15.92,5.4L14.8,8H19V10H13.95L12.23,14H19V16H11.38L9.92,19.4L8.08,18.61L9.2,16H5V14H10.06L11.77,10H5V8H12.63L14.08,4.61Z" />
  </SvgIcon>
);

const GreaterThanOrEqualIcon = (props: Exclude<SvgIconProps, "children">) => (
  <SvgIcon {...props}>
    <path d="M6.5,2.27L20,10.14L6.5,18L5.5,16.27L16.03,10.14L5.5,4L6.5,2.27M20,20V22H5V20H20Z" />
  </SvgIcon>
);

const GreaterThanIcon = (props: Exclude<SvgIconProps, "children">) => (
  <SvgIcon {...props}>
    <path d="M5.5,4.14L4.5,5.86L15,12L4.5,18.14L5.5,19.86L19,12L5.5,4.14Z" />
  </SvgIcon>
);

const LessThanOrEqualIcon = (props: Exclude<SvgIconProps, "children">) => (
  <SvgIcon {...props}>
    <path d="M18.5,2.27L5,10.14L18.5,18L19.5,16.27L8.97,10.14L19.5,4L18.5,2.27M5,20V22H20V20H5Z" />
  </SvgIcon>
);

const LessThanIcon = (props: Exclude<SvgIconProps, "children">) => (
  <SvgIcon {...props}>
    <path d="M18.5,4.14L19.5,5.86L8.97,12L19.5,18.14L18.5,19.86L5,12L18.5,4.14Z" />
  </SvgIcon>
);

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
}: TableFilterRow.IconProps): JSX.Element => {
  switch (type as DefaultFilterOperations | "addRangeBound") {
    case "addRangeBound":
      return <AddCircleIcon {...rest} />;
    case "equal":
      return <EqualIcon {...rest} />;
    case "notEqual":
      return <NotEqualIcon {...rest} />;
    case "greaterThan":
      return <GreaterThanIcon {...rest} />;
    case "greaterThanOrEqual":
      return <GreaterThanOrEqualIcon {...rest} />;
    case "lessThan":
      return <LessThanIcon {...rest} />;
    case "lessThanOrEqual":
      return <LessThanOrEqualIcon {...rest} />;
    default:
      return <TableFilterRow.Icon type={type} {...rest} />;
  }
};
