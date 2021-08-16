import React, {
  forwardRef,
  Ref,
  useCallback,
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
} from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import { TransitionProps } from "@material-ui/core/transitions";

import {
  FormProvider,
  OnSubmitCb,
  SubmitState,
  useForm,
} from "../../../../useKISSForm/form";
import {
  RefundFieldDef,
  RefundProps,
  useRefund,
} from "../../../Inputs/fieldSets/useRefund";
import { inputGridItemProps, useSharedDialogInputProps } from "./shared";
import { AsyncButton } from "../../../utils/AsyncButton";

export type UpsertRefundProps = {
  refundProps: RefundProps;
  onSuccess?: (results: { submitState: SubmitState<RefundFieldDef> }) => void;
} & Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    type: "update" | "add";
    onClose?: (
      event: Parameters<NonNullable<DialogProps["onClose"]>>[0],
      reason: Parameters<NonNullable<DialogProps["onClose"]>>[1] | "cancel"
    ) => void;
  };

export const UpsertRefund = forwardRef(function UpsertRefund(
  props: UpsertRefundProps,
  ref: Ref<unknown>
) {
  const {
    refundProps,
    onClose,
    onSuccess,
    TransitionProps: _TransitionProps,
    type,
    ...rest
  } = props;

  const addRef = useRef<HTMLButtonElement | null>(null);
  const [submitButton, setSubmitButton] = useState<HTMLButtonElement | null>(
    null
  );

  const form = useForm({
    onSubmit: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit: useCallback<OnSubmitCb<any>>(
        async (submitState) => {
          console.log(submitState);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (onSuccess) {
            onSuccess({ submitState });
          }
        },
        [onSuccess]
      ),
    },
    validateOn: "submit",
  });

  const TransitionProps = useMemo<TransitionProps>(
    () => ({
      ..._TransitionProps,
      onExited: (...args) => {
        form.reset();
        if (_TransitionProps?.onExited) {
          _TransitionProps.onExited(...args);
        }
      },
    }),
    [_TransitionProps, form]
  );

  const { handleSubmit } = form;

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
          ...(refundProps.date || {}),
        },
        paymentMethod: {
          ...sharedInputProps.TreeSelectProps,
          ...refundProps.paymentMethod,
        },

        total: {
          ...sharedInputProps.TextFieldProps,
          ...refundProps.total,
        },
        reconciled: {
          ...sharedInputProps.TextFieldProps,
          ...(refundProps.reconciled || {}),
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

  const handleClose = useCallback<NonNullable<UpsertRefundProps["onClose"]>>(
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

  return (
    <FormProvider form={form}>
      <Dialog
        {...rest}
        TransitionProps={TransitionProps}
        onClose={handleClose}
        PaperProps={useMemo(
          () =>
            ({
              component: "form",
              onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (!form.isSubmitting) {
                  handleSubmit(e);
                }
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
          [form.isSubmitting, handleSubmit]
        )}
        disableEscapeKeyDown={form.isSubmitting}
        ref={ref}
      >
        <DialogTitle>
          {(() => {
            if (type === "add") {
              return form.isSubmitting ? "Adding Refund..." : "Add Refund";
            } else {
              return form.isSubmitting ? "Updating Refund..." : "Update Refund";
            }
          })()}
        </DialogTitle>
        <DialogContent dividers>
          <Grid spacing={3} container>
            <Grid {...inputGridItemProps}>{refundInputs.dateInput}</Grid>
            <Grid {...inputGridItemProps}>
              {refundInputs.paymentMethodInput}
            </Grid>
            <Grid {...inputGridItemProps}>{refundInputs.totalInput}</Grid>
            <Grid {...inputGridItemProps}>{refundInputs.reconciledInput}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <AsyncButton
            color="primary"
            showProgress={
              form.isSubmitting &&
              !!submitButton &&
              submitButton === addRef.current
            }
            disabled={form.isSubmitting || form.loading}
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            ref={addRef}
            onClick={useCallback(() => {
              setSubmitButton(addRef.current);
            }, [])}
          >
            Add
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
      </Dialog>
    </FormProvider>
  );
});
