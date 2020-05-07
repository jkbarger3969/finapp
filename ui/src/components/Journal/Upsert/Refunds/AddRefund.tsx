import React, { useCallback, useMemo } from "react";
import { Formik, FormikConfig, useFormikContext, FormikProps } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  PaperProps,
  Grid,
  DialogContentText,
  useTheme,
  Box,
} from "@material-ui/core";
import {
  useApolloClient,
  useQuery,
  QueryHookOptions,
} from "@apollo/react-hooks";
import { Add as AddIcon, Cancel as CancelIcon } from "@material-ui/icons";
import gql from "graphql-tag";

import submitAdd, { AddValues } from "./submitAdd";
import {
  GetEntryRefundInfo_1Query as GetEntryRefundInfo,
  GetEntryRefundInfo_1QueryVariables as GetEntryRefundInfoVars,
  JournalEntryType,
} from "../../../../apollo/graphTypes";
import DateEntry from "../EntryFields/DateEntry";
import Description from "../EntryFields/Description";
import Total from "../EntryFields/Total";
import Reconcile from "../EntryFields/Reconcile";
import PaymentMethod from "../EntryFields/PaymentMethod";
import {
  FormikStatusType,
  useFormikStatus,
  FormikStatus,
} from "../../../../formik/utils";
import OverlayLoading from "../../../Utils/OverlayLoading";
import Overlay from "../../../Utils/Overlay";
import { JOURNAL_FRAGMENT } from "./refunds.gql";

const GET_ENTRY_REFUND_INFO = gql`
  query GetEntryRefundInfo_1($id: ID!) {
    journalEntry(id: $id) {
      ...JournalEntry_2Fragment
    }
  }
  ${JOURNAL_FRAGMENT}
`;

const NULLISH = Symbol();

export interface AddRefundProps {
  entryId: string | null;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}

// Must be in separate component to access FormikContext.
const AddRefundDialog = (
  props: AddRefundProps & {
    handleSubmit: FormikProps<AddValues>["handleSubmit"];
  }
) => {
  const { entryId, open, onClose, onExited: onExitedCb, handleSubmit } = props;

  const { resetForm, isSubmitting, isValid } = useFormikContext<AddValues>();

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const onError = useCallback<
    NonNullable<
      QueryHookOptions<GetEntryRefundInfo, GetEntryRefundInfoVars>["onError"]
    >
  >(
    (error) =>
      setFormikStatus({
        msg: error.message,
        type: FormikStatusType.FATAL_ERROR,
      }),
    [setFormikStatus]
  );

  const { loading, error, data } = useQuery<
    GetEntryRefundInfo,
    GetEntryRefundInfoVars
  >(GET_ENTRY_REFUND_INFO, {
    skip: !entryId,
    variables: { id: entryId as string },
    onError,
  });

  const total = data?.journalEntry?.total;
  const refunds = data?.journalEntry?.refunds || [];
  const maxTotal = useMemo(() => {
    if (total) {
      const totalRefunds = refunds.reduce(
        (totalRefunds, { deleted, total }) =>
          deleted ? totalRefunds : totalRefunds + total.num / total.den,
        0
      );
      return total.num / total.den - totalRefunds;
    }
    return Number.MAX_SAFE_INTEGER;
  }, [total, refunds]);

  const date = data?.journalEntry?.date;
  const minDate = useMemo<Date | undefined>(
    () => (date ? new Date(date) : undefined),
    [date]
  );

  const onExited = useCallback(() => {
    onExitedCb();
    resetForm();
    setFormikStatus(null);
  }, [resetForm, onExitedCb, setFormikStatus]);

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

  const journalEntryType = data?.journalEntry?.type;
  const title = useMemo(() => {
    const title =
      !loading && !error && (journalEntryType ?? NULLISH) !== NULLISH
        ? `${
            journalEntryType === JournalEntryType.Credit ? "Give" : "Add"
          } Refund`
        : "Refund";

    if (fatalError) {
      return "Fatal Error";
    } else if (loading) {
      return `Loading ${title}...`;
    } else if (isSubmitting) {
      return `Submitting ${title}`;
    }
    return title;
  }, [loading, error, journalEntryType, fatalError, isSubmitting]);

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
        {(loading || isSubmitting) && !generalError && (
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
            <Grid item lg={4} sm={6} xs={12}>
              <DateEntry
                minDate={minDate}
                disabled={loading || isSubmitting}
                fullWidth
              />
            </Grid>
            <Grid item lg={4} sm={6} xs={12}>
              <Description disabled={loading || isSubmitting} fullWidth />
            </Grid>
            <Grid item lg={4} sm={6} xs={12}>
              <PaymentMethod disabled={loading || isSubmitting} fullWidth />
            </Grid>
            <Grid item lg={4} sm={6} xs={12}>
              <Total
                disabled={loading || isSubmitting}
                fullWidth
                maxTotal={maxTotal}
              />
            </Grid>
            <Grid
              item
              container
              justify="center"
              alignItems="flex-start"
              lg={4}
              md={6}
              sm={12}
            >
              <Reconcile disabled={loading || isSubmitting} label />
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
      <DialogActions>
        {!fatalError && (
          <Button
            disabled={loading || isSubmitting || !isValid}
            type="submit"
            startIcon={<AddIcon />}
            color="primary"
            variant="contained"
          >
            Add
          </Button>
        )}
        <Button
          disabled={loading || isSubmitting}
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

const AddRefund = (props: AddRefundProps) => {
  const { entryId, open, onClose, onExited } = props;

  const initialValues = useMemo<Partial<AddValues>>(() => ({}), []);

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<AddValues>["onSubmit"]>(
    async (values, formikHelpers) => {
      try {
        formikHelpers.setStatus(null);
        await submitAdd(client, entryId || "", values, formikHelpers);
        onClose();
      } catch (error) {
        formikHelpers.setStatus({
          msg: error.message ?? `${error}`,
          type: FormikStatusType.ERROR,
        } as FormikStatus);
      }
    },
    [client, entryId, onClose]
  );

  const children = useCallback(
    (props: FormikProps<AddValues>) => (
      <AddRefundDialog
        entryId={entryId}
        open={open}
        onClose={onClose}
        onExited={onExited}
        handleSubmit={props.handleSubmit}
      />
    ),
    [entryId, open, onClose, onExited]
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

export default AddRefund;
