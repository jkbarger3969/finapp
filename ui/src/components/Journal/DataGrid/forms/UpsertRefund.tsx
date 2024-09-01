import React, {
  forwardRef,
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import { gql } from "@apollo/client";
import { MutationHookOptions, useMutation } from "@apollo/client/react";
import Fraction from "fraction.js";

import {
  FormProvider,
  IForm,
  OnSubmitCb,
  useForm,
} from "../../../../useKISSForm/form";
import {
  RefundFieldDef,
  RefundProps,
  useRefund,
} from "../../../Inputs/fieldSets/useRefund";
import {
  DialogOnClose,
  inputGridItemProps,
  useSharedDialogInputProps,
} from "./shared";
import { AsyncButton } from "../../../Utils/AsyncButton";
import OverlayLoading from "../../../Utils/OverlayLoading";
import { REFUND, ENTRY } from "../Grid.gql";
import {
  NewEntryRefund,
  NewEntryRefundMutation,
  NewEntryRefundMutationVariables as NewEntryRefundMutationVars,
  UpdateEntryRefund,
  UpdateEntryRefundMutation,
  UpdateEntryRefundMutationVariables as UpdateEntryRefundMutationVars,
} from "../../../../apollo/graphTypes";
import { serializeDate, serializeRational } from "../../../../apollo/scalars";
import { toUpsertPaymentMethod } from "../../../Inputs/PaymentMethod";

export const NEW_ENTRY_REFUND = gql`
  mutation NewEntryRefund($newEntryRefund: NewEntryRefund!) {
    addNewEntryRefund(input: $newEntryRefund) {
      newEntryRefund {
        __typename
        id
        entry {
          ...GridEntry
        }
      }
    }
  }
  ${ENTRY}
`;

export const UPDATE_ENTRY_REFUND = gql`
  mutation UpdateEntryRefund($updateEntryRefund: UpdateEntryRefund!) {
    updateEntryRefund(input: $updateEntryRefund) {
      updatedEntryRefund {
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

export type UpsertRefundProps = {
  refundProps: RefundProps;
  dialogProps: Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    onClose?: DialogOnClose;
  };
  refetchQueries?: {
    onUpdateEntryRefund?: MutationHookOptions<
      UpdateEntryRefundMutation,
      UpdateEntryRefundMutationVars
    >["refetchQueries"];
    onNewEntryRefund?: MutationHookOptions<
      NewEntryRefundMutation,
      NewEntryRefundMutationVars
    >["refetchQueries"];
  };
};

const InnerDialog = (
  props: UpsertRefundProps & {
    formRef: MutableRefObject<IForm<RefundFieldDef> | null>;
  }
): JSX.Element => {
  const {
    refundProps,
    formRef,
    dialogProps: { onClose },
    refetchQueries,
  } = props;

  const classes = useStyles();

  const [entryId, updateRefundId] =
    "updateRefundId" in refundProps
      ? [undefined, refundProps.updateRefundId]
      : [refundProps.entryId, undefined];

  const isUpdate = useRef(!!updateRefundId).current;

  const addRef = useRef<HTMLButtonElement | null>(null);
  const [submitButton, setSubmitButton] = useState<HTMLButtonElement | null>(
    null
  );
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  submitButtonRef.current = submitButton;

  const [addNewEntryRefund] = useMutation<
    NewEntryRefundMutation,
    NewEntryRefundMutationVars
  >(
    NEW_ENTRY_REFUND,
    useMemo(
      () =>
        refetchQueries?.onNewEntryRefund
          ? {
              refetchQueries: refetchQueries?.onNewEntryRefund,
            }
          : undefined,
      [refetchQueries?.onNewEntryRefund]
    )
  );

  const [updateEntryRefund] = useMutation<
    UpdateEntryRefundMutation,
    UpdateEntryRefundMutationVars
  >(
    UPDATE_ENTRY_REFUND,
    useMemo(
      () =>
        refetchQueries?.onUpdateEntryRefund
          ? {
              refetchQueries: refetchQueries?.onUpdateEntryRefund,
            }
          : undefined,
      [refetchQueries?.onUpdateEntryRefund]
    )
  );

  const form = useForm({
    onSubmit: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit: useCallback<OnSubmitCb<RefundFieldDef>>(
        async (submitState) => {
          if (updateRefundId) {
            const {
              dirtyValues: { refund },
            } = submitState;

            // Nothing to update
            if (!refund) {
              return;
            }

            // compose RefundUpdate
            const entryRefundUpdate: UpdateEntryRefund = {
              id: updateRefundId,
              date: refund?.date ? serializeDate(refund.date) : null,
              dateOfRecord: refund?.dateOfRecord
                ? {
                    date: serializeDate(refund.dateOfRecord),
                    overrideFiscalYear: true,
                  }
                : null,
              paymentMethod: refund?.paymentMethod
                ? toUpsertPaymentMethod({
                    paymentMethodInput: refund.paymentMethod,
                  })
                : null,
              description: refund?.description?.trim() ?? null,
              total: refund?.total ? serializeRational(refund.total) : null,
              // source,
              reconciled: refund?.reconciled ?? null,
            };

            const { errors } = await updateEntryRefund({
              variables: {
                updateEntryRefund: entryRefundUpdate,
              },
            });

            if (errors?.length) {
              throw new Error(errors.map(({ message }) => message).join(".\n"));
            }
          } else {
            const {
              values: { refund },
            } = submitState;

            // Nothing to submit
            if (!refund) {
              return;
            }

            const newEntryRefund: NewEntryRefund = {
              entry: entryId as string,
              date: serializeDate(refund?.date as Date),
              dateOfRecord: refund?.dateOfRecord
                ? {
                    date: serializeDate(refund.dateOfRecord),
                    overrideFiscalYear: true,
                  }
                : null,
              paymentMethod: toUpsertPaymentMethod({
                paymentMethodInput: refund?.paymentMethod as Parameters<
                  typeof toUpsertPaymentMethod
                >[0]["paymentMethodInput"],
              }),
              description: refund?.description?.trim() || null,
              total: serializeRational(refund?.total as Fraction),
              reconciled: refund?.reconciled ?? null,
            };

            const { errors } = await addNewEntryRefund({
              variables: {
                newEntryRefund,
              },
            });

            if (errors?.length) {
              throw new Error(errors.map(({ message }) => message).join(".\n"));
            }
          }
        },
        [addNewEntryRefund, entryId, updateEntryRefund, updateRefundId]
      ),
      onSuccess: useCallback<OnSubmitCb<RefundFieldDef>>(
        ({ event }) => {
          if (addRef.current === submitButtonRef.current) {
            if (onClose) {
              onClose(event, "success");
            }
          } /* else if (addRef.current === addAndNewRef.current) {
            form.reset();
          } */
        },
        [onClose]
      ),
    },
    validateOn: "submit",
  });

  formRef.current = form;
  useEffect(
    () => () => {
      formRef.current = null;
    },
    [formRef]
  );

  const sharedInputProps = useSharedDialogInputProps();

  const refundInputs = useRefund(
    useMemo(
      () => ({
        ...refundProps,
        showLabels: true,
        required: true,
        form,
        date: {
          ...sharedInputProps.DateInputProps,
          ...refundProps.date,
        },
        dateOfRecord: {
          ...sharedInputProps.DateInputProps,
          ...refundProps.date,
        },
        paymentMethod: {
          ...sharedInputProps.TreeSelectProps,
          ...refundProps.paymentMethod,
        },
        description: {
          ...sharedInputProps.TextFieldProps,
          ...refundProps.description,
        },
        total: {
          ...sharedInputProps.TextFieldProps,
          ...refundProps.total,
        },
        reconciled: {
          ...sharedInputProps.TextFieldProps,
          ...refundProps.reconciled,
        },
      }),
      [
        form,
        refundProps,
        sharedInputProps.DateInputProps,
        sharedInputProps.TextFieldProps,
        sharedInputProps.TreeSelectProps,
      ]
    )
  );

  const handleClose = useCallback<
    NonNullable<UpsertRefundProps["dialogProps"]["onClose"]>
  >(
    (...args) => {
      if (form.isSubmitting) {
        return;
      }

      if (onClose) {
        onClose(...args);
      }
    },
    [form.isSubmitting, onClose]
  );

  const submissionError = form.submissionError;

  return (
    <FormProvider form={form}>
      <DialogTitle>
        {(() => {
          if (isUpdate) {
            return form.isSubmitting ? "Updating Refund..." : "Update Refund";
          } else {
            return form.isSubmitting ? "Adding Refund..." : "Add Refund";
          }
        })()}
      </DialogTitle>
      {submissionError ? (
        <DialogContent dividers>
          <Typography color="error">Submission Error:</Typography>
          <Typography color="error">{submissionError.message}</Typography>
        </DialogContent>
      ) : (
        <DialogContent dividers className={classes.dialogContent}>
          {form.loading && <OverlayLoading zIndex="modal" />}
          <Grid spacing={3} container>
            <Grid {...inputGridItemProps}>{refundInputs.dateInput}</Grid>
            <Grid {...inputGridItemProps}>
              {refundInputs.paymentMethodInput}
            </Grid>
            <Grid {...inputGridItemProps}>{refundInputs.descriptionInput}</Grid>
            <Grid {...inputGridItemProps}>{refundInputs.totalInput}</Grid>
            {isUpdate && (
              <Grid {...inputGridItemProps}>
                {refundInputs.reconciledInput}
              </Grid>
            )}
          </Grid>
        </DialogContent>
      )}
      <DialogActions>
        <AsyncButton
          color="primary"
          showProgress={
            form.isSubmitting &&
            !!submitButton &&
            submitButton === addRef.current
          }
          disabled={form.isSubmitting || form.loading || !!submissionError}
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          ref={addRef}
          onClick={useCallback(() => {
            setSubmitButton(addRef.current);
          }, [])}
        >
          {isUpdate ? "Update" : "Add"}
        </AsyncButton>
        <Button
          type="reset"
          disabled={form.isSubmitting}
          variant="text"
          onClick={useCallback<NonNullable<ButtonProps["onClick"]>>(
            (event) => {
              handleClose(event, "cancel");
            },
            [handleClose]
          )}
        >
          {form.submissionError ? "Ok" : "Cancel"}
        </Button>
      </DialogActions>
    </FormProvider>
  );
};

export const UpsertRefund = forwardRef(function UpsertRefund(
  props: UpsertRefundProps,
  ref: Ref<unknown>
) {
  const formRef = useRef<IForm<RefundFieldDef> | null>(null);

  const onClose = props.dialogProps.onClose;
  const handleClose = useCallback<
    NonNullable<UpsertRefundProps["dialogProps"]["onClose"]>
  >(
    (...args) => {
      if (formRef.current?.isSubmitting) {
        return;
      }

      if (onClose) {
        onClose(...args);
      }
    },
    [onClose]
  );

  return (
    <Dialog
      {...props.dialogProps}
      onClose={handleClose}
      PaperProps={useMemo(
        () =>
          ({
            component: "form",
            onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              if (!formRef.current?.isSubmitting) {
                formRef.current?.handleSubmit(e);
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any),
        []
      )}
      disableEscapeKeyDown={formRef.current?.isSubmitting}
      ref={ref}
    >
      <InnerDialog {...props} formRef={formRef} />
    </Dialog>
  );
});
