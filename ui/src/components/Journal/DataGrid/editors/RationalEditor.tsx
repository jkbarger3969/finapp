import React from "react";
import { DataTypeProvider } from "@devexpress/dx-react-grid";
import { RationalInput } from "../../../Inputs/RationalInput";

export const RationalEditor = (
  props: DataTypeProvider.ValueEditorProps
): JSX.Element => {
  const { autoFocus, value, onBlur, onFocus } = props;

  return (
    <RationalInput
      autoFocus={autoFocus}
      defaultValue={value}
      onBlur={onBlur}
      onFocus={onFocus}
      size="small"
      margin="none"
    />
  );
};
