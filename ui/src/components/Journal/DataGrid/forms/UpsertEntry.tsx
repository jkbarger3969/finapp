import React, {
  forwardRef,
  Ref,
  useMemo,
  useRef,
  useState,
  useCallback,
  MutableRefObject,
  useEffect,
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
  Typography,
  makeStyles,
} from "@material-ui/core";
import { FreeSoloNode } from "mui-tree-select";
import { parseName } from "humanparser";
import { Add as AddIcon, Queue as QueueIcon } from "@material-ui/icons";
import { gql, MutationHookOptions, useMutation } from "@apollo/client";

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
  useWatcher,
  UseDefaultValuesOptions,
} from "../../../../useKISSForm/form";
import { AsyncButton } from "../../../utils/AsyncButton";
import OverlayLoading from "../../../utils/OverlayLoading";
import { ENTRY } from "../Grid.gql";
import {
  NewEntryMutation,
  NewEntryMutationVariables as NewEntryMutationVars,
  UpdateEntryMutation,
  UpdateEntryMutationVariables as UpdateEntryMutationVars,
  UpdateEntry,
  UpsertEntrySource,
  EntityType,
  NewEntry,
} from "../../../../apollo/graphTypes";
import { serializeDate, serializeRational } from "../../../../apollo/scalars";
import { toUpsertPaymentMethod } from "../../../Inputs/PaymentMethod";
import Fraction from "fraction.js";

export const NEW_ENTRY = gql`
  mutation NewEntry($newEntry: NewEntry!) {
    addNewEntry(input: $newEntry) {
      newEntry {
        ...GridEntry
      }
    }
  }
  ${ENTRY}
`;

