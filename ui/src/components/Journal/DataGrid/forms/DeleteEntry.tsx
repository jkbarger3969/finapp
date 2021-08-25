import React, { useCallback, useMemo, useRef } from "react";
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
import { gql, useQuery } from "@apollo/client";

import { AsyncButton } from "../../../utils/AsyncButton";
import {
  DeleteEntryStateQuery as DeleteEntryState,
  DeleteEntryStateQueryVariables as DeleteEntryStateVars,
  DeleteRefundStateQuery as DeleteRefundState,
  DeleteRefundStateQueryVariables as DeleteRefundStateVars,
} from "../../../../apollo/graphTypes";
import OverlayLoading from "../../../utils/OverlayLoading";
import { deserializeRational } from "../../../../apollo/scalars";

const DELETE_ENTRY_STATE = gql`
  query DeleteEntryState($id: ID!) {
    entry(id: $id) {
      __typename
      id
      total
    }
  }
`;

const DELETE_REFUND_STATE = gql`
  query DeleteRefundState($id: ID!) {
    entryRefund(id: $id) {
      __typename
      id
      total
    }
  }
`;

const useStyles = makeStyles({
  dialogContent: {
    position: "relative",
  },
});

export type DeleteEntryProps = (
  | {
      deleteEntryId?: string;
    }
  | {
      deleteRefundId?: string;
    }
) & {
  onSuccess?: () => void;
} & Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    onClose?: (
      event: Parameters<NonNullable<DialogProps["onClose"]>>[0],
      reason: Parameters<NonNullable<DialogProps["onClose"]>>[1] | "cancel"
    ) => void;
  };

export const DeleteEntry = (props: DeleteEntryProps) => {
  const classes = useStyles();

  const [deleteEntryId, deleteRefundId, dialogProps] = ((): [
    deleteEntryId: string | undefined,
    deleteRefundId: string | undefined,
    dialogProps: Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
      onClose?: (
        event: Parameters<NonNullable<DialogProps["onClose"]>>[0],
        reason: Parameters<NonNullable<DialogProps["onClose"]>>[1] | "cancel"
      ) => void;
    }
  ] => {
    if ("deleteEntryId" in props) {
      const { deleteEntryId, ...rest } = props;
      return [deleteEntryId, undefined, rest];
    } else if ("deleteRefundId" in props) {
      const { deleteRefundId, ...rest } = props;
      return [undefined, deleteRefundId, rest];
    } else {
      return [undefined, undefined, props];
    }
  })();

  const deleteEntryResults = useQuery<DeleteEntryState, DeleteEntryStateVars>(
    DELETE_ENTRY_STATE,
    useMemo(
      () => ({
        skip: !deleteEntryId,
        variables: {
          id: deleteEntryId as string,
        },
      }),
      [deleteEntryId]
    )
  );

  const deleteRefundResults = useQuery<
    DeleteRefundState,
    DeleteRefundStateVars
  >(
    DELETE_REFUND_STATE,
    useMemo(
      () => ({
        skip: !deleteRefundId,
        variables: {
          id: deleteRefundId as string,
        },
      }),
      [deleteRefundId]
    )
  );

  const serverError = deleteEntryResults.error || deleteRefundResults.error;

  const { onClose: onCloseProp, ...rest } = dialogProps;

  const handleClose = useCallback<NonNullable<DeleteEntryProps["onClose"]>>(
    (...args) => {
      if (onCloseProp) {
        onCloseProp(...args);
      }
    },
    [onCloseProp]
  );

  const deleteRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog {...rest} onClose={handleClose}>
      <DialogTitle>
        {deleteRefundId ? "Delete refund" : "Delete entry"}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {useMemo(() => {
          const currencyFormat = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          });

          const total =
            deleteEntryResults?.data?.entry?.total ||
            deleteRefundResults?.data?.entryRefund?.total;

          const msg = `Delete ${deleteRefundId ? "Refund" : "Entry"}`;

          if (serverError) {
            return serverError.message;
          } else if (total) {
            return `${msg} in the amount of ${currencyFormat.format(
              deserializeRational(total).valueOf()
            )}`;
          } else {
            return msg;
          }
        }, [
          deleteEntryResults?.data?.entry?.total,
          deleteRefundId,
          deleteRefundResults?.data?.entryRefund?.total,
          serverError,
        ])}
        {(deleteEntryResults.loading || deleteRefundResults.loading) && (
          <OverlayLoading zIndex="modal" />
        )}
      </DialogContent>
      <DialogActions>
        <AsyncButton
          color="primary"
          // showProgress={}
          disabled={(!deleteEntryId && !deleteRefundId) || !!serverError}
          type="submit"
          variant="contained"
          startIcon={<DeleteIcon />}
          ref={deleteRef}
          // onClick={useCallback(() => {
          //   setSubmitButton(addRef.current);
          // }, [])}
        >
          Delete
        </AsyncButton>
        <Button
          type="reset"
          // disabled={form.isSubmitting}
          variant="text"
          onClick={useCallback<NonNullable<ButtonProps["onClick"]>>(
            (event) => {
              handleClose(event, "cancel");
            },
            [handleClose]
          )}
        >
          {serverError ? "Ok" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
