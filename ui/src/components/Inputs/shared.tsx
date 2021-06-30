import { QueryHookOptions as QueryHookOptionsApollo } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import {
  TreeSelectProps,
  mergeInputEndAdornment,
  defaultInput,
} from "mui-tree-select";
import React, { useCallback } from "react";
import { useFormContext } from "react-hook-form";

export type QueryHookOptions = Omit<QueryHookOptionsApollo, "variables">;

const BLANK_OPTIONS: unknown[] = [];
export const LoadingDefaultBlank = ({
  // grab all props effecting appearance and discard rest.
  renderInput = defaultInput,
  classes,
  closeIcon,
  forcePopupIcon,
  fullWidth,
  popupIcon,
  size,
  name,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...discard
}: (
  | // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AutocompleteProps<any, true | false, true | false, true | false>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | TreeSelectProps<any, any, true | false, true | false, true | false>
) & {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Record<string, any>): JSX.Element => {
  // Register name and hold form via "required" umount
  const { register } = useFormContext();
  register(name, { required: true, shouldUnregister: true });

  return (
    <Autocomplete
      classes={classes}
      closeIcon={closeIcon}
      forcePopupIcon={forcePopupIcon}
      fullWidth={fullWidth}
      popupIcon={popupIcon}
      size={size}
      defaultValue={undefined}
      value={null}
      inputValue=""
      disabled
      options={BLANK_OPTIONS}
      renderInput={useCallback<
        AutocompleteProps<
          unknown,
          undefined,
          undefined,
          undefined
        >["renderInput"]
      >(
        (params) =>
          renderInput({
            ...params,
            name,
            InputProps: mergeInputEndAdornment(
              "append",
              <CircularProgress size={20} color="inherit" />,
              params.InputProps
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any),
        [renderInput, name]
      )}
    />
  );
};
