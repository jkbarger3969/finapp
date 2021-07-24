import React, { forwardRef, Ref, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { FreeSoloNode, nodeStringifyReplacer } from "mui-tree-select";

import {
  EntryProps,
  useEntry,
  ENTRY_NAME_PREFIX,
} from "../../../Inputs/fieldSets/useEntry";
import { usePrePrint } from "../../../utils/usePrePrint";
import { inputGridItemProps, useSharedDialogInputProps } from "./shared";
import { usePerson } from "../../../Inputs/fieldSets/usePerson";
import { EntityInputOpt } from "../../../Inputs/Entity";

export type AddEntryProps = {
  entryProps: Omit<EntryProps, "paymentMethod" | "source"> & {
    paymentMethod: Omit<EntryProps["paymentMethod"], "isRefund">;
    source?: Omit<EntryProps<true>["source"], "allowNewSource">;
  };
} & Omit<DialogProps, "children" | "PaperProps">;

const AddEntryInner = (props: AddEntryProps & { innerRef: Ref<unknown> }) => {
  const { entryProps, innerRef, ...rest } = props;

  const methods = useFormContext();

  const {
    control: { defaultValuesRef },
    handleSubmit,
    watch,
  } = methods;

  const printToScreen = usePrePrint(
    {
      values: watch(),
      defaultValues: defaultValuesRef.current,
    },
    {
      stringify: (value) => JSON.stringify(value, nodeStringifyReplacer, 2),
      poll: 750,
    }
  );

  const sharedInputProps = useSharedDialogInputProps();

  const entryInputs = useEntry(
    useMemo<EntryProps<true>>(
      () => ({
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
        sharedInputProps.DateInputProps,
        sharedInputProps.TextFieldProps,
        sharedInputProps.TreeSelectProps,
      ]
    )
  );

  const personInputs = usePerson({
    namePrefix: ENTRY_NAME_PREFIX,
    showLabels: true,
    ...sharedInputProps.TextFieldProps,
  });

  // Watch Source
  const sourceValue = watch(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entryInputs.sourceInputName as any,
    null
  ) as null | EntityInputOpt;
  console.log("Source", entryInputs.sourceInputName, sourceValue);
  /* const handlePersonChange = useCallback<
    NonNullable<AddPersonFieldsProps["onChange"]>
  >(
    (event) => {
      if (
        !(
          formik.values.source instanceof FreeSoloNode ||
          formik.values.source?.parent?.valueOf() === "Person"
        )
      ) {
        return;
      }

      switch (event.target.name) {
        case "person.name.first":
          {
            const value = event.target.value ?? "";

            const attr = human.parseName(formik.values.source.toString());

            setFieldValue(
              "source",
              new FreeSoloNode(
                `${value} ${attr.lastName}`.trim(),
                formik.values.source.parent
              )
            );
          }

          break;

        case "person.name.last":
          {
            const value = event.target.value ?? "";

            const attr = human.parseName(formik.values.source.toString());

            setFieldValue(
              "source",
              new FreeSoloNode(
                `${attr.firstName} ${value}`.trim(),
                formik.values.source.parent
              )
            );
          }
          break;
      }
    },
    [formik.values.source, setFieldValue]
  ); */

  return (
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
      ref={innerRef}
    >
      <DialogTitle>Add Entry</DialogTitle>
      <DialogContent dividers>
        <Grid spacing={3} container>
          <Grid {...inputGridItemProps}>{entryInputs.dateInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.dateOfRecordInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.departmentInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.sourceInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.categoryInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.paymentMethodInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.totalInput}</Grid>
          <Grid {...inputGridItemProps}>{entryInputs.reconciledInput}</Grid>
        </Grid>
        {sourceValue instanceof FreeSoloNode &&
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
          )}
        <div>{printToScreen}</div>
      </DialogContent>
    </Dialog>
  );
};

export const AddEntry = forwardRef(function AddEntry(
  props: AddEntryProps,
  ref: Ref<unknown>
) {
  return (
    <FormProvider
      {...useForm({
        shouldFocusError: true,
        mode: "onBlur",
        reValidateMode: "onBlur",
      })}
    >
      <AddEntryInner {...props} innerRef={ref} />
    </FormProvider>
  );
});
