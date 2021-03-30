import React, {
  useMemo,
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
  QueryResult,
  Query as MTQuery,
  MTableBodyRow,
  Action,
} from "material-table";
import { useQuery, useMutation } from "@apollo/client";
import numeral from "numeral";
import { capitalCase } from "change-case";
import Fuse from "fuse.js";
import {
  Done as DoneIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from "@material-ui/icons";
import {
  Box,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconProps,
} from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
import {
  BankTransferIn as BankTransferInIcon,
  BankTransferOut as BankTransferOutIcon,
  FileTree as FileTreeIcon,
  FileTreeOutline as FileTreeOutlineIcon,
} from "mdi-material-ui";
import gql from "graphql-tag";
import { format, startOfDay } from "date-fns";
import Fraction from "fraction.js";
import "mingo/init/system"; // Loads all operators.  Should config later.
import { Aggregator } from "mingo/aggregator";
import * as Papa from "papaparse";
import { saveAs } from "file-saver";

import {
  Entries_1Query as EntriesQuery,
  Entries_1QueryVariables as EntriesQueryVars,
  Entry_1Fragment as EntryFragment,
  EntryRefund_1Fragment as EntryRefundFragment,
  EntryType,
  OnEntryUpsert_1Subscription as OnEntryUpsert,
  ReconcileEntryMutation as ReconcileEntry,
  ReconcileEntryMutationVariables as ReconcileEntryVars,
  ReconcileRefundMutation as ReconcileRefund,
  ReconcileRefundMutationVariables as ReconcileRefundVars,
  FiscalYear,
} from "../../../apollo/graphTypes";
import { deserializeRational } from "../../../apollo/scalars";
import { JOURNAL_ENTRIES, JOURNAL_ENTRY_FRAGMENT } from "./Entries.gql";
import { CHECK_ID } from "../constants";
import tableIcons from "../../utils/materialTableIcons";
import AddRefund from "../Upsert/Refunds/AddRefund";
import UpdateRefund from "../Upsert/Refunds/UpdateRefund";
import AddEntry from "../Upsert/Entries/AddEntry";
import UpdateEntry from "../Upsert/Entries/UpdateEntry";
import DeleteEntry from "../Upsert/Entries/DeleteEntry";
import DeleteRefund from "../Upsert/Refunds/DeleteRefund";
import ItemsTable from "./Items";
import ReconciledFilter from "./FilterFields/Reconciled";
import CategoryFilter from "./FilterFields/Category";
import PaymentMethodFilter from "./FilterFields/PaymentMethod";
import DepartmentFilter from "./FilterFields/Department";
import SourceFilter from "./FilterFields/Source";
import DateFilter from "./FilterFields/Date";
import TotalFilter from "./FilterFields/Total";
import "../../../utils/mingoUtils";

export enum JournalMode {
  View,
  Reconcile,
}

export type Entry =
  | EntryFragment
  | (Omit<EntryFragment, "__typename" | "refunds"> &
      EntryRefundFragment & { refunds: string });

const entriesGen = function* (
  entries: Iterable<EntryFragment>
): IterableIterator<Entry> {
  for (const entry of entries) {
    yield entry;
    const refundType =
      entry.type === EntryType.Credit ? EntryType.Debit : EntryType.Credit;
    for (const refund of entry.refunds) {
      yield {
        ...entry,
        ...refund,
        type: refundType,
        description: refund.description || entry.description,
        refunds: entry.id,
      };
    }
  }
};

export const CLEAR_FILTER = Symbol();

const ON_ENTRY_UPSERT = gql`
  subscription OnEntryUpsert_1 {
    entryUpserted {
      ...Entry_1Fragment
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
    entryUpdate(id: $id, fields: { reconciled: true }) {
      ...Entry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const RECONCILE_REFUND = gql`
  mutation ReconcileRefund($id: ID!) {
    entryUpdateRefund(id: $id, fields: { reconciled: true }) {
      ...Entry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

const Journal = (props: {
  journalTitle?: string;
  deptId?: string;
  fiscalYearId?: string;
  mode: JournalMode;
}): JSX.Element => {
  const {
    journalTitle = null,
    deptId = null,
    fiscalYearId = null,
    mode,
  } = props;

  // Add Entry
  const [addEntryOpen, setAddEntryOpen] = useState<boolean>(false);
  const addEntryOnClose = useCallback(() => void setAddEntryOpen(false), [
    setAddEntryOpen,
  ]);

  // Update Entry
  const [updateEntryOpen, setUpdateEntryOpen] = useState<boolean>(false);
  const [updateEntry, setUpdateEntry] = useState<string | null>(null);

  const updateEntryOnClose = useCallback(() => void setUpdateEntryOpen(false), [
    setUpdateEntryOpen,
  ]);
  const updateEntryOnExited = useCallback(() => void setUpdateEntry(null), [
    setUpdateEntry,
  ]);

  // Delete Entry
  const [deleteEntry, setDeleteEntry] = useState<string | null>(null);
  const deleteEntryOnClose = useCallback(() => void setDeleteEntry(null), [
    setDeleteEntry,
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

  // Delete Refund
  const [deleteRefund, setDeleteRefund] = useState<string | null>(null);
  const deleteRefundOnClose = useCallback(() => void setDeleteRefund(null), [
    setDeleteRefund,
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

  const variables = useMemo<EntriesQueryVars | undefined>(() => {
    if (deptId && fiscalYearId) {
      return {
        where: {
          department: { eq: { id: deptId, matchDescendants: true } },
          fiscalYear: {
            eq: fiscalYearId,
          },
        },
      };
    } else if (deptId) {
      return {
        where: { department: { eq: { id: deptId, matchDescendants: true } } },
      };
    } else if (fiscalYearId) {
      return {
        where: {
          fiscalYear: {
            eq: fiscalYearId,
          },
        },
      };
    }
    return undefined;
  }, [deptId, fiscalYearId]);

  const { loading, error, data, subscribeToMore } = useQuery<
    EntriesQuery,
    EntriesQueryVars
  >(JOURNAL_ENTRIES, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const isLoading = loading && !data?.entries;

  const fiscalYear = useMemo<null | FiscalYear>(
    () =>
      (data?.fiscalYears || []).find(
        (fiscalYear) => fiscalYear.id === fiscalYearId
      ) ?? null,
    [fiscalYearId, data]
  );

  // Subscribe to updates
  useEffect(() => {
    return subscribeToMore<OnEntryUpsert>({
      document: ON_ENTRY_UPSERT,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const upsertEntry = subscriptionData.data.entryUpserted;

        const ancestors = upsertEntry.department.ancestors;

        if (
          deptId &&
          upsertEntry.department.id !== deptId &&
          ancestors.every(
            (dept) => dept.__typename === "Department" && dept.id !== deptId
          )
        ) {
          // Filter entry out of query results if department changes.
          const entriesFiltered = prev.entries.filter(
            (entry) => entry.id !== upsertEntry.id
          );

          return Object.assign({}, prev, {
            entries: entriesFiltered,
          });
        }

        if (fiscalYear) {
          const date = upsertEntry.dateOfRecord?.overrideFiscalYear
            ? new Date(upsertEntry.dateOfRecord.date)
            : new Date(upsertEntry.date);

          if (
            date < new Date(fiscalYear.begin) ||
            date >= new Date(fiscalYear.end)
          ) {
            // Filter entry out of query results if fiscal year changes.
            const entriesFiltered = prev.entries.filter(
              (entry) => entry.id !== upsertEntry.id
            );
            return Object.assign({}, prev, {
              entries: entriesFiltered,
            });
          }
        }

        // Apollo will take care of updating if entry already exists in cache.
        if (prev.entries.some((entry) => entry.id === upsertEntry.id)) {
          return prev;
        }

        return Object.assign({}, prev, {
          entries: [upsertEntry, ...prev.entries],
        });
      },
    });
  }, [deptId, fiscalYear, subscribeToMore]);

  const rawEntries = data?.entries || [];

  const [entries, filterOptions] = useMemo(() => {
    const filterOptions = {
      category: new Map<string, Entry["category"]>(),
      paymentMethod: new Map<string, Entry["paymentMethod"]>(),
      source: new Map<string, Entry["source"]>(),
      department: new Map<string, Entry["department"]>(),
    };

    const entries: Entry[] = [];

    for (const entry of entriesGen(rawEntries)) {
      if (
        entry.deleted ||
        (mode === JournalMode.Reconcile && entry.reconciled)
      ) {
        continue;
      }

      filterOptions.category.set(entry.category.id, entry.category);
      filterOptions.department.set(entry.department.id, entry.department);
      filterOptions.paymentMethod.set(
        entry.paymentMethod.id,
        entry.paymentMethod
      );
      filterOptions.source.set(
        `${entry.source.__typename}-${entry.source.id}`,
        entry.source
      );

      entries.push(entry);
    }

    return [
      entries,
      {
        category: [...filterOptions.category.values()],
        department: [...filterOptions.department.values()],
        // Do not include individual check numbers
        paymentMethod: [...filterOptions.paymentMethod.values()].filter(
          (p) => p.parent?.id !== "5dc46d0af74afb2c2805bd54"
        ),
        source: [...filterOptions.source.values()],
      },
    ] as const;
  }, [rawEntries, mode]);

  const columns = useMemo<Column<Entry>[]>(() => {
    return [
      {
        field: "reconciled",
        title: "Reconciled",
        // eslint-disable-next-line react/display-name, react/prop-types
        render: ({ reconciled }) => (reconciled ? <DoneIcon /> : null),
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <ReconciledFilter
            setFilter={(filter) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "0", filter)
            }
          />
        ),
        hidden: mode === JournalMode.Reconcile,
        filtering: true,
      },
      {
        field: "total",
        title: "Total",
        render: ({ total }) =>
          numeral(deserializeRational(total).valueOf()).format("$0,0.00"),
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <TotalFilter
            setFilter={(filter) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "1", filter);
            }}
          />
        ),
      },
      {
        field: "date",
        title: "Date",
        render: ({ date }) => format(new Date(date), "MMM dd, yyyy"),
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <DateFilter
            setFilter={(filter) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "2", filter);
            }}
          />
        ),
        defaultSort: "desc",
      },
      {
        field: "dateOfRecord",
        title: "Date Of record",
        render: ({ date, dateOfRecord }) =>
          format(new Date(dateOfRecord?.date || date), "MMM dd, yyyy"),
        searchable: false,
        filtering: false,
        sorting: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        // filterComponent: ({ columnDef, onFilterChanged }) => (
        //   <DateFilter
        //     setFilter={(filter) => {
        //       // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
        //       onFilterChanged((columnDef as any).tableData?.id ?? "2", filter);
        //     }}
        //   />
        // ),
        // defaultSort: "desc",
      },
      {
        field: "category",
        title: "Category",
        render: (data, type) => {
          const name =
            type === "group"
              ? ((data as unknown) as EntryFragment["category"]).name
              : data.category.name;
          return capitalCase(name);
        },
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <CategoryFilter
            options={filterOptions.category}
            setFilter={(filter) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "3", filter)
            }
          />
        ),
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
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <SourceFilter
            options={filterOptions.source}
            setFilter={(filter) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "4", filter)
            }
          />
        ),
      },
      {
        field: "paymentMethod",
        title: "Payment Method",
        render: ({ paymentMethod }) =>
          paymentMethod.parent?.id === CHECK_ID
            ? `CK-${paymentMethod.name}`
            : paymentMethod.name,
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <PaymentMethodFilter
            options={filterOptions.paymentMethod}
            setFilter={(filter) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "5", filter)
            }
          />
        ),
      },
      {
        field: "description",
        title: "Description",
        render: ({ description }) => description,
        searchable: false,
        filtering: false,
        sorting: false,
      },
      {
        field: "department",
        title: "Department",
        render: ({ department }) => capitalCase(department.name),
        searchable: false,
        // eslint-disable-next-line react/display-name, react/prop-types
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <DepartmentFilter
            options={filterOptions.department}
            setFilter={(filter) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/prop-types
              onFilterChanged((columnDef as any).tableData?.id ?? "5", filter)
            }
          />
        ),
      },
    ];
  }, [
    filterOptions.category,
    filterOptions.department,
    filterOptions.paymentMethod,
    filterOptions.source,
    mode,
  ]);

  const localization = useMemo<Localization>(
    () => ({
      toolbar: {
        searchTooltip: (
          <Box fontSize={12} component="span">
            {`[abc] | [efg] = "abc" OR "efg"`}
            <br />
            {`'[abc] = EXACTLY "abc"`}
            <br />
            {`![abc] = NOT "abc"`}
            <br />
            {`^[abc] = STARTS WITH "abc"`}
            <br />
            {`!^[abc] = DOES NOT START WITH "abc"`}
            <br />
            {`[abc]$ = ENDS WITH "abc"`}
            <br />
            {`![abc]$ = DOES NOT END WITH "abc"`}
          </Box> // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any,
        nRowsSelected: "Reconcile {0} Entry(s)",
      },
    }),
    []
  );

  const [totalCount, setTotalCount] = useState(0);

  const options = useMemo<Options>(
    () => ({
      rowStyle: (data: Entry) => {
        const style = {} as React.CSSProperties;

        style.color = data.type === EntryType.Credit ? green[900] : red[900];

        return style;
      },
      maxBodyHeight: "calc(100vh - 53px - 64px)",
      headerStyle: { position: "sticky", top: 0 },
      pageSize: 25,
      pageSizeOptions: totalCount ? [25, 50, 100, totalCount] : [25, 50, 100],
      showTitle: !!journalTitle,
      selection: mode === JournalMode.Reconcile,
      showSelectAllCheckbox: false,
      debounceInterval: 500,
      emptyRowsWhenPaging: false,
      columnsButton: true,
      filtering: true,
      sorting: true,
      thirdSortClick: false,
      exportAllData: true,
      exportButton: true,
      exportFileName: journalTitle || "lsccBudgetTracking",
      exportCsv: (columns: Column<Entry>[], renderData: Entry[]) => {
        const csv = Papa.unparse(
          renderData.reduce((entries, entry) => {
            entries.push(
              columns.reduce((fEntry, { field, title, render }) => {
                switch (field) {
                  case "reconciled":
                  case "date":
                    fEntry[(title || field) as string] = entry[field];
                    break;
                  default:
                    fEntry[(title || field) as string] = render
                      ? render(entry, "row")
                      : (((entry as unknown) as Record<string, unknown>)[
                          (field as unknown) as string
                        ] as unknown);
                }
                return fEntry;
              }, {} as Record<string, unknown>)
            );
            return entries;
          }, [] as Record<string, unknown>[])
        );
        saveAs(
          new Blob([csv], { type: "text/plain;charset=utf-8" }),
          `${journalTitle || "budgetTracking"}.csv`
        );
      },
    }),

    [journalTitle, mode, totalCount]
  );

  const actions = useMemo<MaterialTableProps<Entry>["actions"]>(() => {
    if (mode === JournalMode.Reconcile) {
      return [
        {
          icon: ((props: Record<string, unknown>) => (
            <CheckCircleIcon {...props} />
          )) as Action<Entry>["icon"],
          tooltip: "Reconcile Selected",
          position: "toolbarOnSelect",
          iconProps: {
            color: "secondary",
            fontSize: "large",
          },
          onClick: async (event: unknown, rowData: Entry | unknown) => {
            await Promise.all(
              (Array.isArray(rowData) ? rowData : [rowData]).map(
                async (entry) => {
                  if (entry.reconciled) {
                    return;
                  }

                  try {
                    if (entry.__typename === "EntryRefund") {
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
        const { tooltip, onClick } = (() => {
          switch (rowData.__typename) {
            case "Entry":
              return {
                tooltip: "Delete Entry",
                onClick: (event: unknown, rowData: Entry | unknown) =>
                  setDeleteEntry((rowData as Entry).id),
              };
            // case "EntryItem":
            //   return {
            //     tooltip: "Delete Item",
            //     onClick: (event:unknown, rowData:Entry | unknown) => {
            //       // setDeleteItem((rowData as Entry).id)
            //     },
            //   };
            case "EntryRefund":
              return {
                tooltip: "Delete Refund",
                onClick: (event: unknown, rowData: Entry | unknown) =>
                  setDeleteRefund((rowData as Entry).id),
              };
          }
        })();

        return {
          icon: DeleteIcon as Action<Entry>["icon"],
          tooltip,
          onClick,
        };
      },
      (rowData) => {
        const { tooltip, onClick } = (() => {
          switch (rowData.__typename) {
            case "Entry":
              return {
                tooltip: "Edit Entry",
                onClick: (event: unknown, rowData: Entry | unknown) => {
                  setUpdateEntryOpen(true);
                  setUpdateEntry((rowData as Entry).id);
                },
              };
            // case "EntryItem":
            //   return {
            //     tooltip: "Edit Item",
            //     onClick: (event:unknown, rowData:Entry | unknown) => {
            //       setUpdateItemOpen(true);
            //       setUpdateItem({
            //         entryId: (rowData as Entry).items as string,
            //         itemId: (rowData as Entry).id,
            //       });
            //     },
            //   };
            case "EntryRefund":
              return {
                tooltip: "Edit Refund",
                onClick: (event: unknown, rowData: Entry | unknown) => {
                  setUpdateRefundOpen(true);
                  setUpdateRefund({
                    entryId: (rowData as Entry).refunds as string,
                    refundId: (rowData as Entry).id,
                  });
                },
              };
          }
        })();

        return {
          icon: EditIcon as Action<Entry>["icon"],
          tooltip,
          onClick,
        };
      },
      (rowData) => {
        if (rowData.__typename !== "Entry") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return null as any;
        }

        const isCredit = rowData.type === EntryType.Credit;

        return {
          icon: ((props: Record<string, unknown>) =>
            isCredit ? (
              <BankTransferOutIcon {...props} />
            ) : (
              <BankTransferInIcon {...props} />
            )) as Action<Entry>["icon"],
          tooltip: isCredit ? "Give Refund" : "Add Refund",
          iconProps: {
            style: { color: isCredit ? red[900] : green[900] },
            // color: "secondary",
            // fontSize: "large",
          } as IconProps,
          onClick: (event: unknown, rowData: Entry | unknown) => {
            setAddRefundOpen(true);
            setAddRefundToEntry((rowData as EntryFragment).id);
          },
        };
      },
      {
        icon: ((props: Record<string, unknown>) => (
          <AddCircleIcon {...props} />
        )) as Action<Entry>["icon"],
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
  }, [mode, reconcileRefund, reconcileEntry, setDeleteRefund, setDeleteEntry]);

  // https://github.com/mbrn/material-table/issues/563
  const detailPanelState = useMemo(() => new Map<string, unknown>(), []);

  const components = useMemo<Components>(
    () => ({
      Body: error
        ? (props: Record<string, unknown>) => (
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
        : (props: Record<string, unknown>) => <MTableBody {...props} />,
      Row: function RowDetailPanelHack(p: Record<string, unknown>) {
        const props = {
          ...p,
          onToggleDetailPanel: (
            path: unknown,
            render: unknown,
            ...args: unknown[]
          ) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (detailPanelState.has((p.data as any).id)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              detailPanelState.delete((p.data as any).id);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              detailPanelState.set((p.data as any).id, render);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (p.onToggleDetailPanel as any)(path, render, ...args);
          },
        };
        return <MTableBodyRow {...props} />;
      },
    }),
    [error, columns.length, actions, detailPanelState]
  );

  const detailPanel = useMemo<
    NonNullable<MaterialTableProps<Entry>["detailPanel"]>
  >(
    () => [
      (rowData) => {
        const isEntry = rowData.__typename === "Entry";
        const hasItems = isEntry ? rowData.items.length > 0 : false;
        return {
          icon: (props: Record<string, unknown>) =>
            isEntry ? (
              hasItems ? (
                <FileTreeIcon {...props} />
              ) : (
                <FileTreeOutlineIcon {...props} />
              )
            ) : null,
          // eslint-disable-next-line react/display-name
          openIcon: (props: Record<string, unknown>) =>
            hasItems ? (
              <FileTreeIcon {...props} color="primary" />
            ) : (
              <FileTreeOutlineIcon {...props} color="primary" />
            ),
          disabled: !isEntry,
          tooltip: isEntry ? "Itemize" : undefined,
          // eslint-disable-next-line react/display-name
          render: (rowData) => {
            if (rowData.__typename !== "Entry") {
              return null;
            }
            return <ItemsTable entry={rowData} />;
          },
        };
      },
    ],
    []
  );

  const [aggregate, setAggregate] = useState<Fraction>(new Fraction(0));

  const title = useMemo(() => {
    const year = fiscalYear?.name ? `${fiscalYear?.name} ` : "";

    const compare = aggregate.compare(new Fraction(0));

    const aggregateSpan = (
      <Box
        color={compare === 0 ? undefined : compare > 0 ? green[900] : red[900]}
        component="span"
      >
        {numeral(aggregate.valueOf()).format("$0,0.00")}
      </Box>
    );

    if (journalTitle) {
      return (
        <Typography variant="h6">
          {`${year}${journalTitle}: `}
          {aggregateSpan}
        </Typography>
      );
    }
    return (
      <Typography variant="h6">
        {year}
        {aggregateSpan}
      </Typography>
    );
  }, [fiscalYear, aggregate, journalTitle]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableRef = useRef<any>(null);

  const mTData = useCallback(
    async (query: MTQuery<Entry>): Promise<QueryResult<Entry>> => {
      const { filters, page, pageSize, orderBy, orderDirection } = query;

      const search = query.search?.trim();

      const collection = (() => {
        if (!search) {
          return entries;
        }

        return new Fuse(entries, {
          keys: [
            "date",
            "total",
            "description",
            "department",
            "category",
            "paymentMethod",
            "source",
          ],
          threshold: 0.4,
          useExtendedSearch: true,
          getFn: (entry, key) => {
            return (Array.isArray(key) ? key : [key]).reduce((values, key) => {
              switch (key) {
                case "date": {
                  const date = new Date(entry.date);

                  values.push(
                    entry.date,
                    format(date, "M/d/yy"),
                    format(date, "MM/d/yy"),
                    format(date, "M/d/yyyy"),
                    format(date, "MM/d/yyyy"),
                    format(date, "MMM dd, yyyy")
                  );
                  break;
                }
                case "total": {
                  const total = deserializeRational(entry.total).valueOf();

                  values.push(
                    numeral(total).format("$0,0.00"),
                    total.toFixed(2)
                  );
                  break;
                }
                case "description":
                  values.push(entry.description?.trim() || "");
                  break;
                case "department":
                  values.push(entry.department.name);
                  break;
                case "category":
                  values.push(entry.category.name);
                  break;
                case "paymentMethod":
                  values.push(entry.paymentMethod.name);
                  break;
                case "source":
                  switch (entry.source.__typename) {
                    case "Person":
                      values.push(
                        entry.source.name.first,
                        entry.source.name.last
                      );
                      break;
                    case "Business":
                      values.push(entry.source.bizName);
                      break;
                    case "Department":
                      values.push(entry.source.deptName);
                      break;
                  }
                  break;
                default:
                  break;
              }
              return values;
            }, [] as string[]);
          },
        })
          .search(search)
          .map((result) => result.item);
      })();

      const pipeline: Record<string, unknown>[] = [];

      const $match = { $and: [] as Record<string, unknown>[] };

      if (filters.length > 0) {
        const { $and } = $match;
        for (const filter of filters) {
          if (Object.keys(filter.value).length > 0) {
            $and.push(filter.value);
          }
          // Object.assign($match, filter.value ?? {});
        }
      }

      if ($match.$and.length > 0) {
        pipeline.push(
          // Convert fields for filtering
          {
            $addFields: {
              // Cache date as string
              _dateStr_: "$date",
              date: {
                $expressionCb: (obj: Entry) => startOfDay(new Date(obj.date)),
              },
              // Cache total as rational
              _totalRational_: "$total",
              total: {
                $expressionCb: (obj: Entry) =>
                  deserializeRational(obj.total).valueOf(),
              },
            },
          },
          { $match },
          // Replace with original values from cached keys
          {
            $addFields: {
              date: "$_dateStr_",
              total: "$_totalRational_",
            },
          },
          // Remove cache keys
          {
            $project: {
              _dateStr_: false,
              _totalRational_: false,
            },
          }
        );
      }

      const $facet = {
        data: [] as Record<string, unknown>[],
        raw: [],
      };

      // Sorting
      if (orderBy) {
        const { field } = orderBy;

        switch (field) {
          case "date":
            $facet.data.push({
              $addFields: {
                _sortBy_: { $toDate: "$date" },
              },
            });
            break;
          case "total":
            $facet.data.push({
              $addFields: {
                _sortBy_: {
                  $expressionCb: (entry: Entry) =>
                    deserializeRational(entry.total).valueOf(),
                },
              },
            });
            break;
          case "reconciled":
            $facet.data.push({
              $addFields: {
                _sortBy_: "$reconciled",
              },
            });
            break;
          case "department":
            $facet.data.push({
              $addFields: {
                _sortBy_: "$department.name",
              },
            });
            break;
          case "category":
            $facet.data.push({
              $addFields: {
                _sortBy_: "$category.name",
              },
            });
            break;
          case "paymentMethod":
            $facet.data.push({
              $addFields: {
                _sortBy_: "$paymentMethod.name",
              },
            });
            break;
          case "source":
            // var t:Entry;
            $facet.data.push({
              $addFields: {
                _sortBy_: {
                  $cond: {
                    if: {
                      $eq: [{ $ifNull: ["$source.name.first", null] }, null],
                    },
                    then: "$source.name",
                    else: {
                      $concat: ["$source.name.first", " ", "$source.name.last"],
                    },
                  },
                },
              },
            });
            break;
          default:
            $facet.data.push({
              $addFields: {
                _sortBy_: { $toDate: "$date" },
              },
            });
        }

        $facet.data.push(
          {
            $sort: {
              _sortBy_: orderDirection === "asc" ? 1 : -1,
            },
          },
          {
            $project: { _sortBy_: false },
          }
        );
      }

      // paging
      $facet.data.push({ $skip: page * pageSize }, { $limit: pageSize });

      pipeline.push({ $facet });

      const [result] = new Aggregator(pipeline).run(collection);

      // https://github.com/mbrn/material-table/issues/563
      const data = (result.data as Entry[]).map((entry: Entry) => {
        if (detailPanelState.has(entry.id)) {
          return {
            ...entry,
            tableData: {
              showDetailPanel: detailPanelState.get(entry.id),
            },
          } as unknown;
        }

        return entry;
      }) as Entry[];

      const raw = result.raw as unknown[];

      // Cleanup detailPanelState
      // https://github.com/mbrn/material-table/issues/563
      (() => {
        const copyShowDetailPanel = new Map(detailPanelState);
        detailPanelState.clear();
        for (const { id } of raw as Entry[]) {
          if (copyShowDetailPanel.has(id)) {
            detailPanelState.set(id, copyShowDetailPanel.get(id));
          }
        }
      })();

      const totalCount = raw.length;

      const newAggregate = (() => {
        let newAggregate = new Fraction(0);

        for (const entry of raw as Entry[]) {
          if (entry.deleted) {
            continue;
          }

          let entryTotal = deserializeRational(entry.total);

          // BUG Story ID: CH58
          // Itemization Adjustments
          if (deptId) {
            for (const item of entry.items) {
              if (
                item.deleted ||
                !item.department ||
                item.department.id === deptId ||
                item.department.ancestors.some(
                  (dept) =>
                    dept.__typename === "Department" && dept.id === deptId
                )
              ) {
                continue;
              }

              // Item has been applied to another department budget.
              entryTotal = entryTotal.sub(deserializeRational(item.total));
            }
          }

          if (entry.type === EntryType.Credit) {
            newAggregate = newAggregate.add(entryTotal);
          } else {
            newAggregate = newAggregate.sub(entryTotal);
          }
        }

        return newAggregate;
      })();

      if (aggregate.compare(newAggregate) !== 0) {
        setAggregate(newAggregate);
      }
      setTotalCount(totalCount);
      return {
        data,
        page,
        totalCount,
      };
    },
    [aggregate, deptId, entries, detailPanelState, setTotalCount]
  );

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.onQueryChange(null);
    }
  }, [tableRef, entries]);
  return (
    <React.Fragment>
      <MaterialTable
        icons={tableIcons}
        isLoading={isLoading || reconcilingEntry || reconcilingRefund}
        columns={columns}
        data={mTData}
        options={options}
        localization={localization}
        actions={actions}
        components={components}
        title={title}
        detailPanel={detailPanel}
        tableRef={tableRef}
      />
      <AddEntry deptId={deptId} open={addEntryOpen} onClose={addEntryOnClose} />
      <UpdateEntry
        entryId={updateEntry}
        open={updateEntryOpen}
        onClose={updateEntryOnClose}
        onExited={updateEntryOnExited}
      />
      <DeleteEntry entryId={deleteEntry} onClose={deleteEntryOnClose} />
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
      <DeleteRefund refundId={deleteRefund} onClose={deleteRefundOnClose} />
    </React.Fragment>
  );
};

export default Journal;
