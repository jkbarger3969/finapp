import React, { useCallback, useState } from "react";
import { FormikErrors, useFormik } from "formik";
import {
  Checkbox,
  CheckboxProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  DialogProps,
  DialogContentText,
} from "@material-ui/core";
import { Add as AddIcon, Queue as QueueIcon } from "@material-ui/icons";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Fraction from "fraction.js";
import { isValid as isValidDate } from "date-fns";
import { defaultInput } from "mui-tree-select";

import { AsyncButton } from "../../../utils/AsyncButton";
import {
  CategoryInput,
  CategoryInputProps,
  CategoryInputOpt,
} from "../../../Inputs/Category";
import {
  DepartmentInput,
  DepartmentInputProps,
  DepartmentInputOpt,
} from "../../../Inputs/Department";
import {
  PaymentMethodInput,
  PaymentMethodInputProps,
  PayMethodInputOpt,
} from "../../../Inputs/PaymentMethod";
import {
  EntityInput,
  EntityInputProps,
  EntityInputOpt,
} from "../../../Inputs/Entity";
import {
  RationalInput,
  RationalInputProps,
} from "../../../Inputs/RationalInput";
import { preventDefaultFormSubmit } from "./shared";

export type AddEntryValues = {
  category: Exclude<CategoryInputProps["value"], CategoryInputOpt>;
  department: Exclude<DepartmentInputProps["value"], DepartmentInputOpt>;
  paymentMethod: Exclude<PaymentMethodInputProps["value"], PayMethodInputOpt>;
  source: Exclude<EntityInputProps["value"], EntityInputOpt>;
  total: Extract<RationalInputProps["value"], Fraction | null>;
  reconciled?: boolean;
  date: Date | null;
  dateOfRecord: Date | null;
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
  margin: "dense",
  placeholder: "mm/dd/yyyy",
  size: "medium",
  variant: "inline",
};

const dialogPaperProps = {
  component: "form",
  onSubmit: preventDefaultFormSubmit,
};

const validateDate = (
  date: Date | null,
  required: boolean
): string | undefined => {
  if (!date) {
    return required ? "Required" : undefined;
  } else if (!isValidDate(date)) {
    return "Invalid Date";
  } else if (date > new Date()) {
    return "Date cannot be in the future.";
  }
};

const defaultRenderInput: typeof defaultInput = (params) =>
  defaultInput({ ...params, required: true, variant: "filled" });

const categoryRenderInput: typeof defaultInput = (params) =>
  defaultRenderInput({
    ...params,
    label: "Category",
  });

const deptRenderInput: typeof defaultInput = (params) =>
  defaultRenderInput({
    ...params,
    label: "Department",
  });

const payMethodRenderInput: typeof defaultInput = (params) =>
  defaultRenderInput({
    ...params,
    label: "Payment Method",
  });

const sourceRenderInput: typeof defaultInput = (params) =>
  defaultRenderInput({
    ...params,
    label: "Source",
  });

export type AddEntryProps = {
  department: Pick<DepartmentInputProps, "root">;
  paymentMethod: Pick<PaymentMethodInputProps, "accounts">;
} & Pick<DialogProps, "open" | "fullWidth" | "maxWidth"> & {
    onClose: () => void;
  };

