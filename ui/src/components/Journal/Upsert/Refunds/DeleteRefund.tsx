import React, { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  useTheme,
} from "@material-ui/core";
import { Delete as DeleteIcon, Cancel as CancelIcon } from "@material-ui/icons";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client";

import { JOURNAL_ENTRY_FRAGMENT } from "../../Table/JournalEntries.gql";
import {
  DeleteRefundMutation,
  DeleteRefundMutationVariables as DeleteRefundVars,
} from "../../../../apollo/graphTypes";
import OverlayLoading from "../../../utils/OverlayLoading";

const DELETE_REFUND = gql`
  mutation DeleteRefund($id: ID!) {
    journalEntryDeleteRefund(id: $id) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const DeleteRefund = (props: {
  refundId: string | null;
  onClose: () => void;
}): JSX.Element => {
  const { refundId, onClose } = props;

  const [deleteRefund, { loading, error }] = useMutation<
    DeleteRefundMutation,
    DeleteRefundVars
  >(DELETE_REFUND);
  const hasError = !!error;

  const onDelete = useCallback(() => {
    deleteRefund({ variables: { id: refundId as string } }).then(() =>
      onClose()
    );
  }, [refundId, deleteRefund, onClose]);

  const title = useMemo(() => {
    if (hasError) {
      return "Error";
    } else if (loading) {
      return "Deleting Refund...";
    }
    return "Delete Refund";
  }, [hasError, loading]);

  const theme = useTheme();

  return (
    <Dialog
      open={!!refundId}
      maxWidth="sm"
      fullWidth
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
      onClose={onClose}
    >
      <DialogTitle
        style={hasError ? { color: theme.palette.error.main } : undefined}
      >
        {title}
      </DialogTitle>
      <Box position="relative">
        {loading && <OverlayLoading zIndex="modal" />}
        <DialogContent>
          {hasError && (
            <DialogContentText color="error">
              {error?.message as string}
            </DialogContentText>
          )}
          {!hasError && (
            <DialogContentText>
              Are you sure you want to delete this refund?
            </DialogContentText>
          )}
        </DialogContent>
      </Box>
      <DialogActions>
        {!hasError && (
          <Button
            disabled={loading}
            onClick={onDelete}
            startIcon={<DeleteIcon />}
            color="primary"
            variant="contained"
          >
            Delete
          </Button>
        )}
        <Button
          disabled={loading}
          startIcon={!hasError && <CancelIcon />}
          onClick={onClose}
        >
          {hasError ? "Close" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRefund;
