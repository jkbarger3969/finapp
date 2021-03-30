import React, { useMemo, useCallback } from "react";
import gql from "graphql-tag";
import { Formik, FormikConfig, FormikProps, useFormikContext } from "formik";
import { useQuery, useApolloClient, QueryHookOptions } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  Box,
  DialogContent,
  DialogContentText,
  PaperProps,
  Grid,
  DialogActions,
  Button,
  useTheme,
  GridProps,
} from "@material-ui/core";
import { Add as AddIcon, Cancel as CancelIcon } from "@material-ui/icons";
import Fraction from "fraction.js";

import {
  UpdateEntryIniStateQuery as UpdateEntryIniState,
  UpdateEntryIniStateQueryVariables as UpdateEntryIniStateVars,
  SourceType,
  SrcEntryDeptOptFragment,
  SrcEntryBizOptFragment,
  FiscalYearQuery,
  FiscalYearQueryVariables,
} from "../../../../apollo/graphTypes";
import { deserializeRational } from "../../../../apollo/scalars";
import {
  FormikStatus,
  FormikStatusType,
  useFormikStatus,
} from "../../../../utils/formik";
import submitUpdate, { UpdateValues, IniUpdateValues } from "./submitUpdate";
import {
  PAY_METHOD_ENTRY_OPT_FRAGMENT,
  DEPT_ENTRY_OPT_FRAGMENT,
  CAT_ENTRY_OPT_FRAGMENT,
  SRC_ENTRY_PERSON_OPT_FRAGMENT,
  SRC_ENTRY_BIZ_OPT_FRAGMENT,
  SRC_ENTRY_DEPT_OPT_FRAGMENT,
  FISCAL_YEAR,
} from "../upsertEntry.gql";
import { min } from "date-fns/esm";

import OverlayLoading from "../../../utils/OverlayLoading";
import Overlay from "../../../utils/Overlay";
import DateEntry from "../EntryFields/DateEntry";
import { DateOfRecord } from "../EntryFields/DateOfRecord";
import Description from "../EntryFields/Description";
import Total from "../EntryFields/Total";
import Reconcile from "../EntryFields/Reconcile";
import PaymentMethod from "../EntryFields/PaymentMethod";
import Category from "../EntryFields/Category";
import Department from "../EntryFields/Department";
import Source from "../EntryFields/Source";
import Type from "../EntryFields/Type";
import { ApolloError } from "@apollo/client";

export interface UpdateEntryProps {
  entryId: string | null;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}

const UPDATE_ENTRY_INI_STATE = gql`
  query UpdateEntryIniState($id: ID!) {
    entry(id: $id) {
      id
      __typename
      type
      date
      dateOfRecord {
        date
        overrideFiscalYear
      }
      department {
        ...DeptEntryOptFragment
      }
      category {
        ...CatEntryOptFragment
        ancestors {
          ...CatEntryOptFragment
        }
      }
      source {
        ...SrcEntryPersonOptFragment
        ...SrcEntryBizOptFragment
        ...SrcEntryDeptOptFragment
        ... on Department {
          ancestors {
            ...SrcEntryDeptOptFragment
            ...SrcEntryBizOptFragment
          }
        }
      }
      paymentMethod {
        ...PayMethodEntryOptFragment
        ancestors {
          ...PayMethodEntryOptFragment
        }
      }
      description
      total
      refunds {
        id
        __typename
        deleted
        date
        total
      }
      reconciled
    }
  }
  ${DEPT_ENTRY_OPT_FRAGMENT}
  ${CAT_ENTRY_OPT_FRAGMENT}
  ${SRC_ENTRY_PERSON_OPT_FRAGMENT}
  ${SRC_ENTRY_BIZ_OPT_FRAGMENT}
  ${SRC_ENTRY_DEPT_OPT_FRAGMENT}
  ${PAY_METHOD_ENTRY_OPT_FRAGMENT}
`;

const MAX_DATE = new Date(8640000000000000);

const gridEntryResponsiveProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;

