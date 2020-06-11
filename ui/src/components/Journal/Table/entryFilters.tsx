import React, { useCallback, useState } from "react";
import { startOfDay, isEqual } from "date-fns";
import Fraction from "fraction.js";
import {
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  SelectProps,
  IconButtonProps,
} from "@material-ui/core";
import { FilterList } from "@material-ui/icons";
import { O } from "ts-toolbelt";

import { Entry } from "./Journal";
import { rationalToFraction } from "../../../utils/rational";

const FilterToggle = (props: O.Required<IconButtonProps, "onClick">) => (
  <InputAdornment position="start">
    <IconButton {...props}>
      <FilterList />
    </IconButton>
  </InputAdornment>
);

export type FilterPredicate = (entry: Entry) => boolean;

export const dateFilter = (
  ops: {
    eq?: Date;
    gt?: Date;
    gte?: Date;
    lt?: Date;
    lte?: Date;
  } = {}
): FilterPredicate => {
  if (ops.eq) {
    const eq = startOfDay(new Date(ops.eq));
    return (entry) => isEqual(startOfDay(new Date(entry.date)), eq);
  }

  const gt = ops.gt ? startOfDay(new Date(ops.gt)) : null;
  const gte = ops.gte ? startOfDay(new Date(ops.gte)) : null;
  const lt = ops.lt ? startOfDay(new Date(ops.lt)) : null;
  const lte = ops.lte ? startOfDay(new Date(ops.lte)) : null;

  return (entry) => {
    const date = startOfDay(new Date(entry.date));
    return (
      (!gt || gt < date) &&
      (!gte || gte <= date) &&
      (!lt || lt > date) &&
      (!lte || lte >= date)
    );
  };
};

export const totalFilter = (
  ops: {
    eq?: Fraction | Pick<Fraction, "s" | "n" | "d">;
    gt?: Fraction | Pick<Fraction, "s" | "n" | "d">;
    gte?: Fraction | Pick<Fraction, "s" | "n" | "d">;
    lt?: Fraction | Pick<Fraction, "s" | "n" | "d">;
    lte?: Fraction | Pick<Fraction, "s" | "n" | "d">;
  } = {}
): FilterPredicate => {
  if (ops.eq) {
    const eq = new Fraction(ops.eq);
    return (entry) => eq.compare(rationalToFraction(entry.total)) === 0;
  }

  const gt = ops.gt ? new Fraction(ops.gt) : null;
  const gte = ops.gte ? new Fraction(ops.gte) : null;
  const lt = ops.lt ? new Fraction(ops.lt) : null;
  const lte = ops.lte ? new Fraction(ops.lte) : null;

  return (entry) => {
    const total = rationalToFraction(entry.total);
    return (
      (!gt || gt.compare(total) < 0) &&
      (!gte || gte.compare(total) <= 0) &&
      (!lt || lt.compare(total) > 0) &&
      (!lte || lte.compare(total) >= 0)
    );
  };
};

export const categoryFilter = (
  ops: {
    in?: string[];
  } = {}
): FilterPredicate => (entry) => !ops.in || ops.in.includes(entry.category.id);

export const sourceFilter = (
  ops: {
    in?: { type: Entry["source"]["__typename"]; id: Entry["source"]["id"] }[];
  } = {}
): FilterPredicate => (entry) =>
  !ops.in ||
  ops.in.some(
    (opt) => opt.type === entry.source.__typename && opt.id === entry.source.id
  );

export const paymentMethodFilter = (
  ops: {
    in?: string[];
  } = {}
): FilterPredicate => (entry) =>
  !ops.in || ops.in.some((id) => id === entry.paymentMethod.id);

export const departmentFilter = (
  ops: {
    in?: string[];
  } = {}
): FilterPredicate => (entry) =>
  !ops.in || ops.in.some((id) => id === entry.department.id);

const NULLISH = Symbol();

export const reconciledFilter = (
  reconciled: boolean | null | undefined = null
): FilterPredicate => (entry) =>
  (reconciled ?? NULLISH) === NULLISH ? true : reconciled === entry.reconciled;

enum ReconciledFilterValue {
  None = 1,
  Reconciled,
  Unreconciled,
}

export const ReconciledFilter = (props: {
  onPredicateChange: (predicate: FilterPredicate) => void;
}) => {
  const { onPredicateChange } = props;

  const onChange = useCallback<NonNullable<SelectProps["onChange"]>>(
    (event) => {
      const value = event.target.value as ReconciledFilterValue;
      switch (value) {
        case ReconciledFilterValue.None:
          onPredicateChange(reconciledFilter(null));
          break;
        case ReconciledFilterValue.Reconciled:
          onPredicateChange(reconciledFilter(true));
          break;
        case ReconciledFilterValue.Unreconciled:
          onPredicateChange(reconciledFilter(false));
          break;
      }
    },
    [onPredicateChange]
  );

  return (
    <Select
      startAdornment={
        <InputAdornment disablePointerEvents position="start">
          <FilterList />
        </InputAdornment>
      }
      onChange={onChange}
      fullWidth
      defaultValue={ReconciledFilterValue.None}
    >
      <MenuItem value={ReconciledFilterValue.None}>None</MenuItem>
      <MenuItem value={ReconciledFilterValue.Reconciled}>Reconciled</MenuItem>
      <MenuItem value={ReconciledFilterValue.Unreconciled}>
        Unreconciled
      </MenuItem>
    </Select>
  );
};
