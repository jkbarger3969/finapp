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
} from "material-table";
import { useQuery, useMutation } from "@apollo/react-hooks";
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
} from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
import {
  BankTransferIn as BankTransferInIcon,
  BankTransferOut as BankTransferOutIcon,
  FileTree as FileTreeIcon,
  FileTreeOutline as FileTreeOutlineIcon,
} from "mdi-material-ui";
import gql from "graphql-tag";
import { format } from "date-fns";
import Fraction from "fraction.js";
import { filter as iterableFilter } from "iterable-fns";
import sift, { Query } from "sift";
import { U, Any } from "ts-toolbelt";
import "mingo/init/system"; // Loads all operators.  Should config later.
import { Aggregator } from "mingo/aggregator";
import "../../../utils/mingoUtils";

import {
  JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntry_1Fragment as JournalEntryFragment,
  JournalEntryRefund_1Fragment as JournalEntryRefundFragment,
  JournalEntryType,
  OnEntryUpsert_1Subscription as OnEntryUpsert,
  ReconcileEntryMutation as ReconcileEntry,
  ReconcileEntryMutationVariables as ReconcileEntryVars,
  ReconcileRefundMutation as ReconcileRefund,
  ReconcileRefundMutationVariables as ReconcileRefundVars,
} from "../../../apollo/graphTypes";
import { JOURNAL_ENTRIES, JOURNAL_ENTRY_FRAGMENT } from "./JournalEntries.gql";
import { CHECK_ID } from "../constants";
import tableIcons from "../../utils/materialTableIcons";
import AddRefund from "../Upsert/Refunds/AddRefund";
import UpdateRefund from "../Upsert/Refunds/UpdateRefund";
import AddEntry from "../Upsert/Entries/AddEntry";
import UpdateEntry from "../Upsert/Entries/UpdateEntry";
import DeleteEntry from "../Upsert/Entries/DeleteEntry";
import DeleteRefund from "../Upsert/Refunds/DeleteRefund";
import ItemsTable from "./Items";
import { rationalToFraction } from "../../../utils/rational";
import ReconciledFilter from "./FilterFields/Reconciled";
import CategoryFilter from "./FilterFields/Category";

export enum JournalMode {
  View,
  Reconcile,
}

export type Entry =
  | JournalEntryFragment
  | (Omit<JournalEntryFragment, "__typename" | "refunds"> &
      JournalEntryRefundFragment & { refunds: string });

