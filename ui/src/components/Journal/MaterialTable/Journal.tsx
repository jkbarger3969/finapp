import React, {
  useMemo,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import MaterialTable, {
  Column,
  Options,
  Localization,
  MaterialTableProps,
  Components,
  MTableBody,
} from "material-table";
import { useQuery, useMutation } from "@apollo/react-hooks";
import numeral from "numeral";
import moment from "moment";
import { capitalCase } from "change-case";
import Fuse from "fuse.js";
import {
  Done as DoneIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  CheckCircle as CheckCircleIcon,
} from "@material-ui/icons";
import {
  AddBox,
  ArrowDownward,
  Check,
  ChevronLeft,
  ChevronRight,
  Clear,
  DeleteOutline,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Remove,
  SaveAlt,
  Search,
  ViewColumn,
} from "@material-ui/icons";
import {
  Box,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
import { BankTransferIn, BankTransferOut } from "mdi-material-ui";
import gql from "graphql-tag";

import {
  JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntry_1Fragment as JournalEntryFragment,
  JournalEntryRefund_1Fragment as JournalEntryRefundFragment,
  JournalEntryType,
  DeptForUpsertAddQuery as DeptForUpsertAdd,
  DeptForUpsertAddQueryVariables as DeptForUpsertAddVars,
  OnEntryUpsert_1Subscription as OnEntryUpsert,
  ReconcileEntryMutation as ReconcileEntry,
  ReconcileEntryMutationVariables as ReconcileEntryVars,
  ReconcileRefundMutation as ReconcileRefund,
  ReconcileRefundMutationVariables as ReconcileRefundVars,
  DeleteEntryMutation as DeleteEntry,
  DeleteEntryMutationVariables as DeleteEntryVars,
  DeleteRefundMutation as DeleteRefund,
  DeleteRefundMutationVariables as DeleteRefundVars,
} from "../../../apollo/graphTypes";
import {
  JOURNAL_ENTRIES,
  JOURNAL_ENTRY_FRAGMENT,
} from "../Table/JournalEntries.gql";
import { JournalMode } from "../Table/Body";
import { CHECK_ID } from "../constants";
import UpsertEntry, { Values } from "../Upsert/UpsertEntry";
import { DEPT_FOR_UPSERT_ADD } from "../../Dashboard/Dashboard";
import AddRefund from "../Upsert/Refunds/AddRefund";
import UpdateRefund from "../Upsert/Refunds/UpdateRefund";
import AddEntry from "../Upsert/Entries/AddEntry";

const tableIcons = {
  Add: forwardRef<SVGSVGElement>((props, ref) => (
    <AddBox {...props} ref={ref} />
  )),
  Check: forwardRef<SVGSVGElement>((props, ref) => (
    <Check {...props} ref={ref} />
  )),
  Clear: forwardRef<SVGSVGElement>((props, ref) => (
    <Clear {...props} ref={ref} />
  )),
  Delete: forwardRef<SVGSVGElement>((props, ref) => (
    <DeleteOutline {...props} ref={ref} />
  )),
  DetailPanel: forwardRef<SVGSVGElement>((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef<SVGSVGElement>((props, ref) => (
    <Edit {...props} ref={ref} />
  )),
  Export: forwardRef<SVGSVGElement>((props, ref) => (
    <SaveAlt {...props} ref={ref} />
  )),
  Filter: forwardRef<SVGSVGElement>((props, ref) => (
    <FilterList {...props} ref={ref} />
  )),
  FirstPage: forwardRef<SVGSVGElement>((props, ref) => (
    <FirstPage {...props} ref={ref} />
  )),
  LastPage: forwardRef<SVGSVGElement>((props, ref) => (
    <LastPage {...props} ref={ref} />
  )),
  NextPage: forwardRef<SVGSVGElement>((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  PreviousPage: forwardRef<SVGSVGElement>((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef<SVGSVGElement>((props, ref) => (
    <Clear {...props} ref={ref} />
  )),
  Search: forwardRef<SVGSVGElement>((props, ref) => (
    <Search {...props} ref={ref} />
  )),
  SortArrow: forwardRef<SVGSVGElement>((props, ref) => (
    <ArrowDownward {...props} ref={ref} />
  )),
  ThirdStateCheck: forwardRef<SVGSVGElement>((props, ref) => (
    <Remove {...props} ref={ref} />
  )),
  ViewColumn: forwardRef<SVGSVGElement>((props, ref) => (
    <ViewColumn {...props} ref={ref} />
  )),
};

export type Entry =
  | JournalEntryFragment
  | (Omit<JournalEntryFragment, "__typename" | "refunds"> &
      JournalEntryRefundFragment & { refunds: string });

const entriesGen = function* (
  entry: JournalEntryFragment
): IterableIterator<Entry> {
  yield entry;
  const type =
    entry.type === JournalEntryType.Credit
      ? JournalEntryType.Debit
      : JournalEntryType.Credit;
  for (const refund of entry.refunds) {
    yield {
      ...entry,
      ...refund,
      type,
      description: refund.description || entry.description,
      refunds: entry.id,
    };
  }
};

const ON_ENTRY_UPSERT = gql`
  subscription OnEntryUpsert_1 {
    journalEntryUpserted {
      ...JournalEntry_1Fragment
      department {
        ancestors {
          ... on Department {
            __typename
            id
          }
        }
      }
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const RECONCILE_ENTRY = gql`
  mutation ReconcileEntry($id: ID!) {
    journalEntryUpdate(id: $id, fields: { reconciled: true }) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const RECONCILE_REFUND = gql`
  mutation ReconcileRefund($id: ID!) {
    journalEntryUpdateRefund(id: $id, fields: { reconciled: true }) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    journalEntryDelete(id: $id) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;
const DELETE_REFUND = gql`
  mutation DeleteRefund($id: ID!) {
    journalEntryDeleteRefund(id: $id) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const Journal = (props: {
  journalTitle?: string;
  deptId?: string;
  mode: JournalMode;
}) => {
  const { deptId = null, journalTitle = null, mode } = props;

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [updateEntryId, setUpdateEntryId] = useState<undefined | string>(
    undefined
  );

  // Add Entry
  const [addEntryOpen, setAddEntryOpen] = useState<boolean>(false);
  const addEntryOnClose = useCallback(() => void setAddEntryOpen(false), [
    setAddEntryOpen,
  ]);

  // Add Refund
  const [addRefundOpen, setAddRefundOpen] = useState<boolean>(false);
  const [addRefundToEntry, setAddRefundToEntry] = useState<string | null>(null);

  const addRefundOnClose = useCallback(() => void setAddRefundOpen(false), [
    setAddRefundOpen,
  ]);
  const addRefundOnExited = useCallback(() => void setAddRefundToEntry(null), [
    setAddRefundToEntry,
  ]);

  // Update Refund
  const [updateRefundOpen, setUpdateRefundOpen] = useState<boolean>(false);
  const [updateRefund, setUpdateRefund] = useState<{
    entryId: string;
    refundId: string;
  } | null>(null);

  const updateRefundOnClose = useCallback(
    () => void setUpdateRefundOpen(false),
    [setUpdateRefundOpen]
  );
  const updateRefundOnExited = useCallback(() => void setUpdateRefund(null), [
    setUpdateRefund,
  ]);

  // Reconcile Entry
  const [reconcileEntry, { loading: reconcilingEntry }] = useMutation<
    ReconcileEntry,
    ReconcileEntryVars
  >(RECONCILE_ENTRY);
  // Reconcile Refund
  const [reconcileRefund, { loading: reconcilingRefund }] = useMutation<
    ReconcileRefund,
    ReconcileRefundVars
  >(RECONCILE_REFUND);

  // Delete Entry
  const [deleteEntry, { loading: deletingEntry }] = useMutation<
    DeleteEntry,
    DeleteEntryVars
  >(DELETE_ENTRY);

  // Delete Refund
  const [deleteRefund, { loading: deletingRefund }] = useMutation<
    DeleteRefund,
    DeleteRefundVars
  >(DELETE_REFUND);

  const { data: deptForUpsertAdd } = useQuery<
    DeptForUpsertAdd,
    DeptForUpsertAddVars
  >(DEPT_FOR_UPSERT_ADD, {
    skip: !deptId,
    variables: { id: deptId as string },
  });

  const defaultAddDept = deptForUpsertAdd?.department;
  const initialValues = useMemo<Partial<Values> | undefined>(
    () =>
      defaultAddDept
        ? {
            department: defaultAddDept,
          }
        : undefined,
    [defaultAddDept]
  );

  const variables = useMemo<JournalEntriesQueryVars | undefined>(() => {
    return deptId
      ? {
          where: { department: { eq: deptId } },
        }
      : undefined;
  }, [deptId]);

  const { loading, error, data, subscribeToMore } = useQuery<
    JournalEntriesQuery,
    JournalEntriesQueryVars
  >(JOURNAL_ENTRIES, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const isLoading = loading && !data?.journalEntries;

  // Subscribe to updates
  useEffect(() => {
    return subscribeToMore<OnEntryUpsert>({
      document: ON_ENTRY_UPSERT,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const upsertEntry = subscriptionData.data.journalEntryUpserted;

        const ancestors = upsertEntry.department.ancestors;

        if (
          deptId &&
          upsertEntry.department.id !== deptId &&
          ancestors.every((dept) => (dept as any).id !== deptId)
        ) {
          // Filter entry out of query results if department changes.
          const journalEntriesFiltered = prev.journalEntries.filter(
            (entry) => entry.id !== upsertEntry.id
          );

          if (journalEntriesFiltered.length === prev.journalEntries.length) {
            return prev;
          }

          return Object.assign({}, prev, {
            journalEntries: journalEntriesFiltered,
          });
        }

        // Apollo will take care of updating if entry already exists in cache.
        if (prev.journalEntries.some((entry) => entry.id === upsertEntry.id)) {
          return prev;
        }

        return Object.assign({}, prev, {
          journalEntries: [upsertEntry, ...prev.journalEntries],
        });
      },
    });
  }, [deptId, subscribeToMore]);

  const columns = useMemo<Column<Entry>[]>(() => {
    const searchable = false;
    const filtering = false;
    const sorting = false;

    return [
      {
        field: "reconciled",
        title: "Reconciled",
        render: ({ reconciled }) => (reconciled ? <DoneIcon /> : null),
        customFilterAndSearch: (filter, rowData) => {
          const momentDate = moment(rowData.date);

          const search: {
            [P in keyof Omit<
              Entry,
              "id" | "__typename" | "deleted" | "lastUpdate" | "refunds"
            >]-?: string[];
          } = {
            type: [
              rowData.type === JournalEntryType.Credit ? "credit" : "debit",
            ],
            date: [
              momentDate.format("dddd, MMMM Do YYYY, h:mm:ss a"),
              momentDate.toString(),
              momentDate.format("M/d/YY"),
              momentDate.format("M/d/YYYY"),
              momentDate.format("MMM DD, YYYY"),
            ],
            description: [rowData.description || ""],
            reconciled: [rowData.reconciled ? "reconciled" : ""],
            department: [rowData.department.name],
            category: [rowData.category.name],
            paymentMethod: [
              rowData.paymentMethod.parent?.id === CHECK_ID
                ? `CK-${rowData.paymentMethod.name}`
                : rowData.paymentMethod.name,
            ],
            source: [
              (() => {
                switch (rowData.source.__typename) {
                  case "Person":
                    return `${rowData.source.name.first} ${rowData.source.name.last}`;
                  case "Business":
                    return rowData.source.bizName;
                  case "Department":
                    return rowData.source.deptName;
                }
              })(),
            ],
            total: [
              numeral(rowData.total.num / rowData.total.den).format("$0,0.00"),
            ],
          };

          const fuseResult = new Fuse([search], {
            threshold: 0.4,
            useExtendedSearch: true,
            keys: [
              "date",
              "type",
              "description",
              "reconciled",
              "department",
              "category",
              "paymentMethod",
              "source",
              "total",
            ],
          }).search(filter);
          return fuseResult.length > 0;
        },
        hidden: mode === JournalMode.Reconcile,
        filtering,
        sorting,
      },
      {
        field: "total",
        title: "Total",
        render: ({ total: { num, den } }) =>
          numeral(num / den).format("$0,0.00"),
        searchable,
        filtering,
        sorting,
      },
      {
        field: "date",
        title: "Date",
        render: ({ date }) => moment(date).format("MMM DD, YYYY"),
        searchable,
        filtering,
        sorting,
      },
      {
        field: "category",
        title: "Category",
        render: ({ category }) => capitalCase(category.name),
        searchable,
        filtering,
        sorting,
      },
      {
        field: "source",
        title: "Source",
        render: ({ source }) => {
          switch (source.__typename) {
            case "Person":
              return `${source.name.first} ${source.name.last}`;
            case "Business":
              return source.bizName;
            case "Department":
              return source.deptName;
          }
        },
        searchable,
        filtering,
        sorting,
      },
      {
        field: "paymentMethod",
        title: "Payment Method",
        render: ({ paymentMethod }) =>
          paymentMethod.parent?.id === CHECK_ID
            ? `CK-${paymentMethod.name}`
            : paymentMethod.name,
        searchable,
        filtering,
        sorting,
      },
      {
        field: "description",
        title: "Description",
        render: ({ description }) => description,
        searchable,
        filtering,
        sorting,
      },
      {
        field: "department",
        title: "Department",
        render: ({ department }) => capitalCase(department.name),
        searchable,
        filtering,
        sorting,
      },
    ];
  }, [mode]);

  const localization = useMemo<Localization>(
    () => ({
      toolbar: {
        searchTooltip: (
          <Box fontSize={12} component="span">
            [abc] | [efg] = "abc" OR "efg"
            <br />
            '[abc] = EXACTLY "abc"
            <br />
            ![abc] = NOT "abc"
            <br />
            ^[abc] = STARTS WITH "abc"
            <br />
            !^[abc] = DOES NOT START WITH "abc"
            <br />
            [abc]$ = ENDS WITH "abc"
            <br />
            ![abc]$ = DOES NOT END WITH "abc"
          </Box>
        ) as any,
        nRowsSelected: "Reconcile {0} Entry(s)",
      },
    }),
    []
  );

  const options = useMemo<Options>(
    () => ({
      rowStyle: ({ type }: Entry) => ({
        color: type === JournalEntryType.Credit ? green[900] : red[900],
      }),
      // -53px = pagination, -64px = toolbar
      maxBodyHeight: "calc(100vh - 53px - 64px)",
      headerStyle: { position: "sticky", top: 0 },
      pageSize: 25,
      pageSizeOptions: [25, 50, 100],
      showTitle: !!journalTitle,
      selection: mode === JournalMode.Reconcile,
      showSelectAllCheckbox: false,
    }),
    [journalTitle, mode]
  );

  const actions = useMemo<MaterialTableProps<Entry>["actions"]>(() => {
    if (mode === JournalMode.Reconcile) {
      return [
        {
          icon: ((props) => <CheckCircleIcon {...props} />) as any,
          tooltip: "Reconcile Selected",
          position: "toolbarOnSelect",
          iconProps: {
            color: "secondary",
            fontSize: "large",
          },
          onClick: async (event, rowData) => {
            await Promise.all(
              (Array.isArray(rowData) ? rowData : [rowData]).map(
                async (entry) => {
                  if (entry.reconciled) {
                    return;
                  }

                  try {
                    if (entry.__typename === "JournalEntryRefund") {
                      await reconcileRefund({ variables: { id: entry.id } });
                    } else {
                      await reconcileEntry({ variables: { id: entry.id } });
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }
              )
            );
          },
        },
      ];
    }

    return [
      (rowData) => {
        const isRefund = rowData.__typename === "JournalEntryRefund";
        return {
          icon: DeleteIcon as any,
          tooltip: `Delete ${isRefund ? "Refund" : "Entry"}`,
          onClick: async (event, rowData) => {
            await Promise.all(
              (Array.isArray(rowData) ? rowData : [rowData]).map(
                async (entry) => {
                  if (entry.deleted) {
                    return;
                  }

                  try {
                    if (entry.__typename === "JournalEntryRefund") {
                      await deleteRefund({ variables: { id: entry.id } });
                    } else {
                      await deleteEntry({ variables: { id: entry.id } });
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }
              )
            );
          },
        };
      },
      (rowData) => {
        const isRefund = rowData.__typename === "JournalEntryRefund";

        return {
          icon: Edit as any,
          tooltip: `Edit ${isRefund ? "Refund" : "Entry"}`,
          onClick: (event, rowData) => {
            if (isRefund) {
              setUpdateRefundOpen(true);
              setUpdateRefund({
                entryId: (rowData as Entry).refunds as string,
                refundId: (rowData as Entry).id,
              });
            } else {
              setUpdateEntryId((rowData as Entry).id);
              setUpsertOpen(true);
            }
          },
        };
      },
      (rowData) => {
        if (rowData.__typename === "JournalEntryRefund") {
          return null as any;
        }

        const isCredit = rowData.type === JournalEntryType.Credit;

        return {
          icon: ((props) =>
            isCredit ? (
              <BankTransferOut {...props} />
            ) : (
              <BankTransferIn {...props} />
            )) as any,
          tooltip: isCredit ? "Give Refund" : "Add Refund",
          iconProps: {
            style: { color: isCredit ? red[900] : green[900] },
            // color: "secondary",
            // fontSize: "large",
          } as any,
          onClick: (event, rowData) => {
            setAddRefundOpen(true);
            setAddRefundToEntry((rowData as JournalEntryFragment).id);
          },
        };
      },
      {
        icon: ((props) => <AddCircleIcon {...props} />) as any,
        iconProps: {
          color: "secondary",
          fontSize: "large",
        },
        tooltip: "Add Entry",
        isFreeAction: true,
        onClick: () => {
          setAddEntryOpen(true);
        },
      },
    ];
  }, [mode, reconcileRefund, reconcileEntry, deleteRefund, deleteEntry]);

  const components = useMemo<Components>(
    () => ({
      Body: error
        ? (props) => (
            <TableBody {...props}>
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (Array.isArray(actions) && actions.length > 0 ? 1 : 0)
                  }
                  align="left"
                >
                  <Typography align="center" color="error" variant="h4">
                    Error Loading Entries
                  </Typography>
                  <Typography variant="body1">{error.message}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          )
        : (props) => <MTableBody {...props} />,
    }),
    [error, columns, actions]
  );

  const journalEntries = data?.journalEntries || [];
  const entries = useMemo(() => {
    const filters =
      mode === JournalMode.Reconcile
        ? [(entry: Entry) => !entry.reconciled && !entry.deleted]
        : [(entry: Entry) => !entry.deleted];

    return journalEntries
      .reduce((entries: Entry[], journalEntry) => {
        for (const entry of entriesGen(journalEntry)) {
          if (filters.every((filter) => filter(entry))) {
            entries.push(entry);
          }
        }

        return entries;
      }, [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalEntries, mode]);

  return (
    <React.Fragment>
      <MaterialTable
        icons={tableIcons}
        isLoading={
          isLoading ||
          reconcilingEntry ||
          reconcilingRefund ||
          deletingEntry ||
          deletingRefund
        }
        columns={columns}
        data={entries}
        options={options}
        localization={localization}
        actions={actions}
        components={components}
        title={journalTitle ?? undefined}
      />
      <UpsertEntry
        initialValues={initialValues}
        open={upsertOpen}
        setOpen={setUpsertOpen}
        entryId={updateEntryId}
      />
      <AddEntry open={addEntryOpen} onClose={addEntryOnClose} />
      <AddRefund
        entryId={addRefundToEntry}
        open={addRefundOpen}
        onClose={addRefundOnClose}
        onExited={addRefundOnExited}
      />
      <UpdateRefund
        entryId={updateRefund?.entryId ?? null}
        refundId={updateRefund?.refundId ?? null}
        open={updateRefundOpen}
        onClose={updateRefundOnClose}
        onExited={updateRefundOnExited}
      />
    </React.Fragment>
  );
};

export default Journal;
