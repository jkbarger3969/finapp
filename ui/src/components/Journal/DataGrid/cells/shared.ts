import React from "react";
import { InputProps } from "@material-ui/core";
import { AutocompleteProps } from "@material-ui/lab/Autocomplete";

export const inlineInputProps: InputProps = {
  margin: "dense",
};

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

export interface RowChangesProp<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  rowChanges?: Partial<Record<string, Partial<T>>>;
}