const entriesGen = function* (
  entries: Iterable<JournalEntryFragment>
): IterableIterator<Entry> {
  for (const entry of entries) {
    yield entry;
    const refundType =
      entry.type === JournalEntryType.Credit
        ? JournalEntryType.Debit
        : JournalEntryType.Credit;
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

export type EntryFilter = U.Exclude<Query<Entry>, RegExp>;

export const CLEAR_FILTER = Symbol();

const useFilters = (defaultFilters: EntryFilter = {}) => {
  const [filters, setFilters] = useState<EntryFilter>({
    ...defaultFilters,
  });

  return [
    filters,
    useCallback(
      (updateFilters: EntryFilter) => {
        const newFilter = { ...(filters as any), ...(updateFilters as any) };

        for (const key of Object.keys(newFilter)) {
          if (newFilter[key] === CLEAR_FILTER) {
            delete newFilter[key];
          }
        }

        setFilters(newFilter);
      },
      [filters, setFilters]
    ),
  ] as const;
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

const Journal = (props: {
  journalTitle?: string;
  deptId?: string;
  mode: JournalMode;
  defaultFilter?: EntryFilter;
}) => {
  const {
    deptId = null,
    journalTitle = null,
    mode,
    defaultFilter = {},
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

  // Filters
  const [filter, setFilter] = useFilters({
    deleted: false,
    ...defaultFilter,
    ...(mode === JournalMode.Reconcile ? { reconciled: false } : {}),
  });

  const variables = useMemo<JournalEntriesQueryVars | undefined>(() => {
    return deptId
      ? {
          where: { department: { eq: deptId, matchDecedentTree: true } },
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

  const journalEntries = data?.journalEntries || [];

  // https://github.com/mbrn/material-table/issues/563
  const entryState = useRef(
    new Map<string, Entry & { tableData?: any; showDetailPanel?: any }>()
  );

  const [entries, filterOptions] = useMemo(() => {
    const filterOptions = {
      category: new Map<string, Entry["category"]>(),
    };

    const entries: Entry[] = [];

    for (let entry of entriesGen(journalEntries)) {
      if (
        entry.deleted ||
        (mode === JournalMode.Reconcile && entry.reconciled)
      ) {
        continue;
      }

      filterOptions.category.set(entry.category.id, entry.category);

      entries.push(entry);
    }

    return [
      entries,
      {
        category: [...filterOptions.category.values()],
      },
    ] as const;
  }, [journalEntries, mode]);

  const columns = useMemo<Column<Entry>[]>(() => {
    return [
      {
        field: "reconciled",
        title: "Reconciled",
        render: ({ reconciled }) => (reconciled ? <DoneIcon /> : null),
        sorting: true,
        searchable: false,
        filterComponent: () => (
          <ReconciledFilter filter={filter} setFilter={setFilter} />
        ),
        customSort: () => 0,
        /* customSort: (
          { reconciled: reconciledA },
          { reconciled: reconciledB }
        ) => {
          return +reconciledA - +reconciledB;
        }, */
        // customFilterAndSearch: (filter, { reconciled }) => {
        //   if (reconciled) {
        //     return (
        //       ((filter as string) || "").trim().toLowerCase() === "reconciled"
        //     );
        //   }
        //   return (
        //     ((filter as string) || "").trim().toLowerCase() === "!reconciled"
        //   );
        // },
        hidden: mode === JournalMode.Reconcile,
        filtering: true,
      },
      {
        field: "total",
        title: "Total",
        render: ({ total }) =>
          numeral(rationalToFraction(total).valueOf()).format("$0,0.00"),
        searchable: false,
        filtering: false,
        sorting: true,
        customSort: () => 0,
        // customFilterAndSearch: (filter, { total }) => {
        //   const totalDec = rationalToFraction(total).valueOf();
        //   return (
        //     new Fuse(
        //       [
        //         {
        //           total: [
        //             numeral(totalDec).format("$0,0.00"),
        //             totalDec.toFixed(2),
        //           ],
        //         },
        //       ],
        //       {
        //         threshold: 0.4,
        //         useExtendedSearch: true,
        //         keys: ["total"],
        //       }
        //     ).search(filter).length > 0
        //   );
        // },
      },
      {
        field: "date",
        title: "Date",
        render: ({ date }) => format(new Date(date), "MMM dd, yyyy"),
        searchable: false,
        filtering: false,
        sorting: true,
        defaultSort: "desc",
        customSort: () => 0,
        // ({ date: dateA }, { date: dateB }) => {
        //   return new Date(dateA).getTime() - new Date(dateB).getTime();
        // },
        // customFilterAndSearch: (filter, { date: dateStr }) => {
        //   const date = new Date(dateStr);

        //   return (
        //     new Fuse(
        //       [
        //         {
        //           date: [
        //             dateStr,
        //             format(date, "M/d/yy"),
        //             format(date, "MM/d/yy"),
        //             format(date, "M/d/yyyy"),
        //             format(date, "MM/d/yyyy"),
        //             format(date, "MMM dd, yyyy"),
        //           ],
        //         },
        //       ],
        //       {
        //         threshold: 0.4,
        //         useExtendedSearch: true,
        //         keys: ["date"],
        //       }
        //     ).search(filter).length > 0
        //   );
        // },
      },
      {
        field: "category",
        title: "Category",
        render: (data, type) => {
          const name =
            type === "group"
              ? ((data as any) as JournalEntryFragment["category"]).name
              : data.category.name;
          return capitalCase(name);
        },
        searchable: false,
        filtering: true,
        sorting: true,
        filterComponent: ({ columnDef, onFilterChanged }) => (
          <CategoryFilter
            options={filterOptions.category}
            setFilter={(filter) =>
              onFilterChanged((columnDef as any).tableData?.id ?? "3", filter)
            }
          />
        ),
        customSort: () => 0,
        /* customSort: (dataA, dataB) => {
          const { category: categoryA } = dataA;
          const { category: categoryB } = dataB;

          const nameA = categoryA.name.toUpperCase(); // ignore upper and lowercase
          const nameB = categoryB.name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        }, */
        /* customFilterAndSearch: (filter, entry) => {
          const type = typeof entry;

          if (type === "string") {
            return (
              new Fuse(
                [
                  {
                    category: [entry.category.name],
                  },
                ],
                {
                  threshold: 0.4,
                  useExtendedSearch: true,
                  keys: ["category"],
                }
              ).search(filter).length > 0
            );
          } else if (type === "object" && filter !== null) {
            return sift(filter)(entry);
          }

          return false;
        }, */
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
        filtering: true,
        sorting: true,
        /* customSort: ({ source: sourceA }, { source: sourceB }) => {
          const nameA = (() => {
            switch (sourceA.__typename) {
              case "Person":
                return sourceA.name.last.toUpperCase();
              case "Business":
                return sourceA.bizName.toUpperCase();
              case "Department":
                return sourceA.deptName.toUpperCase();
            }
          })();

          const nameB = (() => {
            switch (sourceB.__typename) {
              case "Person":
                return sourceB.name.last.toUpperCase();
              case "Business":
                return sourceB.bizName.toUpperCase();
              case "Department":
                return sourceB.deptName.toUpperCase();
            }
          })();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        }, */
        customSort: () => 0,
        // customFilterAndSearch: (filter, { source }) => {
        //   return (
        //     new Fuse(
        //       [
        //         {
        //           source: [
        //             (() => {
        //               switch (source.__typename) {
        //                 case "Person":
        //                   return `${source.name.first} ${source.name.last}`;
        //                 case "Business":
        //                   return source.bizName;
        //                 case "Department":
        //                   return source.deptName;
        //               }
        //             })(),
        //           ],
        //         },
        //       ],
        //       {
        //         threshold: 0.4,
        //         useExtendedSearch: true,
        //         keys: ["source"],
        //       }
        //     ).search(filter).length > 0
        //   );
        // },
      },
      {
        field: "paymentMethod",
        title: "Payment Method",
        render: ({ paymentMethod }) =>
          paymentMethod.parent?.id === CHECK_ID
            ? `CK-${paymentMethod.name}`
            : paymentMethod.name,
        searchable: false,
        filtering: false,
        sorting: true,
        customSort: () => 0,
        // customSort: (
        //   { paymentMethod: paymentMethodA },
        //   { paymentMethod: paymentMethodB }
        // ) => {
        //   const nameA = (() => {
        //     return (paymentMethodA.parent?.id === CHECK_ID
        //       ? `CK-${paymentMethodA.name}`
        //       : paymentMethodA.name
        //     ).toUpperCase();
        //   })();

        //   const nameB = (() => {
        //     return (paymentMethodB.parent?.id === CHECK_ID
        //       ? `CK-${paymentMethodB.name}`
        //       : paymentMethodB.name
        //     ).toUpperCase();
        //   })();
        //   if (nameA < nameB) {
        //     return -1;
        //   }
        //   if (nameA > nameB) {
        //     return 1;
        //   }

        //   // names must be equal
        //   return 0;
        // },
        // customFilterAndSearch: (filter, { paymentMethod }) => {
        //   return (
        //     new Fuse(
        //       [
        //         {
        //           paymentMethod: [
        //             paymentMethod.parent?.id === CHECK_ID
        //               ? `CK-${paymentMethod.name}`
        //               : paymentMethod.name,
        //           ],
        //         },
        //       ],
        //       {
        //         threshold: 0.4,
        //         useExtendedSearch: true,
        //         keys: ["paymentMethod"],
        //       }
        //     ).search(filter).length > 0
        //   );
        // },
      },
      {
        field: "description",
        title: "Description",
        render: ({ description }) => description,
        searchable: false,
        filtering: false,
        sorting: false,
        // customFilterAndSearch: (filter, { description }) => {
        //   return (
        //     new Fuse(
        //       [
        //         {
        //           description: [description?.trim() || ""],
        //         },
        //       ],
        //       {
        //         threshold: 0.4,
        //         useExtendedSearch: true,
        //         keys: ["description"],
        //       }
        //     ).search(filter).length > 0
        //   );
        // },
      },
      {
        field: "department",
        title: "Department",
        render: ({ department }) => capitalCase(department.name),
        searchable: false,
        filtering: false,
        sorting: true,
        /* customSort: (
          { department: departmentA },
          { department: departmentB }
        ) => {
          const nameA = departmentA.name.toUpperCase();
          const nameB = departmentB.name.toUpperCase();

          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        }, */
        customSort: () => 0,
        // customFilterAndSearch: (filter, entry) => {
        //   switch (typeof filter) {
        //     case "string": {
        //       return (
        //         new Fuse(
        //           [
        //             {
        //               department: [entry.department.name],
        //             },
        //           ],
        //           {
        //             threshold: 0.4,
        //             useExtendedSearch: true,
        //             keys: ["department"],
        //           }
        //         ).search(filter).length > 0
        //       );
        //     }
        //     case "object":
        //       if (filter !== null) {
        //         return sift(filter)(entry);
        //       }
        //   }

        //   return false;

        //   /* if (typeof filter === "string") {
        //     return (
        //       new Fuse(
        //         [
        //           {
        //             department: [department.name],
        //           },
        //         ],
        //         {
        //           threshold: 0.4,
        //           useExtendedSearch: true,
        //           keys: ["department"],
        //         }
        //       ).search(filter).length > 0
        //     );
        //   } else if(filter === )

        //   return true; */
        // },
      },
    ];
  }, [filter, filterOptions.category, mode, setFilter]);

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
      rowStyle: (data: Entry) => {
        const style = {} as React.CSSProperties;

        style.color =
          data.type === JournalEntryType.Credit ? green[900] : red[900];

        return style;
      },
      maxBodyHeight: "calc(100vh - 53px - 64px)",
      headerStyle: { position: "sticky", top: 0 },
      pageSize: 25,
      pageSizeOptions: [25, 50, 100],
      showTitle: !!journalTitle,
      selection: mode === JournalMode.Reconcile,
      showSelectAllCheckbox: false,
      debounceInterval: 500,
      emptyRowsWhenPaging: false,
      columnsButton: true,
      filtering: true,
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
        const { tooltip, onClick } = (() => {
          switch (rowData.__typename) {
            case "JournalEntry":
              return {
                tooltip: "Delete Entry",
                onClick: (event, rowData) => setDeleteEntry(rowData.id),
              };
            // case "JournalEntryItem":
            //   return {
            //     tooltip: "Delete Item",
            //     onClick: (event, rowData) => {
            //       // setDeleteItem(rowData.id)
            //     },
            //   };
            case "JournalEntryRefund":
              return {
                tooltip: "Delete Refund",
                onClick: (event, rowData) => setDeleteRefund(rowData.id),
              };
          }
        })();

        return {
          icon: DeleteIcon as any,
          tooltip,
          onClick,
        };
      },
      (rowData) => {
        const { tooltip, onClick } = (() => {
          switch (rowData.__typename) {
            case "JournalEntry":
              return {
                tooltip: "Edit Entry",
                onClick: (event, rowData) => {
                  setUpdateEntryOpen(true);
                  setUpdateEntry((rowData as Entry).id);
                },
              };
            // case "JournalEntryItem":
            //   return {
            //     tooltip: "Edit Item",
            //     onClick: (event, rowData) => {
            //       setUpdateItemOpen(true);
            //       setUpdateItem({
            //         entryId: (rowData as Entry).items as string,
            //         itemId: (rowData as Entry).id,
            //       });
            //     },
            //   };
            case "JournalEntryRefund":
              return {
                tooltip: "Edit Refund",
                onClick: (event, rowData) => {
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
          icon: EditIcon as any,
          tooltip,
          onClick,
        };
      },
      (rowData) => {
        if (rowData.__typename !== "JournalEntry") {
          return null as any;
        }

        const isCredit = rowData.type === JournalEntryType.Credit;

        return {
          icon: ((props) =>
            isCredit ? (
              <BankTransferOutIcon {...props} />
            ) : (
              <BankTransferInIcon {...props} />
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
  }, [mode, reconcileRefund, reconcileEntry, setDeleteRefund, setDeleteEntry]);

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
    [error, columns.length, actions]
  );

  const detailPanel = useMemo<
    NonNullable<MaterialTableProps<Entry>["detailPanel"]>
  >(
    () => [
      (rowData) => {
        const isJournalEntry = rowData.__typename === "JournalEntry";
        const hasItems = isJournalEntry ? rowData.items.length > 0 : false;
        return {
          icon: (props) =>
            isJournalEntry ? (
              hasItems ? (
                <FileTreeIcon {...props} />
              ) : (
                <FileTreeOutlineIcon {...props} />
              )
            ) : null,
          openIcon: (props) =>
            hasItems ? (
              <FileTreeIcon {...props} color="primary" />
            ) : (
              <FileTreeOutlineIcon {...props} color="primary" />
            ),
          disabled: !isJournalEntry,
          tooltip: isJournalEntry ? "Itemize" : undefined,
          render: (rowData) => {
            if (rowData.__typename !== "JournalEntry") {
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
          {`${journalTitle}: `}
          {aggregateSpan}
        </Typography>
      );
    }
    return <Typography variant="h6">{aggregateSpan}</Typography>;
  }, [aggregate, journalTitle]);

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
            switch (key) {
              case "date": {
                const date = new Date(entry.date);

                return [
                  entry.date,
                  format(date, "M/d/yy"),
                  format(date, "MM/d/yy"),
                  format(date, "M/d/yyyy"),
                  format(date, "MM/d/yyyy"),
                  format(date, "MMM dd, yyyy"),
                ];
              }
              case "total": {
                const total = rationalToFraction(entry.total).valueOf();

                return [numeral(total).format("$0,0.00"), total.toFixed(2)];
              }
              case "description":
                return entry.description?.trim() || "";
              case "department":
                return entry.department.name;
              case "category":
                return entry.category.name;
              case "paymentMethod":
                return entry.paymentMethod.name;
              case "source":
                switch (entry.source.__typename) {
                  case "Person":
                    return [entry.source.name.first, entry.source.name.last];
                  case "Business":
                    return entry.source.bizName;
                  case "Department":
                    return entry.source.deptName;
                }
                break;
              default:
                return "";
            }
          },
        })
          .search(search)
          .map((result) => result.item);
      })();

      const pipeline: Object[] = [];

      const $match: object = {};

      if (filters.length > 0) {
        for (const filter of filters) {
          Object.assign($match, filter.value ?? {});
        }
      }

      if (Object.keys($match).length > 0) {
        pipeline.push({ $match });
      }

      const $facet = {
        data: [] as object[],
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
                    rationalToFraction(entry.total).valueOf(),
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

      const [{ data, raw }] = new Aggregator(pipeline).run(collection);

      const totalCount = raw.length;

      const newAggregate = raw.reduce(
        (aggregate: Fraction, entry: Entry) =>
          entry.type === JournalEntryType.Credit
            ? aggregate.add(rationalToFraction(entry.total))
            : aggregate.sub(rationalToFraction(entry.total)),
        new Fraction(0)
      );

      if (aggregate.compare(newAggregate) !== 0) {
        setAggregate(newAggregate);
      }

      return {
        data,
        page,
        totalCount,
      };
    },
    [entries, aggregate]
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
