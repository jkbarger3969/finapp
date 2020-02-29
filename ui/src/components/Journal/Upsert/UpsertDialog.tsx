import React, { useMemo, useCallback } from "react";
import {
  Dialog,
  PaperProps,
  DialogTitle,
  Box,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  CircularProgress,
  Typography
} from "@material-ui/core";
import { Delete, Cancel, Add, Queue } from "@material-ui/icons";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import { JournalEntryType } from "../../../apollo/graphTypes";
import { FormikProps, Status, createInitialValues } from "./UpsertEntry";
import Type from "./EntryFields/Type";
import DateEntry from "./EntryFields/DateEntry";
import Department from "./EntryFields/Department";
import Category from "./EntryFields/Category";
import Source from "./EntryFields/Source";
import PaymentMethod from "./EntryFields/PaymentMethod";
import Description from "./EntryFields/Description";
import Total from "./EntryFields/Total";
import Reconcile from "./EntryFields/Reconcile";
import { entryUpsertId } from "../Table/Journal";

const DELETE_JOURNAL_ENTRY = gql`
  mutation UpsertEntryDelete($id: ID!) {
    journalEntryDelete(id: $id) {
      __typename
      id
      deleted
    }
  }
`;

const UpsertDialog = (props: {
  open: boolean;
  isUpdate: boolean;
  entryId?: string;
  setOpen: (open: boolean) => void;
  formikProps: FormikProps;
  loading: boolean;
}) => {
  const { open, isUpdate, entryId, setOpen, formikProps, loading } = props;

  const [deleteEntry] = useMutation(DELETE_JOURNAL_ENTRY);

  const { isSubmitting } = formikProps;
  const {
    submitted = false,
    errors: { general: generalError, submission: submissionError }
  } = formikProps.status;
  const isTypeSet = formikProps.values.type !== null;
  const { submitForm, resetForm, setSubmitting, setStatus } = formikProps;

  const theme = useTheme();

  const title = useMemo(() => {
    if (generalError) {
      return (
        <Box color="error.main" clone>
          <span>General Error</span>
        </Box>
      );
    } else if (loading) {
      return "Loading";
    }

    const type = isUpdate ? "Update" : "Add";
    let title = "";
    if (!isTypeSet) {
      title = `${type} Entry`;
    } else if (formikProps.values.type === JournalEntryType.Credit) {
      title = `${type} Credit`;
    } else {
      title = `${type} Debit`;
    }

    if (submissionError) {
      return (
        <Box color="error.main" clone>
          <span>{`${title}: Submission Error`}</span>
        </Box>
      );
    } else if (isSubmitting) {
      return `${title}: Submitting`;
    }

    return title;
  }, [
    isSubmitting,
    isTypeSet,
    formikProps,
    isUpdate,
    loading,
    generalError,
    submissionError
  ]);

  const disabled = loading || isSubmitting || !!generalError || submitted;

  const dialogContent = useMemo(() => {
    if (submitted) {
      return (
        <Typography color="primary" variant="h3">
          Success!
        </Typography>
      );
    }

    if (generalError) {
      const errorIsString = typeof generalError === "string";

      return (
        <Box width="100%">
          <Typography color="error" variant="body1">
            {errorIsString ? generalError : (generalError as Error).message}
          </Typography>
          {!errorIsString && <pre>{JSON.stringify(generalError, null, 2)}</pre>}
        </Box>
      );
    }

    if (loading || isSubmitting) {
      return <CircularProgress />;
    }

    if (isTypeSet) {
      const entryMargin = `${theme.spacing(1)}px !important`;
      return (
        <React.Fragment>
          <Box margin={entryMargin} clone>
            <Type style={{ margin: theme.spacing(1) }} label="start" />
          </Box>
          <Box margin={entryMargin} width={175} clone>
            <DateEntry autoFocus />
          </Box>
          <Box margin={entryMargin} width={350} clone>
            <Department />
          </Box>
          <Box margin={entryMargin} width={350} clone>
            <Category entryType={formikProps.values.type} />
          </Box>
          <Box margin={entryMargin} width={350} clone>
            <Source />
          </Box>
          <Box margin={entryMargin} width={175} clone>
            <PaymentMethod />
          </Box>
          <Box margin={entryMargin} width={350} clone>
            <Description />
          </Box>
          <Box margin={entryMargin} width={175} clone>
            <Total />
          </Box>
          <Box padding={2}>
            <Reconcile label />
          </Box>
          {!!submissionError && (
            <Box width="100%">
              <Box marginTop={entryMargin} clone>
                <Typography variant="body1" color="error">
                  {typeof submissionError === "string"
                    ? submissionError
                    : submissionError.message}
                </Typography>
              </Box>
            </Box>
          )}
        </React.Fragment>
      );
    } else {
      const entryMargin = `0px !important`;
      return (
        <Box marginLeft={entryMargin} clone>
          <Type label="top" />
        </Box>
      );
    }
  }, [
    submitted,
    isTypeSet,
    loading,
    generalError,
    submissionError,
    isSubmitting,
    theme,
    formikProps.values.type
  ]);

  const onClickAddAndNew = useCallback(
    (event?) => submitForm().then(() => setOpen(true)),
    [submitForm, setOpen]
  );

  const onClickCancel = useCallback(
    (event?) => {
      setOpen(false);
      resetForm();
    },
    [setOpen, resetForm]
  );

  const onClickDelete = useCallback(
    async (event?) => {
      try {
        setSubmitting(true);
        await deleteEntry({ variables: { id: entryId } });
        const status: Status = {
          submitted: true,
          errors: {}
        };
        setSubmitting(false);
        setStatus(status);
        await new Promise(resolve => setTimeout(resolve, 750));
        resetForm({ values: createInitialValues() });
        setOpen(false);
      } catch (error) {
        const status: Status = {
          errors: {
            submission:
              "message" in error ? error : JSON.stringify(error, null, 2)
          }
        };
        setStatus(status);
        setSubmitting(false);
      }
    },
    [deleteEntry, entryId, setOpen, resetForm, setStatus, setSubmitting]
  );

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={open}
      PaperProps={
        {
          component: "form",
          onSubmit: formikProps.handleSubmit
        } as PaperProps & { onSubmit: typeof formikProps.handleSubmit }
      }
    >
      <DialogTitle children={title} />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        flexWrap="wrap"
        clone
      >
        <DialogContent dividers children={dialogContent} />
      </Box>

      <DialogActions>
        {isUpdate && (
          <Button
            disabled={disabled}
            size="medium"
            color="default"
            variant="outlined"
            startIcon={<Delete />}
            onClick={onClickDelete}
          >
            Delete
          </Button>
        )}
        <Button
          disabled={disabled}
          size="medium"
          color="secondary"
          variant="outlined"
          type="submit"
          startIcon={<Add />}
        >
          {isUpdate ? "Update" : "Add"}
        </Button>
        {!isUpdate && (
          <Button
            disabled={disabled}
            size="medium"
            color="secondary"
            variant="outlined"
            onClick={onClickAddAndNew}
            startIcon={<Queue />}
          >
            Add & New
          </Button>
        )}
        <Button
          disabled={isSubmitting || submitted}
          size="medium"
          color="default"
          variant="outlined"
          startIcon={<Cancel />}
          onClick={onClickCancel}
        >
          Cancel
        </Button>
      </DialogActions>
      {/* <pre style={{ height: 100, overflow: "auto" }}>
        {JSON.stringify(formikProps, null, 2)}
      </pre> */}
    </Dialog>
  );
};

export default UpsertDialog;
