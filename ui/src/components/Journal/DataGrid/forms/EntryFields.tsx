import React from "react";
import { Checkbox, FormControlLabel, Grid } from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useFormContext } from "react-hook-form";
import Fraction from "fraction.js";

import { CategoryInput, CategoryInputProps } from "../../../Inputs/Category";
import {
  DepartmentInput,
  DepartmentInputProps,
} from "../../../Inputs/Department";
import {
  PaymentMethodInput,
  PaymentMethodInputProps,
} from "../../../Inputs/PaymentMethod";
import { EntityInput, EntityInputProps } from "../../../Inputs/Entity";
import {
  RationalInput,
  RationalInputProps,
} from "../../../Inputs/RationalInput";
import { inputGridContainerProps } from "./shared";

export type EntryValues = {
  entry: {
    category?: CategoryInputProps["value"];
    department?: DepartmentInputProps["value"];
    paymentMethod?: PaymentMethodInputProps["value"];
    source?: EntityInputProps["value"];
    total?: Extract<RationalInputProps["value"], Fraction | null>;
    reconciled?: boolean;
    date?: Date | null;
    dateOfRecord?: Date | null;
  };
};

const totalStaticProps: RationalInputProps = {
  label: "Total",
  fullWidth: true,
  required: true,
  name: "total",
  variant: "filled",
  InputProps: {
    type: "number",
    startAdornment: "$",
  },
  inputProps: {
    type: "number",
    min: "0.01",
    step: "0.01",
  },
};

const dateStaticProps: Partial<KeyboardDatePickerProps> = {
  autoOk: true,
  disableFuture: true,
  disableToolbar: true,
  format: "MM/dd/yyyy",
  fullWidth: true,
  inputVariant: "filled",
  placeholder: "mm/dd/yyyy",
  size: "medium",
  variant: "inline",
};

export const EntryFields = (props, ref) => {
  const { register } = useFormContext<EntryValues>();

  return (
    <Grid container spacing={2}>
      <Grid {...inputGridContainerProps} justify="center" container>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            {...dateStaticProps}
            label="Date"
            disabled={disableAll}
            required
            name="date"
            value={formik.values.date}
            onChange={useCallback<KeyboardDatePickerProps["onChange"]>(
              (date) => setFieldValue("date", date),
              [setFieldValue]
            )}
            onBlur={formik.handleBlur}
            error={formik.touched.date && !!formik.errors.date}
            helperText={formik.touched.date ? formik.errors.date : undefined}
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            {...dateStaticProps}
            label="Date Of Record"
            disabled={disableAll}
            name="dateOfRecord"
            value={formik.values.dateOfRecord || formik.values.date}
            onChange={useCallback<KeyboardDatePickerProps["onChange"]>(
              (date) => setFieldValue("dateOfRecord", date),
              [setFieldValue]
            )}
            onBlur={formik.handleBlur}
            error={formik.touched.dateOfRecord && !!formik.errors.dateOfRecord}
            helperText={
              formik.touched.dateOfRecord
                ? formik.errors.dateOfRecord
                : undefined
            }
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <CategoryInput<false, false, false>
          fullWidth
          disabled={disableAll}
          onChange={useCallback<NonNullable<CategoryInputProps["onChange"]>>(
            (_, value) => setFieldValue("category", value),
            [setFieldValue]
          )}
          onBlur={formik.handleBlur}
          value={formik.values.category}
          error={formik.touched.category ? formik.errors.category : undefined}
          renderInput={categoryRenderInput}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <DepartmentInput<false, false, false>
          fullWidth
          disabled={disableAll}
          root={departmentProp.root}
          onChange={useCallback<NonNullable<DepartmentInputProps["onChange"]>>(
            (_, value) => setFieldValue("department", value),
            [setFieldValue]
          )}
          onBlur={formik.handleBlur}
          value={formik.values.department}
          error={
            formik.touched.department ? formik.errors.department : undefined
          }
          renderInput={deptRenderInput}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <PaymentMethodInput<false, false>
          fullWidth
          disabled={disableAll}
          isRefund={false}
          accounts={paymentMethodProp.accounts}
          onBlur={formik.handleBlur}
          onChange={useCallback<
            NonNullable<PaymentMethodInputProps["onChange"]>
          >(
            (_, value) => setFieldValue("paymentMethod", value),

            [setFieldValue]
          )}
          value={formik.values.paymentMethod}
          error={
            formik.touched.paymentMethod
              ? formik.errors.paymentMethod
              : undefined
          }
          entryType={formik.values.category?.valueOf().type ?? null}
          renderInput={payMethodRenderInput}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <EntityInput
          fullWidth
          disabled={disableAll}
          allowNewBusiness
          allowNewPerson
          name="source"
          onChange={useCallback<NonNullable<EntityInputProps["onChange"]>>(
            (_, value) => {
              setFieldValue("source", value);
              if (
                value instanceof FreeSoloNode &&
                value.parent?.valueOf() === "Person"
              ) {
                const attrs = human.parseName(value.toString());

                if (attrs.firstName) {
                  setFieldValue("person.name.first", attrs.firstName);
                }

                if (attrs.lastName) {
                  setFieldValue("person.name.last", attrs.lastName);
                }
              } else if (formik.values.person) {
                // Reset person
                setFieldValue("person", personIniValues);
                setFieldTouched("person.name.first", false, false);
                setFieldTouched("person.name.last", false, false);
                setFieldTouched("person.email", false, false);
                setFieldTouched("person.phone", false, false);
              }
            },
            [formik.values.person, setFieldTouched, setFieldValue]
          )}
          onBlur={formik.handleBlur}
          value={formik.values.source}
          error={formik.touched.source ? formik.errors.source : undefined}
          renderInput={sourceRenderInput}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <RationalInput
          {...totalStaticProps}
          onChange={useCallback<NonNullable<RationalInputProps["onChange"]>>(
            (_, value) => setFieldValue("total", value),
            [setFieldValue]
          )}
          onBlur={formik.handleBlur}
          value={formik.values.total}
          disabled={disableAll}
          error={formik.touched.total && !!formik.errors.total}
          helperText={formik.touched.total ? formik.errors.total : undefined}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <FormControlLabel
          label="Reconciled"
          control={
            <Checkbox
              disabled={disableAll}
              name="reconciled"
              onChange={useCallback<NonNullable<CheckboxProps["onChange"]>>(
                () => setFieldValue("reconciled", !formik.values.reconciled),
                [formik.values.reconciled, setFieldValue]
              )}
              checked={!!formik.values.reconciled}
            />
          }
        />
      </Grid>
    </Grid>
  );
};
