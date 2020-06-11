import React, { useCallback, useMemo } from "react";
import {
  Select,
  InputAdornment,
  MenuItem,
  SelectProps,
} from "@material-ui/core";
import { FilterList as FilterListIcon } from "@material-ui/icons";
import sift from "sift";

import { EntryFilter, Entry } from "../Journal";

type ReconciledValues = "None" | "Reconciled" | "Unreconciled";

const reconciledTestDocs: Readonly<Pick<Entry, "reconciled">[]> = [
  { reconciled: true },
  { reconciled: false },
] as const;

const NULLISH = Symbol();

const Reconciled = (props: {
  filter: EntryFilter;
  setFilter: (filter: EntryFilter) => void;
}) => {
  const { filter, setFilter } = props;

  const onChange = useCallback<NonNullable<SelectProps["onChange"]>>(
    (event) => {
      const value = event.target.value as ReconciledValues;

      switch (value) {
        case "Reconciled":
          setFilter({
            reconciled: {
              $eq: true,
            },
          });
          break;
        case "Unreconciled":
          setFilter({
            reconciled: { $eq: false },
          });
          break;
        case "None":
        default:
          setFilter({
            reconciled: { $in: [true, false] as any },
          });
      }
    },
    [setFilter]
  );

  const value = useMemo<ReconciledValues>(() => {
    if (((filter as any)?.reconciled ?? NULLISH) === NULLISH) {
      return "None";
    }

    const result = reconciledTestDocs.filter(
      sift({
        reconciled: (filter as any).reconciled,
      })
    );

    if (result.length === 0 || result.length === reconciledTestDocs.length) {
      return "None";
    }

    return result[0].reconciled ? "Reconciled" : "Unreconciled";
  }, [filter]);

  return (
    <Select
      startAdornment={
        <InputAdornment disablePointerEvents position="start">
          <FilterListIcon />
        </InputAdornment>
      }
      onChange={onChange}
      fullWidth
      value={value === "None" ? "" : value}
    >
      <MenuItem value="None">None</MenuItem>
      <MenuItem value="Reconciled">Reconciled</MenuItem>
      <MenuItem value="Unreconciled">Unreconciled</MenuItem>
    </Select>
  );
};

export default Reconciled;
