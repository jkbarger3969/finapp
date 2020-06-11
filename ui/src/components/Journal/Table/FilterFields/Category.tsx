import React, { useMemo, useCallback } from "react";
import {
  Select,
  MenuItem,
  ListItemText,
  Input,
  Checkbox,
  InputAdornment,
} from "@material-ui/core";
import { FilterList as FilterListIcon } from "@material-ui/icons";
import sift from "sift";

import { EntryFilter, Entry, CLEAR_FILTER } from "../Journal";

const Category = (props: {
  filter: EntryFilter;
  setFilter: (filter: EntryFilter) => void;
  options: Iterable<Entry["category"]>;
}) => {
  const { filter, setFilter, options } = props;

  const { value, values, items } = useMemo<{
    value: string[];
    values: Map<string, Entry["category"]>;
    items: JSX.Element[];
  }>(() => {
    const isChecked = filter["category.id"]
      ? sift({ ["category.id"]: filter["category.id"] as any })
      : (v) => false;

    const value: string[] = [];
    const values = new Map<string, Entry["category"]>();
    const items: JSX.Element[] = [];

    for (const category of options) {
      const checked = isChecked({ category });

      if (checked) {
        value.push(category.id);
        values.set(category.id, category);
      }

      items.push(
        <MenuItem key={category.id} value={category.id}>
          <Checkbox checked={checked} />
          <ListItemText primary={category.name} />
        </MenuItem>
      );
    }

    return { value, values, items };
  }, [filter, options]);

  const renderValue = useCallback(
    (renderValues: string[]) =>
      renderValues.map((v) => values.get(v)?.name).join(", "),
    [values]
  );

  const onChange = useCallback(
    (event) => {
      const values = event.target.value || ([] as string[]);
      if (values.length === 0) {
        setFilter({ "category.id": CLEAR_FILTER } as any);
      } else {
        setFilter({ "category.id": { $in: values } } as any);
      }
    },
    [setFilter]
  );

  return (
    <Select
      startAdornment={
        <InputAdornment disablePointerEvents position="start">
          <FilterListIcon />
        </InputAdornment>
      }
      fullWidth
      multiple
      value={value}
      onChange={onChange}
      input={<Input />}
      renderValue={renderValue as any}
      // MenuProps={MenuProps}
    >
      {items}
    </Select>
  );
};

export default Category;
