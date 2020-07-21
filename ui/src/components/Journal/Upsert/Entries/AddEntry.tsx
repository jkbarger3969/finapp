import React, { useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  Box,
  DialogContent,
  DialogContentText,
  PaperProps,
  Grid,
  DialogActions,
  Button,
  useTheme,
  GridProps,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Queue as QueueIcon,
} from "@material-ui/icons";
import { Formik, FormikConfig, FormikProps, useFormikContext } from "formik";
import { useApolloClient, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import {
  DeptIniValueForAddEntryQuery as DeptIniValueForAddEntry,
  DeptIniValueForAddEntryQueryVariables as DeptIniValueForAddEntryVars,
} from "../../../../apollo/graphTypes";
import submitAdd, { AddValues } from "./submitAdd";
import {
  FormikStatusType,
  FormikStatus,
  useFormikStatus,
} from "../../../../formik/utils";
import { DEPT_ENTRY_OPT_FRAGMENT } from "../upsertEntry.gql";
import OverlayLoading from "../../../utils/OverlayLoading";
import Overlay from "../../../utils/Overlay";
import DateEntry from "../EntryFields/DateEntry";
import Description from "../EntryFields/Description";
import Total from "../EntryFields/Total";
import Reconcile from "../EntryFields/Reconcile";
import PaymentMethod from "../EntryFields/PaymentMethod";
import Category from "../EntryFields/Category";
import Department from "../EntryFields/Department";
import Source from "../EntryFields/Source";
import Type from "../EntryFields/Type";

export interface AddEntryProps {
  deptId?: string | null;
  open: boolean;
  onClose: () => void;
}

const gridEntryResponsiveProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;

const DEPT_INI_VALUE = gql`
  query DeptIniValueForAddEntry($id: ID!) {
    department(id: $id) {
      ...DeptEntryOptFragment
    }
  }
  ${DEPT_ENTRY_OPT_FRAGMENT}
`;

const AddEntryDialog = (
  props: AddEntryProps & {
    loading: boolean;
  }
) => {
  const { open, onClose, loading } = props;

  const { resetForm, isSubmitting, isValid, submitForm } = useFormikContext<
    AddValues
  >();

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const [generalError, fatalError] = useMemo<
    [string | null, boolean | null]
  >(() => {
    if (
      formikStatus &&
      (formikStatus.type === FormikStatusType.FATAL_ERROR ||
        formikStatus.type === FormikStatusType.ERROR)
    ) {
      return [
        formikStatus.msg,
        formikStatus.type === FormikStatusType.FATAL_ERROR,
      ];
    }
    return [null, null];
  }, [formikStatus]);

  const onExited = useCallback(() => {
    resetForm();
    setFormikStatus(null);
  }, [resetForm, setFormikStatus]);

  const title = useMemo<string>(() => {
    if (fatalError) {
      return "Fatal Error";
    } else if (isSubmitting) {
      return "Submitting Add Entry...";
    } else if (loading) {
      return "Loading Add Entry...";
    }
    return "Add Entry";
  }, [fatalError, isSubmitting, loading]);

  const theme = useTheme();

  const onClickAdd = useCallback(async () => {
    try {
      setFormikStatus(null);
      await submitForm();
      onClose();
    } catch (error) {
      setFormikStatus({
        msg: error.message ?? `${error}`,
        type: FormikStatusType.ERROR,
      } as FormikStatus);
    }
  }, [submitForm, onClose, setFormikStatus]);

  const onClickAddAndNew = useCallback(async () => {
    try {
      setFormikStatus(null);
      await submitForm();
      resetForm();
    } catch (error) {
      setFormikStatus({
        msg: error.message ?? `${error}`,
        type: FormikStatusType.ERROR,
      } as FormikStatus);
    }
  }, [submitForm, resetForm, setFormikStatus]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => event.preventDefault(),
    []
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      fullWidth
      maxWidth="lg"
      PaperProps={
        {
          component: "form",
          onSubmit: handleSubmit,
        } as PaperProps & { onSubmit: FormikProps<AddValues>["handleSubmit"] }
      }
    >
      <DialogTitle
        style={generalError ? { color: theme.palette.error.main } : undefined}
      >
        {title}
      </DialogTitle>
      <Box position="relative">
        {(isSubmitting || loading) && !generalError && (
          <OverlayLoading zIndex="modal" />
        )}
        {!!generalError && fatalError && (
          <Overlay opacity={0.78} zIndex="modal" padding={2}>
            <DialogContentText color="error">{generalError}</DialogContentText>
          </Overlay>
        )}
        <DialogContent dividers>
          {!!generalError && !fatalError && (
            <DialogContentText color="error">{generalError}</DialogContentText>
          )}
          <Grid container spacing={2}>
            <Grid {...gridEntryResponsiveProps} justify="center" container>
              <Type
                style={{ margin: theme.spacing(1) }}
                label="start"
                disabled={loading || isSubmitting || !!fatalError}
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <DateEntry
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Source
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Category
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
                required
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Department
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
                required
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Description
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <PaymentMethod
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Total
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid
              container
              justify="center"
              alignItems="flex-start"
              {...gridEntryResponsiveProps}
            >
              <Reconcile
                disabled={loading || isSubmitting || !!fatalError}
                label
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
      <DialogActions>
        {!fatalError && (
          <React.Fragment>
            <Button
              onClick={onClickAdd}
              disabled={loading || isSubmitting || !isValid}
              type="submit"
              startIcon={<AddIcon />}
              color="primary"
              variant="contained"
            >
              Add
            </Button>
            <Button
              onClick={onClickAddAndNew}
              disabled={loading || isSubmitting || !isValid}
              type="submit"
              startIcon={<QueueIcon />}
              variant="outlined"
            >
              Add & New
            </Button>
          </React.Fragment>
        )}
        <Button
          disabled={isSubmitting}
          color={fatalError ? "primary" : "default"}
          startIcon={!fatalError && <CancelIcon />}
          onClick={onClose}
        >
          {fatalError ? "Ok" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AddEntry = (props: AddEntryProps) => {
  const { open, onClose, deptId } = props;

  const { loading, error, data } = useQuery<
    DeptIniValueForAddEntry,
    DeptIniValueForAddEntryVars
  >(DEPT_INI_VALUE, {
    skip: !deptId,
    variables: {
      id: deptId as string,
    },
  });

  const department = data?.department;
  const initialValues = useMemo<Partial<AddValues>>(
    () => (department ? { department } : {}),
    [department]
  );
  const initialStatus = useMemo<FormikStatus | null>(
    () =>
      error ? { msg: error.message, type: FormikStatusType.FATAL_ERROR } : null,
    [error]
  );

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<AddValues>["onSubmit"]>(
    (values, formikHelpers) => submitAdd(client, values, formikHelpers),
    [client]
  );

  const children = useCallback(
    (props: FormikProps<AddValues>) => (
      <AddEntryDialog open={open} onClose={onClose} loading={loading} />
    ),
    [open, onClose, loading]
  );

  return (
    <Formik
      initialValues={initialValues as AddValues}
      initialStatus={initialStatus}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {children}
    </Formik>
  );
};

export default AddEntry;
