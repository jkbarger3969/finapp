import React from "react";
import { Box, Checkbox } from "@material-ui/core";
import { DataTypeProvider } from "@devexpress/dx-react-grid";

const style: React.CSSProperties = {
  padding: 0,
};

export const BoolEditor = (
  props: DataTypeProvider.ValueEditorProps
): JSX.Element => {
  const { value, onBlur, onFocus, autoFocus } = props;

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Checkbox
        style={style}
        size="medium"
        checked={value as boolean}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onFocus={onFocus}
        disableFocusRipple
      />
    </Box>
  );
};
