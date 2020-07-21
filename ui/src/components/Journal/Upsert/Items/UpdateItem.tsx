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
  GridProps,
} from "@material-ui/core";
import { Add as AddIcon, Cancel as CancelIcon } from "@material-ui/icons";
import Fraction from "fraction.js";

import {
  UpdateItemIniStateQuery as UpdateItemIniState,
  UpdateItemIniStateQueryVariables as UpdateItemIniStateVars,
  JournalEntry_3Fragment as JournalEntryFragment,
} from "../../../../apollo/graphTypes";
import submitUpdate, { UpdateValues } from "./submitUpdate";
import { JOURNAL_FRAGMENT } from "./items.gql";
import {
  DEPT_ENTRY_OPT_FRAGMENT,
  CAT_ENTRY_OPT_FRAGMENT,
} from "../upsertEntry.gql";
import {
  FormikStatus,
  FormikStatusType,
  useFormikStatus,
} from "../../../../formik/utils";
import OverlayLoading from "../../../utils/OverlayLoading";
import Overlay from "../../../utils/Overlay";
import Description from "../EntryFields/Description";
import Department from "../EntryFields/Department";
import Total from "../EntryFields/Total";
import Category from "../EntryFields/Category";
import Units from "./ItemFields/Units";
import { rationalToFraction } from "../../../../utils/rational";

export interface UpdateItemProps {
  entryId: string | null;
  itemId: string | null;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}

const UPDATE_ITEM_INI_STATE = gql`
  query UpdateItemIniState($entryId: ID!, $itemId: ID!) {
    journalEntry(id: $entryId) {
      ...JournalEntry_3Fragment
    }
    journalEntryItem(id: $itemId) {
      __typename
      id
      department {
        ...DeptEntryOptFragment
      }
      category {
        ...CatEntryOptFragment
        ancestors {
          ...CatEntryOptFragment
        }
      }
      description
      units
      total {
        n
        d
        s
      }
    }
  }
  ${JOURNAL_FRAGMENT}
  ${DEPT_ENTRY_OPT_FRAGMENT}
  ${CAT_ENTRY_OPT_FRAGMENT}
`;

const gridEntryResponsiveProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;

const UpdateItemDialog = (
  props: UpdateItemProps & {
    journalEntry: JournalEntryFragment | null;
    loading: boolean;
    handleSubmit: FormikProps<UpdateValues>["handleSubmit"];
  }
) => {
  const {
    itemId,
    open,
    onClose,
    onExited: onExitedCb,
    journalEntry,
    loading,
    handleSubmit,
  } = props;

  const { resetForm, isSubmitting, isValid } = useFormikContext<UpdateValues>();

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const type = journalEntry?.type ?? null;

  const total = journalEntry?.total;
  const items = journalEntry?.items || [];
  const maxTotal = useMemo(() => {
    if (total) {
      const totalItems = items.reduce(
        (totalItems, { id, deleted, total }) =>
          // Do NOT include item being updated in max total calculation
          deleted || id === itemId
            ? totalItems
            : totalItems.add(rationalToFraction(total)),
        new Fraction(0)
      );
      return rationalToFraction(total).sub(totalItems);
    }
    return new Fraction(Number.MAX_SAFE_INTEGER);
  }, [total, items, itemId]);

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
    const title = "Item Update";

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
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
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
            <Grid {...gridEntryResponsiveProps}>
              <Total
                disabled={loading || isSubmitting}
                fullWidth
                maxTotal={maxTotal}
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Units disabled={loading || isSubmitting} fullWidth />
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
          disabled={loading || isSubmitting || !!fatalError}
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

const UpdateItem = (props: UpdateItemProps) => {
  const { entryId, itemId, open, onClose, onExited } = props;

  const { loading, error, data } = useQuery<
    UpdateItemIniState,
    UpdateItemIniStateVars
  >(UPDATE_ITEM_INI_STATE, {
    skip: !entryId,
    variables: {
      entryId: entryId as string,
      itemId: itemId as string,
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

  const journalEntryItem = data?.journalEntryItem;
  const initialValues = useMemo<UpdateValues>(() => {
    if (!journalEntryItem) {
      return {} as any;
    }

    const total = {
      inputValue: rationalToFraction(journalEntryItem.total)
        .round(2)
        .toString(),
      value: journalEntryItem.total,
    };

    const category = (() => {
      if (!journalEntryItem.category) {
        return {
          inputValue: "",
          value: [],
        };
      }

      const { ancestors, ...category } = journalEntryItem.category;

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

      value.push(category);

      return {
        inputValue: "",
        value,
      };
    })();

    const department = journalEntryItem.department ?? null;

    const description = journalEntryItem.description ?? null;

    const units = journalEntryItem.units;

    return {
      total,
      units,
      category,
      department,
      description,
    };
  }, [journalEntryItem]);

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<UpdateValues>["onSubmit"]>(
    async (values, formikHelpers) => {
      if (!initialValues) {
        formikHelpers.setStatus({
          msg: `Failed to load initial values for item "${itemId}".`,
          type: FormikStatusType.FATAL_ERROR,
        } as FormikStatus);
        return;
      } else if (!itemId) {
        formikHelpers.setStatus({
          msg: `No item ID.`,
          type: FormikStatusType.FATAL_ERROR,
        } as FormikStatus);
        return;
      }

      try {
        formikHelpers.setStatus(null);
        await submitUpdate(
          client,
          initialValues,
          itemId,
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
    [client, initialValues, onClose, itemId]
  );

  const children = useCallback(
    (props: FormikProps<UpdateValues>) => {
      return (
        <UpdateItemDialog
          entryId={entryId}
          itemId={itemId}
          open={open}
          onClose={onClose}
          onExited={onExited}
          journalEntry={data?.journalEntry ?? null}
          loading={loading}
          handleSubmit={props.handleSubmit}
        />
      );
    },
    [data, entryId, loading, onClose, onExited, open, itemId]
  );

  return (
    <Formik
      initialValues={(initialValues ?? {}) as UpdateValues}
      initialStatus={initialStatus}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {children}
    </Formik>
  );
};

export default UpdateItem;