export const AddEntry = (props: AddEntryProps): JSX.Element => {
  const {
    department: departmentProp,
    paymentMethod: paymentMethodProp,
    ...rest
  } = props;

  const [state, setState] = useState<{
    exiting: boolean;
    fatalError?: Error;
    submittedWith?: "add" | "addAndNew";
  }>({
    exiting: false,
  });

  const formik = useFormik<AddEntryValues>({
    onSubmit: async (...args) => {
      console.log(args);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
    initialValues: {
      category: null,
      department: null,
      paymentMethod: null,
      source: null,
      total: null,
      date: null,
      dateOfRecord: null,
    },
    validate: (values): FormikErrors<AddEntryValues> => ({
      category: values.category ? undefined : "Required",
      department: values.department ? undefined : "Required",
      paymentMethod: values.paymentMethod ? undefined : "Required",
      source: values.source ? undefined : "Required",
      date: validateDate(values.date, true),
      dateOfRecord: validateDate(values.dateOfRecord, false),
    }),
  });

  const disableAll = formik.isSubmitting || state.exiting || !!state.fatalError;

  const onSubmit = useCallback(async () => {
    console.log("Submitting form.");
    try {
      await formik.submitForm();
    } catch (err) {
      setState((state) => ({
        ...state,
        fatalError: err,
      }));
      throw err;
    }
  }, [formik.submitForm]);

  return (
    <Dialog
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PaperProps={dialogPaperProps as any}
      disableBackdropClick={formik.isSubmitting}
      disableEscapeKeyDown={formik.isSubmitting}
      onExit={useCallback<NonNullable<DialogProps["onExit"]>>(
        () =>
          setState((state) => ({
            ...state,
            exiting: true,
          })),
        []
      )}
      onExited={useCallback<NonNullable<DialogProps["onExited"]>>(() => {
        formik.resetForm();
        // Reset form state
        setState({
          exiting: false,
        });
      }, [formik.resetForm])}
    >
      <DialogTitle>
        {state.fatalError ? "Fatal Error" : "Add Entry"}
      </DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            {...dateStaticProps}
            label="Date"
            disabled={disableAll}
            required
            name="date"
            value={formik.values.date}
            onChange={useCallback<KeyboardDatePickerProps["onChange"]>(
              (date) => formik.setFieldValue("date", date),
              [formik.setFieldValue]
            )}
            error={formik.touched.date && !!formik.errors.date}
            helperText={formik.touched.date ? formik.errors.date : undefined}
          />
        </MuiPickersUtilsProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            {...dateStaticProps}
            label="Date Of Record"
            disabled={disableAll}
            name="dateOfRecord"
            value={formik.values.dateOfRecord}
            onChange={useCallback<KeyboardDatePickerProps["onChange"]>(
              (date) => formik.setFieldValue("dateOfRecord", date),
              [formik.setFieldValue]
            )}
            error={formik.touched.dateOfRecord && !!formik.errors.dateOfRecord}
            helperText={
              formik.touched.dateOfRecord
                ? formik.errors.dateOfRecord
                : undefined
            }
          />
        </MuiPickersUtilsProvider>
        <CategoryInput<false, false, false>
          disabled={disableAll}
          onChange={useCallback<NonNullable<CategoryInputProps["onChange"]>>(
            (_, value) => formik.setFieldValue("category", value),
            [formik.setFieldValue]
          )}
          value={formik.values.category}
          error={formik.touched.category ? formik.errors.category : undefined}
          renderInput={categoryRenderInput}
        />
        <DepartmentInput<false, false, false>
          disabled={disableAll}
          root={departmentProp.root}
          onChange={useCallback<NonNullable<DepartmentInputProps["onChange"]>>(
            (_, value) => formik.setFieldValue("department", value),
            [formik.setFieldValue]
          )}
          value={formik.values.department}
          error={
            formik.touched.department ? formik.errors.department : undefined
          }
          renderInput={deptRenderInput}
        />
        <PaymentMethodInput<false, false>
          disabled={disableAll}
          isRefund={false}
          accounts={paymentMethodProp.accounts}
          onChange={useCallback<
            NonNullable<PaymentMethodInputProps["onChange"]>
          >((_, value) => formik.setFieldValue("paymentMethod", value), [
            formik.setFieldValue,
          ])}
          value={formik.values.paymentMethod}
          error={
            formik.touched.paymentMethod
              ? formik.errors.paymentMethod
              : undefined
          }
          entryType={formik.values.category?.valueOf().type ?? null}
          renderInput={payMethodRenderInput}
        />
        <EntityInput
          disabled={disableAll}
          allowNewBusiness
          allowNewPerson
          name="source"
          onChange={useCallback<NonNullable<EntityInputProps["onChange"]>>(
            (_, value) => formik.setFieldValue("source", value),
            [formik.setFieldValue]
          )}
          value={formik.values.source}
          error={formik.touched.source ? formik.errors.source : undefined}
          renderInput={sourceRenderInput}
        />
        <RationalInput
          {...totalStaticProps}
          onChange={useCallback<NonNullable<RationalInputProps["onChange"]>>(
            (_, value) => formik.setFieldValue("total", value),
            [formik.setFieldValue]
          )}
          value={formik.values.total}
          disabled={disableAll}
          error={formik.touched.total && !!formik.errors.total}
          helperText={formik.touched.total ? formik.errors.total : undefined}
        />
        <FormControlLabel
          label="Reconciled"
          control={
            <Checkbox
              disabled={disableAll}
              name="reconciled"
              onChange={useCallback<NonNullable<CheckboxProps["onChange"]>>(
                () =>
                  formik.setFieldValue("reconciled", !formik.values.reconciled),
                [formik.values.reconciled, formik.setFieldValue]
              )}
              checked={!!formik.values.reconciled}
            />
          }
        />

        {!!state.fatalError && (
          <DialogContentText>{state.fatalError?.message}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <AsyncButton
          color="primary"
          showProgress={formik.isSubmitting && state.submittedWith === "add"}
          disabled={disableAll}
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={useCallback(async () => {
            await onSubmit();

            props.onClose();
          }, [onSubmit, props.onClose])}
        >
          Add
        </AsyncButton>
        <AsyncButton
          color="primary"
          showProgress={
            formik.isSubmitting && state.submittedWith === "addAndNew"
          }
          disabled={disableAll}
          type="submit"
          variant="outlined"
          startIcon={<QueueIcon />}
          onClick={useCallback(async () => {
            console.log("Add & New");
            await onSubmit();
            formik.resetForm();
          }, [onSubmit, formik.resetForm, props.onClose])}
        >
          Add & New
        </AsyncButton>
        <Button
          disabled={formik.isSubmitting}
          variant="text"
          onClick={props.onClose}
        >
          {state.fatalError ? "Ok" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
