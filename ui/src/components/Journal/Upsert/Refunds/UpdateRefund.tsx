import React, { useMemo, useCallback } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Formik, FormikConfig, FormikProps, useFormikContext } from "formik";
import {
  useTheme,
  Dialog,
  DialogTitle,
  PaperProps,
  Box,
  DialogContent,
  DialogContentText,
  Grid,
  DialogActions,
  Button,
} from "@material-ui/core";
import { Add as AddIcon, Cancel as CancelIcon } from "@material-ui/icons";

import {
  GetEntryRefundInfo_2Query as GetEntryRefundInfoQuery,
  GetEntryRefundInfo_2QueryVariables as GetEntryRefundInfoQueryVars,
  JournalEntry_2Fragment as JournalEntryFragment,
} from "../../../../apollo/graphTypes";
import submitUpdate, { UpdateValues, IniUpdateValues } from "./submitUpdate";
import { JOURNAL_FRAGMENT } from "./refunds.gql";
import { PAY_METHOD_ENTRY_OPT_FRAGMENT } from "../upsertEntry.gql";
import {
  FormikStatus,
  FormikStatusType,
  useFormikStatus,
} from "../../../../formik/utils";
import OverlayLoading from "../../../Utils/OverlayLoading";
import Overlay from "../../../Utils/Overlay";
import Description from "../EntryFields/Description";
import PaymentMethod from "../EntryFields/PaymentMethod";
import Total from "../EntryFields/Total";
import DateEntry from "../EntryFields/DateEntry";
import Reconcile from "../EntryFields/Reconcile";

export interface UpdateRefundProps {
  entryId: string | null;
  refundId: string | null;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}

const GET_ENTRY_REFUND_INFO = gql`
  query GetEntryRefundInfo_2($entryId: ID!, $refundId: ID!) {
    journalEntry(id: $entryId) {
      ...JournalEntry_2Fragment
    }
    journalEntryRefund(id: $refundId) {
      __typename
      id
      date
      description
      paymentMethod {
        ...PayMethodEntryOptFragment
        ancestors {
          ...PayMethodEntryOptFragment
        }
      }
      total {
        num
        den
      }
      reconciled
    }
  }
  ${JOURNAL_FRAGMENT}
  ${PAY_METHOD_ENTRY_OPT_FRAGMENT}
`;

const UpdateRefundDialog = (
  props: UpdateRefundProps & {
    journalEntry: JournalEntryFragment | null;
    loading: boolean;
    handleSubmit: FormikProps<UpdateValues>["handleSubmit"];
  }
) => {
  const {
    entryId,
    refundId,
    open,
    onClose,
    onExited: onExitedCb,
    journalEntry,
    loading,
    handleSubmit,
  } = props;

  const { resetForm, isSubmitting, isValid } = useFormikContext<UpdateValues>();

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const total = journalEntry?.total;
  const refunds = journalEntry?.refunds || [];
  const maxTotal = useMemo(() => {
    if (total) {
      const totalRefunds = refunds.reduce(
        (totalRefunds, { id, deleted, total }) =>
          // Do NOT include refund being updated in max total calculation
          deleted || id === refundId
            ? totalRefunds
            : totalRefunds + total.num / total.den,
        0
      );
      return total.num / total.den - totalRefunds;
    }
    return Number.MAX_SAFE_INTEGER;
  }, [total, refunds, refundId]);

  const date = journalEntry?.date;
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

  const title = useMemo(() => {
    const title = "Refund Update";

    if (fatalError) {
      return "Fatal Error";
    } else if (loading) {
      return `Loading ${title}...`;
    } else if (isSubmitting) {
      return `Submitting ${title}`;
    }
    return title;
  }, [loading, fatalError, isSubmitting]);

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
        } as PaperProps & {
          onSubmit: FormikProps<UpdateValues>["handleSubmit"];
        }
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
            Update
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

const UpdateRefund = (props: UpdateRefundProps) => {
  const { entryId, refundId, open, onClose, onExited } = props;

  const { loading, error, data } = useQuery<
    GetEntryRefundInfoQuery,
    GetEntryRefundInfoQueryVars
  >(GET_ENTRY_REFUND_INFO, {
    skip: !entryId,
    variables: {
      entryId: entryId as string,
      refundId: refundId as string,
    },
  });

  const initialStatus = useMemo(
    () =>
      error
        ? ({
            msg: error.message,
            type: FormikStatusType.FATAL_ERROR,
          } as FormikStatus)
        : null,
    [error]
  );

  const journalEntryRefund = data?.journalEntryRefund;
  const initialVariables = useMemo<IniUpdateValues>(() => {
    if (!journalEntryRefund) {
      return {} as any;
    }

    const date = {
      inputValue: new Date(journalEntryRefund.date),
      value: journalEntryRefund.date,
    };

    const paymentMethod = (() => {
      const { ancestors, ...paymentMethod } = journalEntryRefund.paymentMethod;

      // Array.prototype.sort mutates the array, create copy.
      const value = [...ancestors].sort((a, b) => {
        // a is the parent of b
        if (a.id === b.parent?.id) {
          return -1;
          // b is the parent of a
        } else if (b.id === a.parent?.id) {
          return 1;
        }
        return 0;
      });

      value.push(paymentMethod);

      return {
        inputValue: "",
        value,
      };
    })();

    const total = {
      inputValue: (
        journalEntryRefund.total.num / journalEntryRefund.total.den
      ).toFixed(2),
      value: journalEntryRefund.total,
    };

    const reconciled = journalEntryRefund.reconciled;

    const description = journalEntryRefund.description ?? null;

    return {
      date,
      paymentMethod,
      total,
      reconciled,
      description,
    };
  }, [journalEntryRefund]);

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<UpdateValues>["onSubmit"]>(
    async (values, formikHelpers) => {
      if (!initialVariables) {
        formikHelpers.setStatus({
          msg: `Failed to load initial values for refund "${refundId}".`,
          type: FormikStatusType.FATAL_ERROR,
        } as FormikStatus);
        return;
      } else if (!refundId) {
        formikHelpers.setStatus({
          msg: `No refund ID.`,
          type: FormikStatusType.FATAL_ERROR,
        } as FormikStatus);
        return;
      }

      try {
        formikHelpers.setStatus(null);
        await submitUpdate(
          client,
          initialVariables,
          refundId,
          values,
          formikHelpers
        );
        onClose();
      } catch (error) {
        formikHelpers.setStatus({
          msg: error?.message ?? `${error}`,
          type: FormikStatusType.FATAL_ERROR,
        } as FormikStatus);
      }
    },
    [client, initialVariables, onClose, refundId]
  );

  const children = useCallback(
    (props: FormikProps<UpdateValues>) => {
      return (
        <UpdateRefundDialog
          entryId={entryId}
          refundId={refundId}
          open={open}
          onClose={onClose}
          onExited={onExited}
          journalEntry={data?.journalEntry ?? null}
          loading={loading}
          handleSubmit={props.handleSubmit}
        />
      );
    },
    [data, entryId, loading, onClose, onExited, open, refundId]
  );

  return (
    <Formik
      initialValues={(initialVariables ?? {}) as UpdateValues}
      initialStatus={initialStatus}
      isInitialValid={false}
      enableReinitialize={true}
      onSubmit={onSubmit}
      children={children}
    />
  );
};

export default UpdateRefund;
