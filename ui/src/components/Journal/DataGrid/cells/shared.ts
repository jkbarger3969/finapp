import React from "react";
import { InputProps } from "@material-ui/core";
import { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import { defaultInput } from "mui-tree-select";

export const inlineInputProps: InputProps = {
  margin: "dense",
};

export const renderFilterInput: typeof defaultInput = (params) =>
  defaultInput({
    ...params,
    InputProps: {
      ...(params.InputProps || {}),
      ...inlineInputProps,
    },
  });

export const inlinePadding: React.CSSProperties = {
  paddingLeft: "8px",
  paddingRight: "8px",
};

export const inlinePaddingWithSelector: React.CSSProperties = {
  paddingRight: "8px",
};

export const inlineAutoCompleteProps: Pick<
  AutocompleteProps<unknown, undefined, undefined, undefined>,
  "fullWidth" | "size"
> = {
  size: "small",
  fullWidth: true,
};
