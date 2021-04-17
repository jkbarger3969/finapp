import { InputProps, SelectProps } from "@material-ui/core";
import { TreeSelectProps } from "mui-tree-select";

export const selectProps: SelectProps = {
  MenuProps: {
    MenuListProps: {
      dense: true,
      disablePadding: true,
    },
  },
} as const;

export const inputProps: InputProps = {
  margin: "dense",
};

export const treeSelectProps: Pick<
  TreeSelectProps<unknown, undefined, undefined, undefined>,
  "fullWidth" | "size" | "textFieldProps"
> = {
  fullWidth: true,
  size: "small",
  textFieldProps: {
    InputProps: inputProps,
  },
} as const;
