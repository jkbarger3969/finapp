import React, { useCallback, useState } from "react";
import {
  Select,
  InputAdornment,
  MenuItem,
  SelectProps,
  Tooltip,
} from "@material-ui/core";
import { FilterList as FilterListIcon } from "@material-ui/icons";

type Values = "None" | "Reconciled" | "Unreconciled";

const Reconciled = (props: { setFilter: (filter: object) => void }) => {
  const { setFilter } = props;

  const [value, setValue] = useState<Values>("None");

  const onChange = useCallback<NonNullable<SelectProps["onChange"]>>(
    (event) => {
      const value = event.target.value as Values;

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
          setFilter({});
          break;
      }
      setValue(value);
    },
    [setFilter, setValue]
  );

  return (
    <Tooltip title={value === "None" ? "No Filter" : value}>
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
    </Tooltip>
  );
};

export default Reconciled;
