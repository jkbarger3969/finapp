import React, { MutableRefObject, useCallback, useMemo, useRef } from "react";
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
import { gql, useMutation, useQuery } from "@apollo/client";

import { AsyncButton } from "../../../Utils/AsyncButton";
import {
  DeleteEntryStateQuery as DeleteEntryState,
  DeleteEntryStateQueryVariables as DeleteEntryStateVars,
  DeleteRefundStateQuery as DeleteRefundState,
  DeleteRefundStateQueryVariables as DeleteRefundStateVars,
  DeleteEntryMutation,
  DeleteEntryMutationVariables as DeleteEntryMutationVars,
  DeleteEntryRefundMutation,
  DeleteEntryRefundMutationVariables as DeleteEntryRefundMutationVars,
} from "../../../../apollo/graphTypes";
import OverlayLoading from "../../../Utils/OverlayLoading";
import { deserializeRational } from "../../../../apollo/scalars";
import { ENTRY, REFUND } from "../Grid.gql";
import { GraphQLError } from "graphql";
import { DialogOnClose } from "./shared";

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

const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    deleteEntry(id: $id) {
      deletedEntry {
        ...GridEntry
      }
    }
  }
  ${ENTRY}
`;

const DELETE_ENTRY_REFUND = gql`
  mutation DeleteEntryRefund($id: ID!) {
    deleteEntryRefund(id: $id) {
      deletedEntryRefund {
        ...GridRefund
      }
    }
  }
  ${REFUND}
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
) &
  Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    onClose?: DialogOnClose;
  };

const InnerDialog = (
  props: DeleteEntryProps & {
    handleCloseRef: MutableRefObject<DeleteEntryProps["onClose"]>;
  }
): JSX.Element => {
  const classes = useStyles();

  const [deleteEntryId, deleteRefundId, dialogProps] = ((): [
    deleteEntryId: string | undefined,
    deleteRefundId: string | undefined,
    dialogProps: DeleteEntryProps
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

  const deleteEntryState = useQuery<DeleteEntryState, DeleteEntryStateVars>(
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

  const deleteRefundState = useQuery<DeleteRefundState, DeleteRefundStateVars>(
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

  const [deleteEntry, deleteEntryResult] = useMutation<
    DeleteEntryMutation,
    DeleteEntryMutationVars
  >(DELETE_ENTRY);

  const [deleteEntryRefund, deleteEntryRefundResult] = useMutation<
    DeleteEntryRefundMutation,
    DeleteEntryRefundMutationVars
  >(DELETE_ENTRY_REFUND);

  const loading =
    deleteEntryState.loading ||
    deleteRefundState.loading ||
    deleteEntryResult.loading ||
    deleteEntryRefundResult.loading;
  const error =
    deleteEntryState.error ||
    deleteRefundState.error ||
    deleteEntryResult.error ||
    deleteEntryRefundResult.error;

  const { onClose: onCloseProp } = dialogProps;

  const handleClose = useCallback<NonNullable<DeleteEntryProps["onClose"]>>(
    (...args) => {
      if (loading && args[1] !== "success") {
        return;
      }

      if (onCloseProp) {
        onCloseProp(...args);
      }
    },
    [loading, onCloseProp]
  );

  props.handleCloseRef.current = handleClose;

  const deleteRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <DialogTitle>
        {(() => {
          if (deleteEntryResult.loading || deleteEntryRefundResult.loading) {
            return deleteRefundId ? "Deleting refund..." : "Deleting entry...";
          } else {
            return deleteRefundId ? "Delete refund" : "Delete entry";
          }
        })()}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {useMemo(() => {
          const currencyFormat = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          });

          const total =
            deleteEntryState?.data?.entry?.total ||
            deleteRefundState?.data?.entryRefund?.total;

          const msg = `Delete ${deleteRefundId ? "Refund" : "Entry"}`;

          if (error) {
            return <Typography color="error">{error.message}</Typography>;
          } else if (total) {
            return `${msg} in the amount of ${currencyFormat.format(
              deserializeRational(total).valueOf()
            )}`;
          } else {
            return msg;
          }
        }, [
          deleteEntryState?.data?.entry?.total,
          deleteRefundId,
          deleteRefundState?.data?.entryRefund?.total,
          error,
        ])}
        {(deleteEntryState.loading || deleteRefundState.loading || loading) && (
          <OverlayLoading zIndex="modal" />
        )}
      </DialogContent>
      <DialogActions>
        <AsyncButton
          color="primary"
          showProgress={loading}
          disabled={(!deleteEntryId && !deleteRefundId) || loading || !!error}
          type="submit"
          variant="contained"
          startIcon={<DeleteIcon />}
          ref={deleteRef}
          onClick={useCallback(
            async (e) => {
              let errors: ReadonlyArray<GraphQLError> | undefined;

              if (deleteEntryId) {
                ({ errors } = await deleteEntry({
                  variables: {
                    id: deleteEntryId,
                  },
                }));
              } else if (deleteRefundId) {
                ({ errors } = await deleteEntryRefund({
                  variables: {
                    id: deleteRefundId,
                  },
                }));
              }

              if (!errors?.length) {
                handleClose(e, "success");
              }
            },
            [
              deleteEntry,
              deleteEntryId,
              deleteEntryRefund,
              deleteRefundId,
              handleClose,
            ]
          )}
        >
          Delete
        </AsyncButton>
        <Button
          type="reset"
          disabled={loading}
          variant="text"
          onClick={useCallback<NonNullable<ButtonProps["onClick"]>>(
            (event) => {
              handleClose(event, "cancel");
            },
            [handleClose]
          )}
        >
          {error ? "Ok" : "Cancel"}
        </Button>
      </DialogActions>
    </>
  );
};

export const DeleteEntry = (props: DeleteEntryProps) => {
  const handleCloseRef = useRef<DeleteEntryProps["onClose"]>();

  return (
    <Dialog
      {...props}
      onClose={useCallback<NonNullable<DialogProps["onClose"]>>((...args) => {
        if (handleCloseRef.current) {
          handleCloseRef.current(...args);
        }
      }, [])}
    >
      <InnerDialog {...props} handleCloseRef={handleCloseRef} />
    </Dialog>
  );
};
