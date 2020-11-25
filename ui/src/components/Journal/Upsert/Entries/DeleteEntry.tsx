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
  DeleteEntryMutation,
  DeleteEntryMutationVariables as DeleteEntryVars,
} from "../../../../apollo/graphTypes";
import OverlayLoading from "../../../utils/OverlayLoading";

const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    journalEntryDelete(id: $id) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const DeleteEntry = (props: {
  entryId: string | null;
  onClose: () => void;
}): JSX.Element => {
  const { entryId, onClose } = props;

  const [deleteEntry, { loading, error }] = useMutation<
    DeleteEntryMutation,
    DeleteEntryVars
  >(DELETE_ENTRY);

  const hasError = !!error;

  const onDelete = useCallback(() => {
    deleteEntry({ variables: { id: entryId as string } }).then(() => onClose());
  }, [entryId, deleteEntry, onClose]);

  const title = useMemo(() => {
    if (hasError) {
      return "Error";
    } else if (loading) {
      return "Deleting Entry...";
    }
    return "Delete Entry";
  }, [hasError, loading]);

  const theme = useTheme();

  return (
    <Dialog
      open={!!entryId}
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
              Are you sure you want to delete this entry?
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

export default DeleteEntry;
