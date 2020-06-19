import React, { useMemo, useCallback, useState } from "react";
import {
  Select,
  MenuItem,
  ListItemText,
  Input,
  Checkbox,
  InputAdornment,
  Box,
  Tooltip,
} from "@material-ui/core";
import { FilterList as FilterListIcon } from "@material-ui/icons";

import { Entry } from "../Journal";

const Category = (props: {
  options: Iterable<Entry["category"]>;
  setFilter: (filter: any) => void;
}) => {
  const { setFilter, options } = props;

  const [value, setValue] = useState<string[]>([]);

  const [items, idNameMap] = useMemo(() => {
    const items: JSX.Element[] = [];
    const idNameMap = new Map<string, string>();

    for (const category of options) {
      idNameMap.set(category.id, category.name);

      items.push(
        <MenuItem key={category.id} value={category.id}>
          <Checkbox checked={value.includes(category.id)} />
          <ListItemText primary={category.name} />
        </MenuItem>
      );
    }

    return [items, idNameMap] as const;
  }, [options, value]);

  const renderValue = useCallback(
    (renderValues: string[]) =>
      renderValues.map((v) => idNameMap.get(v) ?? "").join(", "),
    [idNameMap]
  );

  const onChange = useCallback(
    (event) => {
      const values = event.target.value || ([] as string[]);
      if (values.length === 0) {
        setFilter({});
      } else {
        setFilter({
          "category.id": { $in: values },
        });
      }
      setValue(values);
    },
    [setFilter]
  );

  return (
    <Tooltip title={value.length === 0 ? "No Filter" : renderValue(value)}>
      <Box maxWidth={250}>
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
        >
          {items}
        </Select>
      </Box>
    </Tooltip>
  );
};

export default Category;
