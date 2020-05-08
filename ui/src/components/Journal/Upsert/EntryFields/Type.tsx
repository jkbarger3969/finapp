import React, { useMemo } from "react";
import { useField, useFormikContext } from "formik";
import ToggleButtonGroup, {
  ToggleButtonGroupProps,
} from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { BankPlus, BankMinus } from "mdi-material-ui";
import {
  Tooltip,
  Box,
  FormControlLabel,
  FormControlLabelProps,
  FormControl,
  FormHelperText,
} from "@material-ui/core";
import { JournalEntryType } from "../../../../apollo/graphTypes";
import { useFormikStatus, FormikStatusType } from "../../../../formik/utils";

const NULLISH: unique symbol = Symbol();

const validate = (value?: JournalEntryType) => {
  if (((value ?? NULLISH) as any) === NULLISH) {
    return "Type Required";
  }
};

const Type = function (
  props: {
    label?: boolean | FormControlLabelProps["labelPlacement"];
  } & ToggleButtonGroupProps & { disabled?: boolean }
) {
  const { disabled: disabledFromProps = false } = props;

  const [formikStatus] = useFormikStatus();

  const { label = false } = props;

  const { isSubmitting } = useFormikContext();

  const [field, meta, helpers] = useField<JournalEntryType | null>({
    name: "type",
    validate,
  });

  const { error, touched } = meta;
  const { setValue, setTouched } = helpers;

  const toggleButtonGroupProps: ToggleButtonGroupProps = useMemo(
    () => ({
      size: "small",
      exclusive: true,
      disabled: isSubmitting,
      ...field,
      onChange: async (event, value: JournalEntryType) => {
        if (((value ?? NULLISH) as any) === NULLISH) {
          return;
        }

        setValue(value);
        await new Promise((resolve) => setTimeout(resolve, 0)); //Avoid pres
        setTouched(true);
      },
    }),
    [field, isSubmitting, setValue, setTouched]
  );

  const disabled =
    isSubmitting ||
    disabledFromProps ||
    formikStatus?.type === FormikStatusType.FATAL_ERROR;

  const control = useMemo(
    () => (
      <Box pl={1} clone>
        <ToggleButtonGroup {...(props as any)} {...toggleButtonGroupProps}>
          <ToggleButton disabled={disabled} value={JournalEntryType.Credit}>
            <Tooltip arrow placement="top" title="Credit">
              <BankPlus />
            </Tooltip>
          </ToggleButton>
          <ToggleButton disabled={disabled} value={JournalEntryType.Debit}>
            <Tooltip arrow placement="top" title="Debit">
              <BankMinus />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    ),
    [props, toggleButtonGroupProps, disabled]
  );

  if (label) {
    return (
      <FormControl>
        <FormControlLabel
          {...(props as any)}
          labelPlacement={typeof label === "boolean" ? undefined : label}
          control={control}
          label="Type"
        />
        {touched && !!error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    );
  }

  return (
    <FormControl>
      {control}
      {!!error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};

export default Type;
