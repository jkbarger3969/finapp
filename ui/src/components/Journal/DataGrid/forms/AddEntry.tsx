import React, { forwardRef, Ref, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import { FreeSoloNode, nodeStringifyReplacer } from "mui-tree-select";

import {
  EntryProps,
  useEntry,
  ENTRY_NAME,
} from "../../../Inputs/fieldSets/useEntry";
import { usePrePrint } from "../../../utils/usePrePrint";
import { inputGridItemProps, useSharedDialogInputProps } from "./shared";
import { usePerson } from "../../../Inputs/fieldSets/usePerson";
import { EntityInputOpt } from "../../../Inputs/Entity";
import {
  FormProvider,
  useForm,
  useWatchAll,
} from "../../../../useKISSForm/form";

export type AddEntryProps = {
  entryProps: Omit<EntryProps, "paymentMethod" | "source"> & {
    paymentMethod: Omit<EntryProps["paymentMethod"], "isRefund">;
    source?: Omit<EntryProps<true>["source"], "allowNewSource">;
  };
} & Omit<DialogProps, "children" | "PaperProps">;

export const AddEntry = forwardRef(function AddEntry(
  props: AddEntryProps,
  ref: Ref<unknown>
) {
  const form = useForm({
    onSubmit: (...args) => console.log(...args),
  });

  const { dirtyValues, values } = useWatchAll({ form });

  const { entryProps, ...rest } = props;

  const printToScreen = usePrePrint(
    {
      form,
      values,
      dirtyValues,
    },
    {
      stringify: (value) => JSON.stringify(value, nodeStringifyReplacer, 2),
    }
  );

  const sharedInputProps = useSharedDialogInputProps();

  const entryInputs = useEntry(
    useMemo<EntryProps<true>>(
      () => ({
        form: form,
        showLabels: true,
        ...entryProps,
        required: true,
        date: {
          ...sharedInputProps.DateInputProps,
          ...(entryProps.date || {}),
        },
        dateOfRecord: {
          ...sharedInputProps.DateInputProps,
          ...(entryProps.dateOfRecord || {}),
        },
        department: {
          ...sharedInputProps.TreeSelectProps,
          ...entryProps.department,
        },
        source: {
          ...sharedInputProps.TreeSelectProps,
          ...(entryProps.source || {}),
          allowNewSource: true,
        },
        category: {
          ...sharedInputProps.TreeSelectProps,
          ...(entryProps.category || {}),
        },
        paymentMethod: {
          ...sharedInputProps.TreeSelectProps,
          ...entryProps.paymentMethod,
          isRefund: false,
        },
        total: {
          ...sharedInputProps.TextFieldProps,
          ...entryProps.total,
        },
        reconciled: {
          ...sharedInputProps.TextFieldProps,
          ...(entryProps.reconciled || {}),
        },
      }),
      [
        entryProps,
        form,
        sharedInputProps.DateInputProps,
        sharedInputProps.TextFieldProps,
        sharedInputProps.TreeSelectProps,
      ]
    )
  );

  const personInputs = usePerson({
    form,
    showLabels: true,
    ...sharedInputProps.TextFieldProps,
  });

  return (
    <FormProvider form={form}>
      <Dialog
        {...rest}
        PaperProps={useMemo(
          () =>
            ({
              component: "form",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onSubmit: (e: any) => e.preventDefault(),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
          []
        )}
        ref={ref}
      >
        <DialogTitle>Add Entry</DialogTitle>
        <DialogContent dividers>
          <Grid spacing={3} container>
            <Grid {...inputGridItemProps}>{entryInputs.dateInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.dateOfRecordInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.departmentInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.sourceInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.categoryInput}</Grid>
            <Grid {...inputGridItemProps}>
              {entryInputs.paymentMethodInput}
            </Grid>
            <Grid {...inputGridItemProps}>{entryInputs.totalInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.reconciledInput}</Grid>
          </Grid>
          {/* {sourceValue instanceof FreeSoloNode &&
          sourceValue.parent?.valueOf() === "Person" && (
            <Grid spacing={3} container>
              <Grid {...inputGridItemProps}>
                {personInputs.name.firstNameInput}
              </Grid>
              <Grid {...inputGridItemProps}>
                {personInputs.name.lastNameInput}
              </Grid>
              <Grid {...inputGridItemProps}>{personInputs.phoneInput}</Grid>
              <Grid {...inputGridItemProps}>{personInputs.emailInput}</Grid>
            </Grid>
          )}*/}
          <div>{printToScreen}</div>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );

  // return (
  //   <FormProvider onSubmit={(...args) => console.log(...args)}>
  //     <AddEntryInner {...props} innerRef={ref} />
  //   </FormProvider>
  // );
});
