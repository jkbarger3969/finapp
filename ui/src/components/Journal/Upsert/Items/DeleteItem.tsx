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

import {
  DeleteItemMutation,
  DeleteItemMutationVariables as DeleteItemVars,
} from "../../../../apollo/graphTypes";
import OverlayLoading from "../../../utils/OverlayLoading";

const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    entryDeleteItem(id: $id) {
      entryItem {
        id
        __typename
        deleted
      }
    }
  }
`;

const DeleteItem = (props: {
  itemId: string | null;
  onClose: () => void;
}): JSX.Element => {
  const { itemId, onClose } = props;

  const [deleteItem, { loading, error }] = useMutation<
    DeleteItemMutation,
    DeleteItemVars
  >(DELETE_ITEM);
  const hasError = !!error;

  const onDelete = useCallback(() => {
    deleteItem({ variables: { id: itemId as string } }).then(() => onClose());
  }, [itemId, deleteItem, onClose]);

  const title = useMemo(() => {
    if (hasError) {
      return "Error";
    } else if (loading) {
      return "Deleting Item...";
    }
    return "Delete Item";
  }, [hasError, loading]);

  const theme = useTheme();

  return (
    <Dialog
      open={!!itemId}
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
              Are you sure you want to delete this item?
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

export default DeleteItem;
