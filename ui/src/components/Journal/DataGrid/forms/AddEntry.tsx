import React, { forwardRef, Ref, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
} from "@material-ui/core";
import { useForm, FormProvider } from "react-hook-form";

import { Entry, EntryProps } from "../../../Inputs/fieldSets/Entry";

export type AddEntryProps = {
  entryProps: Omit<EntryProps, "paymentMethod"> & {
    paymentMethod: Omit<EntryProps["paymentMethod"], "isRefund">;
  };
} & Omit<DialogProps, "children" | "PaperProps">;
export const AddEntry = forwardRef(function AddEntry(
  props: AddEntryProps,
  ref: Ref<unknown>
) {
  const {
    entryProps: { paymentMethod: paymentMethodProps, ...entryProps },
    ...rest
  } = props;
  const methods = useForm({
    shouldFocusError: true,
  });

  const { handleSubmit, watch } = methods;

  console.log(watch());

  return (
    <FormProvider {...methods}>
      <Dialog
        {...rest}
        PaperProps={useMemo(
          () =>
            ({
              component: "form",
              onSubmit: handleSubmit,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
          [handleSubmit]
        )}
        ref={ref}
      >
        <DialogTitle>Add Entry</DialogTitle>
        <DialogContent dividers>
          <Entry
            {...entryProps}
            paymentMethod={useMemo<EntryProps["paymentMethod"]>(
              () => ({
                ...paymentMethodProps,
                isRefund: false,
              }),
              [paymentMethodProps]
            )}
          />
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
});
