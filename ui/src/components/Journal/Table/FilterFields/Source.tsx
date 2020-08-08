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
  SelectProps,
} from "@material-ui/core";
import { FilterList as FilterListIcon } from "@material-ui/icons";

import { Entry } from "../Journal";

const Source = (props: {
  options: Iterable<Entry["source"]>;
  setFilter: (filter: unknown) => void;
}): JSX.Element => {
  const { setFilter, options } = props;

  const [value, setValue] = useState<string[]>([]);

  const [items, idNameMap] = useMemo(() => {
    const items: JSX.Element[] = [];
    const idNameMap = new Map<string, string>();

    for (const source of options) {
      const name = (() => {
        switch (source.__typename) {
          case "Person":
            return `${source.name.first} ${source.name.last}`;
          case "Business":
            return source.bizName;
          case "Department":
            return source.deptName;
        }
      })();

      const id = `${source.__typename}-${source.id}`;

      idNameMap.set(id, name);

      items.push(
        <MenuItem key={id} value={id}>
          <Checkbox checked={value.includes(id)} />
          <ListItemText primary={name} />
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
      const values = (event.target.value || []) as string[];
      if (values.length === 0) {
        setFilter({});
      } else {
        setFilter({
          $or: values.map((v) => {
            const [type, id] = v.split("-");

            return {
              "source.id": id,
              "source.__typename": type,
            };
          }),
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
          renderValue={renderValue as SelectProps["renderValue"]}
        >
          {items}
        </Select>
      </Box>
    </Tooltip>
  );
};

export default Source;
