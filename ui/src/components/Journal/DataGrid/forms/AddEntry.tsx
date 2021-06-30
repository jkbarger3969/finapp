import React, {
  forwardRef,
  Fragment,
  HTMLProps,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Grid,
  Box,
  Typography,
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
import { defaultInput, FreeSoloNode } from "mui-tree-select";
import human from "humanparser";
// import

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
import {
  inputGridContainerProps,
  preventDefaultEnter,
  removeNullishProperties,
} from "./shared";
import AddPersonFields, {
  AddPersonFieldsProps,
  AddPersonValues,
  initialValues as personIniValues,
  validate as validatePerson,
} from "./AddPersonFields";

export type AddEntryValues = {
  category: Exclude<CategoryInputProps["value"], CategoryInputOpt>;
  department: Exclude<DepartmentInputProps["value"], DepartmentInputOpt>;
  paymentMethod: Exclude<PaymentMethodInputProps["value"], PayMethodInputOpt>;
  source: Exclude<EntityInputProps["value"], EntityInputOpt>;
  total: Extract<RationalInputProps["value"], Fraction | null>;
  reconciled?: boolean;
  date: Date | null;
  dateOfRecord: Date | null;
} & AddPersonValues;

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
  defaultInput({
    ...params,
    required: true,
    variant: "filled",
    fullWidth: true,
  });

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

const AddEntryFormInner = (
  { children, ...rest }: PropsWithChildren<HTMLProps<HTMLFormElement>>,
  ref: React.Ref<HTMLFormElement>
) => {
  return (
    <form {...rest} ref={ref}>
      {children}
    </form>
  );
};
const AddEntryForm = forwardRef(AddEntryFormInner);

export const AddEntry = (props: AddEntryProps): JSX.Element => {
  const {
    department: departmentProp,
    paymentMethod: paymentMethodProp,
    ...rest
  } = props;

  const [state, setState] = useState<{
    exiting: boolean;
    fatalError?: Error;
  }>({
    exiting: false,
  });

  const submitter = useRef<HTMLButtonElement | null>(null);
  const addRef = useRef<HTMLButtonElement | null>(null);
  const addAndNewRef = useRef<HTMLButtonElement | null>(null);

  const formik = useFormik<AddEntryValues>({
    onSubmit: async (...args) => {
      console.log("onSubmit", args);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      submitter.current = null;
    },
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      category: null,
      department: null,
      paymentMethod: null,
      source: null,
      total: null,
      date: null,
      dateOfRecord: null,
      ...personIniValues,
    },
    validate: (values): FormikErrors<AddEntryValues> => {
      let errors: FormikErrors<AddEntryValues> = removeNullishProperties({
        category: values.category ? undefined : "Required",
        department: values.department ? undefined : "Required",
        paymentMethod: values.paymentMethod ? undefined : "Required",
        source: values.source ? undefined : "Required",
        date: validateDate(values.date, true),
        dateOfRecord: validateDate(values.dateOfRecord, false),
        total: values.total ? undefined : "Required",
      });

      if (
        formik.values.source instanceof FreeSoloNode &&
        formik.values.source.parent?.valueOf() === "Person"
      ) {
        errors = validatePerson(values, errors);
      }

      return errors;
    },
  });

  const {
    setFieldValue,
    setFieldTouched,
    setTouched,
    resetForm,
    handleSubmit,
  } = formik;

  const disableAll = formik.isSubmitting || state.exiting || !!state.fatalError;

  const handlePersonChange = useCallback<
    NonNullable<AddPersonFieldsProps["onChange"]>
  >(
    (event) => {
      if (
        !(
          formik.values.source instanceof FreeSoloNode ||
          formik.values.source?.parent?.valueOf() === "Person"
        )
      ) {
        return;
      }

      switch (event.target.name) {
        case "person.name.first":
          {
            const value = event.target.value ?? "";

            const attr = human.parseName(formik.values.source.toString());

            setFieldValue(
              "source",
              new FreeSoloNode(
                `${value} ${attr.lastName}`.trim(),
                formik.values.source.parent
              )
            );
          }

          break;

        case "person.name.last":
          {
            const value = event.target.value ?? "";

            const attr = human.parseName(formik.values.source.toString());

            setFieldValue(
              "source",
              new FreeSoloNode(
                `${attr.firstName} ${value}`.trim(),
                formik.values.source.parent
              )
            );
          }
          break;
      }
    },
    [formik.values.source, setFieldValue]
  );

  return (
    <Dialog
      {...rest}
      PaperProps={
        useMemo(
          () => ({
            component: AddEntryForm,
            onSubmit: handleSubmit,
          }),
          [handleSubmit]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any
      }
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
        resetForm();
        // Reset form state
        setState({
          exiting: false,
        });
      }, [resetForm])}
    >
      <DialogTitle>
        {state.fatalError ? "Fatal Error" : "Add Entry"}
      </DialogTitle>
      <DialogContent dividers onKeyDown={preventDefaultEnter}>
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
                helperText={
                  formik.touched.date ? formik.errors.date : undefined
                }
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
                error={
                  formik.touched.dateOfRecord && !!formik.errors.dateOfRecord
                }
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
              onChange={useCallback<
                NonNullable<CategoryInputProps["onChange"]>
              >((_, value) => setFieldValue("category", value), [
                setFieldValue,
              ])}
              onBlur={formik.handleBlur}
              value={formik.values.category}
              error={
                formik.touched.category ? formik.errors.category : undefined
              }
              renderInput={categoryRenderInput}
            />
          </Grid>
          <Grid {...inputGridContainerProps} justify="center" container>
            <DepartmentInput<false, false, false>
              fullWidth
              disabled={disableAll}
              root={departmentProp.root}
              onChange={useCallback<
                NonNullable<DepartmentInputProps["onChange"]>
              >((_, value) => setFieldValue("department", value), [
                setFieldValue,
              ])}
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
              onChange={useCallback<
                NonNullable<RationalInputProps["onChange"]>
              >((_, value) => setFieldValue("total", value), [setFieldValue])}
              onBlur={formik.handleBlur}
              value={formik.values.total}
              disabled={disableAll}
              error={formik.touched.total && !!formik.errors.total}
              helperText={
                formik.touched.total ? formik.errors.total : undefined
              }
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
                    () =>
                      setFieldValue("reconciled", !formik.values.reconciled),
                    [formik.values.reconciled, setFieldValue]
                  )}
                  checked={!!formik.values.reconciled}
                />
              }
            />
          </Grid>
        </Grid>
        {formik.values.source instanceof FreeSoloNode &&
          formik.values.source.parent?.valueOf() === "Person" && (
            <Fragment>
              <Box pt={2} component="div" />
              <Typography color="textSecondary" variant="h6">
                Add Person
              </Typography>
              <AddPersonFields
                onChange={handlePersonChange}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formik={formik as any}
                disabled={disableAll}
              />
            </Fragment>
          )}

        {!!state.fatalError && (
          <DialogContentText>{state.fatalError?.message}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <AsyncButton
          ref={addRef}
          color="primary"
          showProgress={
            formik.isSubmitting &&
            (submitter.current === null || submitter.current === addRef.current)
          }
          disabled={disableAll}
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={useCallback(() => {
            submitter.current = addRef.current;
          }, [])}
        >
          Add
        </AsyncButton>
        <AsyncButton
          ref={addAndNewRef}
          color="primary"
          showProgress={
            formik.isSubmitting &&
            !!submitter.current &&
            submitter.current === addAndNewRef.current
          }
          disabled={disableAll}
          type="submit"
          variant="outlined"
          startIcon={<QueueIcon />}
          onClick={useCallback(() => {
            setTouched({}, true);
            submitter.current = addAndNewRef.current;
          }, [])}
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
