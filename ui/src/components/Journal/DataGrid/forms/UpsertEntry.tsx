import React, {
  forwardRef,
  Ref,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  DialogContentText,
  Grid,
  Box,
  ButtonProps,
  makeStyles,
} from "@material-ui/core";
import { FreeSoloNode } from "mui-tree-select";
import { parseName } from "humanparser";
import { Add as AddIcon, Queue as QueueIcon } from "@material-ui/icons";
import { TransitionProps } from "@material-ui/core/transitions";

import {
  EntryProps,
  useEntry,
  EntryFieldDef,
} from "../../../Inputs/fieldSets/useEntry";
import { inputGridItemProps, useSharedDialogInputProps } from "./shared";
import { usePerson, PersonFieldDef } from "../../../Inputs/fieldSets/usePerson";
import { EntityTreeSelectValue } from "../../../Inputs/Entity";
import {
  FieldValue,
  FormProvider,
  IForm,
  useDefaultValues,
  useForm,
  OnSubmitCb,
  SubmitState,
  useWatcher,
} from "../../../../useKISSForm/form";
import { AsyncButton } from "../../../utils/AsyncButton";
import OverlayLoading from "../../../utils/OverlayLoading";
const Person = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: IForm<any>;
  sourceValue: FreeSoloNode;
}) => {
  const sharedInputProps = useSharedDialogInputProps();

  const { form, sourceValue } = props;

  const personInputs = usePerson({
    form,
    required: true,
    showLabels: true,
    shouldUnregister: true,
    ...sharedInputProps.TextFieldProps,
  });

  const newSrcPerson = sourceValue.valueOf().trim();
  useDefaultValues(
    useMemo(() => {
      if (!newSrcPerson) {
        return {
          defaultValues: {},
          form,
        };
      }

      const { firstName, lastName } = parseName(newSrcPerson);

      return {
        defaultValues: {
          [personInputs.name.firstNameInputName]: new FieldValue(firstName),
          [personInputs.name.lastNameInputName]: new FieldValue(lastName),
        },
        form,
      };
    }, [
      form,
      newSrcPerson,
      personInputs.name.firstNameInputName,
      personInputs.name.lastNameInputName,
    ])
  );

  return (
    <>
      <Box marginTop={2.5} clone>
        <DialogContentText component="h2" variant="h6">
          Add New Person
        </DialogContentText>
      </Box>
      <Grid spacing={3} container>
        <Grid {...inputGridItemProps}>{personInputs.name.firstNameInput}</Grid>
        <Grid {...inputGridItemProps}>{personInputs.name.lastNameInput}</Grid>
        <Grid {...inputGridItemProps}>{personInputs.phoneInput}</Grid>
        <Grid {...inputGridItemProps}>{personInputs.emailInput}</Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles({
  dialogContent: {
    position: "relative",
  },
});

export type UpsertEntryProps = {
  entryProps: Omit<EntryProps, "paymentMethod" | "source"> & {
    paymentMethod: Omit<EntryProps["paymentMethod"], "isRefund">;
    source?: Omit<EntryProps<true>["source"], "allowNewSource">;
  };
  onSuccess?: (results: {
    submitState: SubmitState<EntryFieldDef & PersonFieldDef>;
  }) => void;
} & Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    onClose?: (
      event: Parameters<NonNullable<DialogProps["onClose"]>>[0],
      reason: Parameters<NonNullable<DialogProps["onClose"]>>[1] | "cancel"
    ) => void;
  };

export const UpsertEntry = forwardRef(function UpsertEntry(
  props: UpsertEntryProps,
  ref: Ref<unknown>
) {
  const {
    onSuccess,
    entryProps,
    onClose,
    TransitionProps: _TransitionProps,
    ...rest
  } = props;

  const classes = useStyles();

  const addRef = useRef<HTMLButtonElement | null>(null);
  const addAndNewRef = useRef<HTMLButtonElement | null>(null);

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
      finally: useCallback(() => setSubmitButton(null), []),
    },
    validateOn: "submit",
  });

  const isUpdate = !!entryProps.updateEntryId;

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

  const entryInputs = useEntry(
    useMemo<EntryProps<true>>(
      () => ({
        form: form,
        showLabels: true,
        ...entryProps,
        required: true,
        date: {
          ...sharedInputProps.DateInputProps,
          ...entryProps.date,
        },
        dateOfRecord: {
          ...sharedInputProps.DateInputProps,
          ...entryProps.dateOfRecord,
        },
        department: {
          ...sharedInputProps.TreeSelectProps,
          ...entryProps.department,
        },
        description: {
          ...sharedInputProps.TextFieldProps,
          ...entryProps.description,
        },
        source: {
          ...sharedInputProps.TreeSelectProps,
          ...entryProps.source,
          allowNewSource: true,
        },
        category: {
          ...sharedInputProps.TreeSelectProps,
          ...entryProps.category,
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
          ...entryProps.reconciled,
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

  const { value: sourceValue } = useWatcher<
    EntityTreeSelectValue<false, true, true>
  >({
    name: entryInputs.sourceInputName,
    form,
  });

  const handleClose = useCallback<NonNullable<UpsertEntryProps["onClose"]>>(
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
        ref={ref}
        disableEscapeKeyDown={form.isSubmitting}
      >
        <DialogTitle>
          {(() => {
            if (isUpdate) {
              return form.isSubmitting ? "Updating Entry..." : "Update Entry";
            } else {
              return form.isSubmitting ? "Adding Entry..." : "Add Entry";
            }
          })()}
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          {form.loading && <OverlayLoading zIndex="modal" />}
          <Grid spacing={3} container>
            <Grid {...inputGridItemProps}>{entryInputs.dateInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.dateOfRecordInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.departmentInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.sourceInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.categoryInput}</Grid>
            <Grid {...inputGridItemProps}>
              {entryInputs.paymentMethodInput}
            </Grid>
            <Grid {...inputGridItemProps}>{entryInputs.descriptionInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.totalInput}</Grid>
            <Grid {...inputGridItemProps}>{entryInputs.reconciledInput}</Grid>
          </Grid>
          {sourceValue instanceof FreeSoloNode &&
            sourceValue.parent?.valueOf() === "Person" && (
              <Person form={form} sourceValue={sourceValue} />
            )}
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
          <AsyncButton
            color="primary"
            showProgress={
              form.isSubmitting &&
              !!submitButton &&
              submitButton === addAndNewRef.current
            }
            disabled={form.isSubmitting || form.loading}
            type="submit"
            variant="outlined"
            startIcon={<QueueIcon />}
            ref={addAndNewRef}
            onClick={useCallback(() => {
              setSubmitButton(addAndNewRef.current);
            }, [])}
          >
            Add & New
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