const UpdateEntryDialog = (
  props: Omit<UpdateEntryProps, "entryId"> & {
    entry: NonNullable<UpdateEntryIniState["entry"]> | null;
    loading: boolean;
    handleSubmit: FormikProps<UpdateValues>["handleSubmit"];
  }
) => {
  const {
    open,
    onClose,
    onExited: onExitedCb,
    entry,
    loading,
    handleSubmit,
  } = props;

  const {
    resetForm,
    isSubmitting,
    isValid,
    values: { date, dateOfRecord },
  } = useFormikContext<UpdateValues>();

  const [formikStatus, setFormikStatus] = useFormikStatus();

  const onError = useCallback<
    NonNullable<QueryHookOptions<FiscalYearQuery>["onError"]>
  >(
    (err: ApolloError) => {
      setFormikStatus({ msg: err.message, type: FormikStatusType.FATAL_ERROR });
    },
    [setFormikStatus]
  );

  const dateStr = useMemo<string>(() => {
    if (dateOfRecord?.overrideFiscalYear) {
      return dateOfRecord?.date?.value ?? "";
    }
    return date?.value ?? "";
  }, [date, dateOfRecord]);

  const { data } = useQuery<FiscalYearQuery, FiscalYearQueryVariables>(
    FISCAL_YEAR,
    {
      skip: !dateStr,
      variables: {
        date: dateStr || "",
      },
      returnPartialData: true,
      onError,
    }
  );

  const fiscalYearId = useMemo<string>(
    () => (data?.fiscalYears ?? [])[0]?.id ?? "",
    [data]
  );

  const refunds = entry?.refunds || [];

  // Updates to total cannot be less than current refunds.
  const [minTotal, maxDate] = useMemo(
    () =>
      refunds.reduce(
        ([minTotal, maxDate], { deleted, total, date }) => [
          deleted ? minTotal : minTotal.add(deserializeRational(total)),
          deleted ? maxDate : min([maxDate, new Date(date)]),
        ],
        [new Fraction(0), MAX_DATE]
      ),
    [refunds]
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
    const title = "Entry Update";

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
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
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
        {(isSubmitting || loading) && !generalError && (
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
            <Grid {...gridEntryResponsiveProps} justify="center" container>
              <Type
                style={{ margin: theme.spacing(1) }}
                label="start"
                disabled={isSubmitting || loading || !!fatalError}
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <DateEntry
                disabled={isSubmitting || loading || !!fatalError}
                maxDate={maxDate === MAX_DATE ? undefined : maxDate}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <DateOfRecord
                disabled={isSubmitting || loading || !!fatalError}
                // maxDate={maxDate === MAX_DATE ? undefined : maxDate}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Source
                disabled={isSubmitting || loading || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Category
                disabled={isSubmitting || loading || !!fatalError}
                fullWidth
                required
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Department
                disabled={isSubmitting || loading || !!fatalError}
                fullWidth
                required
                fiscalYearId={fiscalYearId}
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Description
                disabled={isSubmitting || loading || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <PaymentMethod
                disabled={isSubmitting || loading || !!fatalError}
                fullWidth
              />
            </Grid>
            <Grid {...gridEntryResponsiveProps}>
              <Total
                disabled={isSubmitting || loading || !!fatalError}
                minTotal={minTotal}
                fullWidth
              />
            </Grid>
            <Grid
              container
              justify="center"
              alignItems="flex-start"
              {...gridEntryResponsiveProps}
            >
              <Reconcile
                disabled={isSubmitting || loading || !!fatalError}
                label
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
      <DialogActions>
        {!fatalError && (
          <Button
            disabled={isSubmitting || !isValid || loading}
            type="submit"
            startIcon={<AddIcon />}
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        )}
        <Button
          disabled={isSubmitting}
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

const UpdateEntry = (props: UpdateEntryProps): JSX.Element => {
  const { entryId, open, onClose, onExited } = props;

  const { loading, error, data } = useQuery<
    UpdateEntryIniState,
    UpdateEntryIniStateVars
  >(UPDATE_ENTRY_INI_STATE, {
    skip: !entryId,
    variables: {
      id: entryId as string,
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

  const entry = data?.entry;
  const initialValues = useMemo<IniUpdateValues>(() => {
    if (!entry) {
      return {} as IniUpdateValues;
    }

    const date = {
      inputValue: new Date(entry.date),
      value: entry.date,
    };

    const dateOfRecord: IniUpdateValues["dateOfRecord"] = entry.dateOfRecord
      ? {
          date: {
            inputValue: new Date(entry.dateOfRecord.date),
            value: entry.dateOfRecord.date,
          },
          overrideFiscalYear: entry.dateOfRecord.overrideFiscalYear,
          clear: false,
        }
      : null;

    const category = (() => {
      const { ancestors, ...category } = entry.category;

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

    const paymentMethod = (() => {
      const { ancestors, ...paymentMethod } = entry.paymentMethod;

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
      inputValue: deserializeRational(entry.total).round(2).toString(),
      value: entry.total,
    };

    const department = entry.department;

    const reconciled = entry.reconciled;

    const description = entry.description ?? null;

    const type = entry.type;

    const source = (() => {
      const value: IniUpdateValues["source"]["value"] = [];

      const src = entry?.source;

      switch (src?.__typename) {
        case "Person":
          value.push(SourceType.Person, src);
          break;
        case "Business":
          value.push(SourceType.Business, src);
          break;
        case "Department": {
          // The source type is the root, for Dept is always a business.
          value.push(SourceType.Business);
          const ancestorDeptQueue: string[] = [];
          for (const ancestor of src.ancestors) {
            if (ancestor.__typename === "Business") {
              value.push(ancestor);
            } else {
              ancestorDeptQueue.push(ancestor.id);
            }
          }

          const bizAncestor = value[1] as SrcEntryBizOptFragment;

          if (ancestorDeptQueue.length > 0) {
            const ancestorDepts: SrcEntryDeptOptFragment[] = [];
            for (const dept of bizAncestor.departments) {
              const index = ancestorDeptQueue.indexOf(dept.id);

              if (index === -1) {
                continue;
              }

              // Be lazy about finding depts
              if (ancestorDepts.push(dept) === ancestorDeptQueue.length) {
                break;
              }
            }

            // Ensure order
            ancestorDepts.sort((a, b) => {
              if (a.id === b.parent.id || bizAncestor.id || a.parent.id) {
                return -1;
              } else if (b.id === a.parent.id) {
                return 1;
              } else {
                return 0;
              }
            });

            value.push(...ancestorDepts, src);
          }
        }
      }

      return {
        inputValue: "",
        value,
      };
    })();

    const iniUpdateValues: IniUpdateValues = {
      date,
      dateOfRecord,
      category,
      paymentMethod,
      department,
      total,
      reconciled,
      description,
      type,
      source,
    };

    return iniUpdateValues;
  }, [entry]);

  const client = useApolloClient();
  const onSubmit = useCallback<FormikConfig<UpdateValues>["onSubmit"]>(
    async (values, formikHelpers) => {
      try {
        formikHelpers.setStatus(null);
        await submitUpdate(
          client,
          initialValues,
          entryId as string,
          values,
          formikHelpers
        );
        onClose();
      } catch (error) {
        console.error(error);
        formikHelpers.setStatus({
          msg: error.message ?? `${error}`,
          type: FormikStatusType.ERROR,
        } as FormikStatus);
      }
    },
    [client, initialValues, entryId, onClose]
  );

  const children = useCallback(
    (props: FormikProps<UpdateValues>) => (
      <UpdateEntryDialog
        open={open}
        onClose={onClose}
        onExited={onExited}
        loading={loading}
        entry={entry ?? null}
        handleSubmit={props.handleSubmit}
      />
    ),
    [open, onClose, onExited, loading, entry]
  );

  return (
    <Formik
      initialValues={initialValues as UpdateValues}
      initialStatus={initialStatus}
      entry={data?.entry ?? null}
      loading={loading}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {children}
    </Formik>
  );
};

export default UpdateEntry;
