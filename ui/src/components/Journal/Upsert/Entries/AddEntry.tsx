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
import { Add as AddIcon, Cancel as CancelIcon } from "@material-ui/icons";
import { Formik, FormikConfig, FormikProps, useFormikContext } from "formik";
import { useApolloClient } from "@apollo/react-hooks";

import submitAdd, { AddValues } from "./submitAdd";
import {
  FormikStatusType,
  FormikStatus,
  useFormikStatus,
} from "../../../../formik/utils";
import OverlayLoading from "../../../Utils/OverlayLoading";
import Overlay from "../../../Utils/Overlay";
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
  open: boolean;
  onClose: () => void;
}

const gridEntryResponsiveProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;

const AddEntryDialog = (
  props: AddEntryProps & {
    handleSubmit: FormikProps<AddValues>["handleSubmit"];
  }
) => {
  const { open, onClose, handleSubmit } = props;

  const { resetForm, isSubmitting, isValid } = useFormikContext<AddValues>();

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
      return "Submitting Add Entry";
    }
    return "Add Entry";
  }, [fatalError, isSubmitting]);

  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
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
        {isSubmitting && !generalError && <OverlayLoading zIndex="modal" />}
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
                disabled={isSubmitting}
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <DateEntry disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Source disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Category disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Department disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Description disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <PaymentMethod disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Total disabled={isSubmitting} fullWidth />
            </Grid>
            <Grid
              container
              justify="center"
              alignItems="flex-start"
              {...gridEntryResponsiveProps}
            >
              <Reconcile disabled={isSubmitting} label />
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
      <DialogActions>
        {!fatalError && (
          <Button
            disabled={isSubmitting || !isValid}
            type="submit"
            startIcon={<AddIcon />}
            color="primary"
            variant="contained"
          >
            Add
          </Button>
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
  const { open, onClose } = props;

  const initialValues = useMemo<Partial<AddValues>>(() => ({}), []);

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<AddValues>["onSubmit"]>(
    async (values, formikHelpers) => {
      try {
        formikHelpers.setStatus(null);
        await submitAdd(client, values, formikHelpers);
        onClose();
      } catch (error) {
        formikHelpers.setStatus({
          msg: error.message ?? `${error}`,
          type: FormikStatusType.ERROR,
        } as FormikStatus);
      }
    },
    [client, onClose]
  );

  const children = useCallback(
    (props: FormikProps<AddValues>) => (
      <AddEntryDialog
        open={open}
        onClose={onClose}
        handleSubmit={props.handleSubmit}
      />
    ),
    [open, onClose]
  );

  return (
    <Formik
      initialValues={initialValues as AddValues}
      initialStatus={null}
      // isInitialValid={false}
      enableReinitialize={true}
      onSubmit={onSubmit}
      children={children}
    />
  );
};

export default AddEntry;
