import React, { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  PaperProps,
  Box,
  useTheme
} from "@material-ui/core";
import { Add, Cancel, Delete } from "@material-ui/icons/";
import { Formik, FormikProps } from "formik";
import { Moment } from "moment";
import {
  DeptEntryOptFragment as DeptValue,
  JournalEntryType,
  CatEntryOptFragment as CatValue
} from "../../../apollo/graphTypes";
import Type from "./EntryFields/Type";
import DateEntry from "./EntryFields/DateEntry";
import Department from "./EntryFields/Department";
import Category from "./EntryFields/Category";

export interface UpsertEntryProps {
  entryId?: string;
  open: boolean;
  onCancel: () => void;
}

export interface Values {
  type: JournalEntryType | null;
  date: Moment | null;
  department: DeptValue | null;
  category: CatValue | null;
}

const UpsertEntry = function(props: UpsertEntryProps) {
  const { entryId, open, onCancel } = props;
  const isUpdate = !!entryId;

  const theme = useTheme();

  const initialValues = useMemo<Values>(() => {
    if (isUpdate) {
    }

    return {
      type: null,
      date: null,
      department: null,
      category: null
    };
  }, [entryId, isUpdate]);

  const onSubmit = useCallback(
    (values: Values) => {
      console.log(values);
    },
    [entryId, isUpdate]
  );

  const children = useCallback(
    (props: FormikProps<Values>) => {
      const isTypeSet = props.values.type !== null;

      const entryMargin = `${isTypeSet ? theme.spacing(1) : "0"}px !important`;

      const title = (() => {
        const type = isUpdate ? "Update" : "Add";
        if (!isTypeSet) {
          return `${type} Entry`;
        } else if (props.values.type === JournalEntryType.Credit) {
          return `${type} Credit`;
        }
        return `${type} Debit`;
      })();

      return (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={open}
          PaperProps={
            {
              component: "form",
              onSubmit: props.handleSubmit
            } as PaperProps & { onSubmit: typeof props.handleSubmit }
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
            <DialogContent dividers>
              {!isTypeSet && (
                <Box marginLeft={entryMargin} clone>
                  <Type label="top" />
                </Box>
              )}
              {/* Ternary does not allow Type margin changes */}
              {isTypeSet && (
                <React.Fragment>
                  <Box margin={entryMargin} clone>
                    <Type label="start" />
                  </Box>
                  <Box margin={entryMargin} width={175} clone>
                    <DateEntry autoFocus />
                  </Box>
                  <Box margin={entryMargin} width={350} clone>
                    <Department />
                  </Box>
                  <Box margin={entryMargin} width={350} clone>
                    <Category entryType={props.values.type} />
                  </Box>
                </React.Fragment>
              )}
            </DialogContent>
          </Box>
          <DialogActions>
            {isUpdate && (
              <Button
                size="medium"
                color="default"
                variant="outlined"
                startIcon={<Delete />}
                onClick={(...args) => console.log("Delete: ", args)}
              >
                Delete
              </Button>
            )}
            <Button
              size="medium"
              color="secondary"
              variant="outlined"
              type="submit"
              startIcon={<Add />}
            >
              {isUpdate ? "Update" : "Add"}
            </Button>
            <Button
              size="medium"
              color="default"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => {
                onCancel();
                props.resetForm();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
          <pre style={{ height: 100, overflow: "auto" }}>
            {JSON.stringify(props, null, 2)}
          </pre>
        </Dialog>
      );
    },
    [isUpdate, onCancel, open]
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      children={children}
    />
  );
};

export default UpsertEntry;