export const UPDATE_ENTRY = gql`
  mutation UpdateEntry($updateEntry: UpdateEntry!) {
    updateEntry(input: $updateEntry) {
      updatedEntry {
        ...GridEntry
      }
    }
  }
  ${ENTRY}
`;

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
    useMemo<UseDefaultValuesOptions<PersonFieldDef>>(() => {
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
  dialogProps: Omit<DialogProps, "children" | "PaperProps" | "onClose"> & {
    onClose?: (
      event: Parameters<NonNullable<DialogProps["onClose"]>>[0] | undefined,
      reason:
        | Parameters<NonNullable<DialogProps["onClose"]>>[1]
        | "cancel"
        | "success"
    ) => void;
  };
  refetchQueries?: {
    onUpdateEntry?: MutationHookOptions<
      UpdateEntryMutation,
      UpdateEntryMutationVars
    >["refetchQueries"];
    onNewEntry?: MutationHookOptions<
      NewEntryMutation,
      NewEntryMutationVars
    >["refetchQueries"];
  };
};

const InnerDialog = (
  props: UpsertEntryProps & {
    formRef: MutableRefObject<IForm<EntryFieldDef & PersonFieldDef> | null>;
  }
): JSX.Element => {
  const {
    entryProps,
    dialogProps: { onClose },
    formRef,
    refetchQueries,
  } = props;

  const classes = useStyles();

  const updateEntryId = useRef(entryProps.updateEntryId).current;

  const isUpdate = !!updateEntryId;

  const addRef = useRef<HTMLButtonElement | null>(null);
  const addAndNewRef = useRef<HTMLButtonElement | null>(null);

  const [submitButton, setSubmitButton] = useState<HTMLButtonElement | null>(
    null
  );
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  submitButtonRef.current = submitButton;

  const [addNewEntry] = useMutation<NewEntryMutation, NewEntryMutationVars>(
    NEW_ENTRY,
    useMemo(
      () =>
        refetchQueries?.onNewEntry
          ? {
              refetchQueries: refetchQueries?.onNewEntry,
            }
          : undefined,
      [refetchQueries?.onNewEntry]
    )
  );

  const [updateEntry] = useMutation<
    UpdateEntryMutation,
    UpdateEntryMutationVars
  >(
    UPDATE_ENTRY,
    useMemo(
      () =>
        refetchQueries?.onUpdateEntry
          ? {
              refetchQueries: refetchQueries?.onUpdateEntry,
            }
          : undefined,
      [refetchQueries?.onUpdateEntry]
    )
  );

  const form = useForm<EntryFieldDef & PersonFieldDef>({
    onSubmit: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit: useCallback<OnSubmitCb<EntryFieldDef & PersonFieldDef>>(
        async (submitState) => {
          const {
            dirtyValues: { entry },
            values: { person },
          } = submitState;

          // Nothing to update
          if (!entry && !person) {
            return;
          }

          const source =
            entry?.source || person
              ? (() => {
                  if (person) {
                    return {
                      person: {
                        name: {
                          first: person?.name?.first || "",
                          last: person?.name?.last || "",
                        },
                        email: person.email || null,
                        phone: person.phone || null,
                      },
                    };
                  } else if (!entry?.source) {
                    return null;
                  } else if (entry.source instanceof FreeSoloNode) {
                    return entry.source.parent?.valueOf() === "Business"
                      ? ({
                          business: {
                            name: entry.source.valueOf(),
                          },
                        } as UpsertEntrySource)
                      : null;
                  } else {
                    const source = entry.source.valueOf();

                    switch (source.__typename) {
                      case "Business":
                        return {
                          source: {
                            type: EntityType.Business,
                            id: source.id,
                          },
                        } as UpsertEntrySource;
                      case "Department":
                        return {
                          source: {
                            type: EntityType.Department,
                            id: source.id,
                          },
                        } as UpsertEntrySource;
                      case "Person":
                        return {
                          source: {
                            type: EntityType.Person,
                            id: source.id,
                          },
                        } as UpsertEntrySource;
                    }
                  }
                })()
              : null;

          if (entryProps.updateEntryId) {
            // compose UpdateEntry
            const entryUpdate: UpdateEntry = {
              id: entryProps.updateEntryId,
              date: entry?.date ? serializeDate(entry.date) : null,
              dateOfRecord: entry?.dateOfRecord
                ? {
                    date: serializeDate(entry.dateOfRecord),
                    overrideFiscalYear: true,
                  }
                : null,
              department: entry?.department?.valueOf().id || null,
              category: entry?.category?.valueOf().id || null,
              paymentMethod: entry?.paymentMethod
                ? toUpsertPaymentMethod({
                    paymentMethodInput: entry.paymentMethod,
                  })
                : null,
              description: entry?.description?.trim() ?? null,
              total: entry?.total ? serializeRational(entry.total) : null,
              source,
              reconciled: entry?.reconciled ?? null,
            };

            console.log(entryUpdate);

            const { errors } = await updateEntry({
              variables: {
                updateEntry: entryUpdate,
              },
            });

            if (errors?.length) {
              throw new Error(errors.map(({ message }) => message).join(".\n"));
            }
          } else {
            const newEntry: NewEntry = {
              date: serializeDate(entry?.date as Date),
              dateOfRecord: entry?.dateOfRecord
                ? {
                    date: serializeDate(entry.dateOfRecord),
                    overrideFiscalYear: true,
                  }
                : null,
              department: entry?.department?.valueOf().id as string,
              category: entry?.category?.valueOf().id as string,
              paymentMethod: toUpsertPaymentMethod({
                paymentMethodInput: entry?.paymentMethod as Parameters<
                  typeof toUpsertPaymentMethod
                >[0]["paymentMethodInput"],
              }),
              description: entry?.description?.trim() || null,
              total: serializeRational(entry?.total as Fraction),
              source: source as UpsertEntrySource,
              reconciled: entry?.reconciled ?? null,
            };

            const { errors } = await addNewEntry({
              variables: {
                newEntry,
              },
            });

            if (errors?.length) {
              throw new Error(errors.map(({ message }) => message).join(".\n"));
            }
          }
        },
        [addNewEntry, entryProps.updateEntryId, updateEntry]
      ),
      onSuccess: useCallback<OnSubmitCb<EntryFieldDef & PersonFieldDef>>(
        ({ event, form }) => {
          if (addRef.current === submitButtonRef.current) {
            if (onClose) {
              onClose(event, "success");
            }
          } else if (addAndNewRef.current === submitButtonRef.current) {
            form.reset({ exclude: { submitCount: true, submitted: true } });
          }
        },
        [onClose]
      ),
      finally: useCallback(() => setSubmitButton(null), []),
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

  const entryInputs = useEntry(
    useMemo<EntryProps<true>>(
      () => ({
        form: form,
        showLabels: true,
        ...entryProps,
        updateEntryId: updateEntryId,
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
        updateEntryId,
      ]
    )
  );

  const { value: sourceValue } = useWatcher<
    EntityTreeSelectValue<false, true, true>
  >({
    name: entryInputs.sourceInputName,
    form,
  });

  const handleClose = useCallback<
    NonNullable<UpsertEntryProps["dialogProps"]["onClose"]>
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

  const addAndNewHandleClick = useCallback(() => {
    setSubmitButton(addAndNewRef.current);
  }, []);

  const submissionError = form.submissionError;

  return (
    <FormProvider form={form}>
      <DialogTitle>
        {(() => {
          if (isUpdate) {
            return form.isSubmitting ? "Updating Entry..." : "Update Entry";
          } else {
            return (() => {
              if (form.isSubmitting) {
                return "Adding Entry...";
              } else {
                return form.submitCount > 0 && form.submit
                  ? "Add Another Entry"
                  : "Add Entry";
              }
            })();
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
        {!isUpdate && (
          <AsyncButton
            color="primary"
            showProgress={
              form.isSubmitting &&
              !!submitButton &&
              submitButton === addAndNewRef.current
            }
            disabled={form.isSubmitting || form.loading || !!submissionError}
            type="submit"
            variant="outlined"
            startIcon={<QueueIcon />}
            ref={addAndNewRef}
            onClick={addAndNewHandleClick}
          >
            Add & New
          </AsyncButton>
        )}
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
          {submissionError ? "Ok" : "Cancel"}
        </Button>
      </DialogActions>
    </FormProvider>
  );
};

export const UpsertEntry = forwardRef(function UpsertEntry(
  props: UpsertEntryProps,
  ref: Ref<unknown>
) {
  const formRef = useRef<IForm<EntryFieldDef & PersonFieldDef> | null>(null);

  const onClose = props.dialogProps.onClose;
  const handleClose = useCallback<
    NonNullable<UpsertEntryProps["dialogProps"]["onClose"]>
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
      ref={ref}
      disableEscapeKeyDown={formRef.current?.isSubmitting}
    >
      <InnerDialog {...props} formRef={formRef} />
    </Dialog>
  );
});
