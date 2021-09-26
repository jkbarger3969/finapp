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
import { DoneAll as ReconcileIcon } from "@material-ui/icons";
import { gql, useMutation } from "@apollo/client";

import { AsyncButton } from "../../../utils/AsyncButton";
import OverlayLoading from "../../../utils/OverlayLoading";
import { ENTRY, REFUND } from "../Grid.gql";
import {
  ReconcileEntriesMutation,
  ReconcileEntriesMutationVariables as ReconcileEntriesMutationVars,
} from "../../../../apollo/graphTypes";
import { DialogOnClose } from "./shared";

const useStyles = makeStyles({
  dialogContent: {
    position: "relative",
  },
});

const RECONCILE_ENTRIES = gql`
  mutation ReconcileEntries($input: ReconcileEntries!) {
    reconcileEntries(input: $input) {
      reconciledEntries {
        ...GridEntry
      }
      reconciledRefunds {
        ...GridRefund
      }
    }
  }
  ${ENTRY}
  ${REFUND}
`;

export type ReconcileEntriesProps = {
  entryIds?: string[];
  refundIds?: string[];
  dialogProps: Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    onClose?: DialogOnClose;
  };
};
const InnerDialog = (
  props: ReconcileEntriesProps & {
    handleCloseRef: MutableRefObject<
      ReconcileEntriesProps["dialogProps"]["onClose"]
    >;
  }
): JSX.Element => {
  const classes = useStyles();

  const { entryIds, refundIds, dialogProps } = props;

  const { onClose: onCloseProp } = dialogProps;

  const [reconcileEntries, { loading, error }] = useMutation<
    ReconcileEntriesMutation,
    ReconcileEntriesMutationVars
  >(
    RECONCILE_ENTRIES,
    useMemo(
      () => ({
        variables: {
          input: {
            entries: entryIds,
            refunds: refundIds,
          },
        },
      }),
      [entryIds, refundIds]
    )
  );

  const handleClose = useCallback<
    NonNullable<ReconcileEntriesProps["dialogProps"]["onClose"]>
  >(
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
      <DialogTitle>Reconcile</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {useMemo(() => {
          if (error) {
            return <Typography color="error">{error.message}</Typography>;
          }

          let msg = "";

          if (entryIds?.length) {
            msg = `${entryIds.length} ${
              entryIds.length === 1 ? "entry" : "entries"
            }`;
          }

          if (refundIds?.length) {
            msg += `${msg ? " and " : ""}${refundIds.length} ${
              refundIds.length === 1 ? "refund" : "refunds"
            }`;
          }

          return `${msg}.`;
        }, [entryIds?.length, error, refundIds?.length])}
        {loading && <OverlayLoading zIndex="modal" />}
      </DialogContent>
      <DialogActions>
        <AsyncButton
          color="primary"
          showProgress={loading}
          disabled={
            (!entryIds?.length && !refundIds?.length) || loading || !!error
          }
          type="submit"
          variant="contained"
          startIcon={<ReconcileIcon />}
          ref={deleteRef}
          onClick={useCallback(
            async (e) => {
              const { errors } = await reconcileEntries();

              if (!errors?.length) {
                handleClose(e, "success");
              }
            },
            [handleClose, reconcileEntries]
          )}
        >
          Reconcile
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

export const ReconcileEntries = (props: ReconcileEntriesProps) => {
  const handleCloseRef =
    useRef<ReconcileEntriesProps["dialogProps"]["onClose"]>();

  return (
    <Dialog
      {...props.dialogProps}
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
