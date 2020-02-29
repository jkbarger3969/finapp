import React, { useCallback, useMemo } from "react";
import {
  Formik,
  FormikProps as NativeFormikProps,
  FormikHelpers
} from "formik";
import moment, { Moment } from "moment";
import gql from "graphql-tag";
import {
  DeptEntryOptFragment as DeptValue,
  JournalEntryType,
  CatEntryOptFragment as CatValue,
  SrcEntryBizOptFragment,
  SrcEntryDeptOptFragment
} from "../../../apollo/graphTypes";
import UpsertDialog from "./UpsertDialog";
import { Value as SrcValue } from "./EntryFields/Source";
import { useQuery } from "@apollo/react-hooks";
import { ApolloError } from "apollo-client";

import {
  DEPT_ENTRY_OPT_FRAGMENT,
  CAT_ENTRY_OPT_FRAGMENT,
  SRC_ENTRY_PERSON_OPT_FRAGMENT,
  SRC_ENTRY_BIZ_OPT_FRAGMENT,
  SRC_ENTRY_DEPT_OPT_FRAGMENT,
  PAY_METHOD_ENTRY_OPT_FRAGMENT
} from "./upsertEntry.gql";
import {
  EntryUpdateValuesQuery,
  EntryUpdateValuesQueryVariables,
  JournalEntrySourceType
} from "../../../apollo/graphTypes";
import submit from "./submit";

const ENTRY_UPDATE_VALUES = gql`
  query EntryUpdateValues($id: ID!) {
    journalEntry(id: $id) {
      ...EntryUpdateValueFragment
    }
  }
  fragment EntryUpdateValueFragment on JournalEntry {
    id
    __typename
    type
    date
    department {
      ...DeptEntryOptFragment
    }
    category {
      ...CatEntryOptFragment
    }
    source {
      ...SrcEntryPersonOptFragment
      ...SrcEntryBizOptFragment
      ... on Department {
        ancestors {
          ... on Department {
            id
            __typename
          }
          ...SrcEntryBizOptFragment
        }
      }
    }
    paymentMethod {
      ...PayMethodEntryOptFragment
    }
    description
    total {
      num
      den
    }
    reconciled
  }
  ${DEPT_ENTRY_OPT_FRAGMENT}
  ${CAT_ENTRY_OPT_FRAGMENT}
  ${SRC_ENTRY_PERSON_OPT_FRAGMENT}
  ${SRC_ENTRY_BIZ_OPT_FRAGMENT}
  ${SRC_ENTRY_DEPT_OPT_FRAGMENT}
  ${PAY_METHOD_ENTRY_OPT_FRAGMENT}
`;

export interface UpsertEntryProps {
  entryId?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface Values {
  type: JournalEntryType | null;
  date: Moment | null;
  department: DeptValue | null;
  category: CatValue | null;
  source: {
    inputValue: string;
    value: SrcValue[];
  };
  paymentMethod: string;
  description: string;
  total: string | number;
  reconciled: boolean;
}

export const createInitialValues = (): Values => ({
  type: null,
  date: null,
  department: null,
  category: null,
  source: {
    inputValue: "",
    value: []
  },
  paymentMethod: "",
  description: "",
  total: "",
  reconciled: false
});

export interface Status {
  submitted?: boolean;
  errors: {
    submission?: Error | ApolloError | string;
    general?: Error | ApolloError | string;
  };
}

export type FormikProps = Omit<NativeFormikProps<Values>, "status"> & {
  status: Status;
};

const UpsertEntry = function(props: UpsertEntryProps) {
  const { entryId, open, setOpen } = props;
  const isUpdate = !!entryId;

  const { loading, error: gqlError, data, client } = useQuery<
    EntryUpdateValuesQuery,
    EntryUpdateValuesQueryVariables
  >(ENTRY_UPDATE_VALUES, {
    skip: !isUpdate,
    variables: { id: entryId || "" }
  });

  const initialValues = useMemo<Values>(() => {
    if (isUpdate) {
      const journalEntry = data?.journalEntry;

      const sourceVal: Values["source"]["value"] = [];

      const src = journalEntry?.source;

      switch (src?.__typename) {
        case "Person":
          sourceVal.push(JournalEntrySourceType.Person, src);
          break;
        case "Business":
          sourceVal.push(JournalEntrySourceType.Business, src);
          break;
        case "Department":
          sourceVal.push(JournalEntrySourceType.Business);
          const ancestorDeptQueue: string[] = [];
          for (const ancestor of src.ancestors) {
            if (ancestor.__typename === "Business") {
              sourceVal.push(ancestor);
            } else {
              ancestorDeptQueue.push(ancestor.id);
            }
          }

          const bizAncestor = sourceVal[1] as SrcEntryBizOptFragment;

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

            sourceVal.push(...ancestorDepts);
          }
      }

      const total = journalEntry
        ? journalEntry.total.num / journalEntry.total.den
        : "";

      return {
        type: journalEntry?.type ?? null,
        date: moment(journalEntry?.date),
        department: journalEntry?.department ?? null,
        category: journalEntry?.category ?? null,
        source: {
          inputValue: "",
          value: sourceVal
        },
        paymentMethod: journalEntry?.paymentMethod.id ?? "",
        description: journalEntry?.description ?? "",
        total,
        reconciled: journalEntry?.reconciled ?? false
      };
    }

    return createInitialValues();
  }, [isUpdate, data]);

  const initialStatus = useMemo<Status>(
    () => ({
      submitted: false,
      errors: {
        general: gqlError
      }
    }),
    [gqlError]
  );

  const onSubmit = useCallback(
    (values: Values, formikHelpers: FormikHelpers<Values>) =>
      submit({
        values,
        formikHelpers,
        setOpen,
        client,
        initialValues,
        entryId
      }),
    [entryId, initialValues, setOpen, client]
  );

  const children = useCallback(
    (formikProps: FormikProps) => {
      return (
        <UpsertDialog
          open={open}
          isUpdate={isUpdate}
          entryId={entryId}
          setOpen={setOpen}
          loading={loading}
          formikProps={formikProps}
        />
      );
    },
    [isUpdate, entryId, setOpen, open, loading]
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      children={children}
      initialStatus={initialStatus}
      enableReinitialize
    />
  );
};

export default UpsertEntry;
