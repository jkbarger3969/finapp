import React, { useCallback, useMemo, useState } from "react";
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
  GridProps,
} from "@material-ui/core";
import {
  useApolloClient,
  useQuery,
  QueryHookOptions,
} from "@apollo/react-hooks";
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Queue as QueueIcon,
} from "@material-ui/icons";
import gql from "graphql-tag";

import submitAdd, { AddValues } from "./submitAdd";
import {
  GetEntryItemState_1Query as GetEntryItemState,
  GetEntryItemState_1QueryVariables as GetEntryItemStateVars,
} from "../../../../apollo/graphTypes";
import Description from "../EntryFields/Description";
import Total from "../EntryFields/Total";
import Category from "../EntryFields/Category";
import Department from "../EntryFields/Department";
import {
  FormikStatusType,
  useFormikStatus,
  FormikStatus,
} from "../../../../formik/utils";
import OverlayLoading from "../../../Utils/OverlayLoading";
import Overlay from "../../../Utils/Overlay";
import { JOURNAL_FRAGMENT } from "./items.gql";
import {
  addRational,
  subRational,
  rationalToDecimal,
} from "../../../../utils/transmutations";

const ENTRY_ITEM_STATE = gql`
  query GetEntryItemState_1($id: ID!) {
    journalEntry(id: $id) {
      ...JournalEntry_3Fragment
    }
  }
  ${JOURNAL_FRAGMENT}
`;

export interface AddItemProps {
  entryId: string | null;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}

const gridEntryResponsiveProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;

// Must be in separate component to access FormikContext.
const AddItemDialog = (
  props: AddItemProps & {
    handleSubmit: FormikProps<AddValues>["handleSubmit"];
  }
) => {
  const { entryId, open, onClose, onExited: onExitedCb } = props;

  const { resetForm, isSubmitting, isValid, submitForm } = useFormikContext<
    AddValues
  >();

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const onError = useCallback<
    NonNullable<
      QueryHookOptions<GetEntryItemState, GetEntryItemStateVars>["onError"]
    >
  >(
    (error) =>
      setFormikStatus({
        msg: error.message,
        type: FormikStatusType.FATAL_ERROR,
      }),
    [setFormikStatus]
  );

  const { loading, data } = useQuery<GetEntryItemState, GetEntryItemStateVars>(
    ENTRY_ITEM_STATE,
    {
      skip: !entryId,
      variables: { id: entryId as string },
      onError,
    }
  );

  const type = data?.journalEntry?.type ?? null;

  const total = data?.journalEntry?.total;
  const items = data?.journalEntry?.items || [];
  const maxTotal = useMemo(() => {
    if (total) {
      const totalItems = items.reduce(
        (totalItems, { deleted, total }) => {
          return deleted ? totalItems : addRational(totalItems, total);
        },
        { num: 0, den: 1 }
      );
      return rationalToDecimal(subRational(total, totalItems));
    }
    return Number.MAX_SAFE_INTEGER;
  }, [total, items]);

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
    const title = "Add Item";

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
            <Grid {...gridEntryResponsiveProps}>
              <Total
                disabled={loading || isSubmitting}
                fullWidth
                maxTotal={maxTotal}
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Description disabled={loading || isSubmitting} fullWidth />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Category
                disabled={loading || isSubmitting || !!fatalError}
                entryType={type}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Department
                disabled={loading || isSubmitting || !!fatalError}
                fullWidth
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

const AddItem = (props: AddItemProps) => {
  const { entryId, open, onClose, onExited } = props;

  const initialValues = useMemo<Partial<AddValues>>(() => ({}), []);

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<AddValues>["onSubmit"]>(
    (values, formikHelpers) =>
      submitAdd(client, entryId || "", values, formikHelpers),
    [client, entryId]
  );

  const children = useCallback(
    (props: FormikProps<AddValues>) => (
      <AddItemDialog
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
      enableReinitialize={true}
      onSubmit={onSubmit}
      children={children}
    />
  );
};

export default AddItem;
