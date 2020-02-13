import React, { useMemo } from "react";
import { useField, useFormikContext } from "formik";
import ToggleButtonGroup, {
  ToggleButtonGroupProps
} from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { BankPlus, BankMinus } from "mdi-material-ui";
import {
  Tooltip,
  Box,
  FormControlLabel,
  FormControlLabelProps
} from "@material-ui/core";
import { JournalEntryType } from "../../../../apollo/graphTypes";

const Type = function(
  props: {
    label?: boolean | FormControlLabelProps["labelPlacement"];
  } & ToggleButtonGroupProps
) {
  const { label = false } = props;

  const { isSubmitting } = useFormikContext();

  const [field, meta, helpers] = useField<JournalEntryType | null>({
    name: "type"
  });

  const { error } = meta;

  const { setValue, setTouched } = helpers;

  const toggleButtonGroupProps: ToggleButtonGroupProps = useMemo(
    () => ({
      size: "small",
      exclusive: true,
      disabled: isSubmitting,
      ...field,
      onChange: (event, value: JournalEntryType) => {
        setValue(value);
        setTouched(true);
      }
    }),
    [field, isSubmitting, setValue, setTouched]
  );

  const control = useMemo(
    () => (
      <Box pl={1} clone>
        <ToggleButtonGroup {...(props as any)} {...toggleButtonGroupProps}>
          <ToggleButton value={JournalEntryType.Credit}>
            <Tooltip arrow placement="top" title="Credit">
              <BankPlus />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={JournalEntryType.Debit}>
            <Tooltip arrow placement="top" title="Debit">
              <BankMinus />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    ),
    [toggleButtonGroupProps, props]
  );

  if (label) {
    return (
      <FormControlLabel
        {...(props as any)}
        labelPlacement={typeof label === "boolean" ? undefined : label}
        control={control}
        label="Type"
      />
    );
  }

  return control;
};

export default Type;
