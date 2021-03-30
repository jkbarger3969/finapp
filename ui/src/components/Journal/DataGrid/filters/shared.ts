import { SelectProps } from "@material-ui/core";
import { TreeSelectProps } from "mui-tree-select";

export const selectProps: SelectProps = {
  MenuProps: {
    MenuListProps: {
      dense: true,
      disablePadding: true,
    },
  },
} as const;

export const treeSelectProps: Pick<
  TreeSelectProps<unknown, undefined, undefined, undefined>,
  "fullWidth" | "size"
> = {
  fullWidth: true,
  size: "small",
} as const;
