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
  MTableBodyRow,
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
import { green, red, amber, cyan } from "@material-ui/core/colors";
import {
  BankTransferIn as BankTransferInIcon,
  BankTransferOut as BankTransferOutIcon,
  FileTree as FileTreeIcon,
} from "mdi-material-ui";
import gql from "graphql-tag";
import { format } from "date-fns";

import {
  JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntry_1Fragment as JournalEntryFragment,
  JournalEntryRefund_1Fragment as JournalEntryRefundFragment,
  JournalEntryItem_1Fragment as JournalEntryItemFragment,
  JournalEntryType,
  OnEntryUpsert_1Subscription as OnEntryUpsert,
  ReconcileEntryMutation as ReconcileEntry,
  ReconcileEntryMutationVariables as ReconcileEntryVars,
  ReconcileRefundMutation as ReconcileRefund,
  ReconcileRefundMutationVariables as ReconcileRefundVars,
} from "../../../apollo/graphTypes";
import { JOURNAL_ENTRIES, JOURNAL_ENTRY_FRAGMENT } from "./JournalEntries.gql";
import { CHECK_ID } from "../constants";
import AddRefund from "../Upsert/Refunds/AddRefund";
import UpdateRefund from "../Upsert/Refunds/UpdateRefund";
import AddEntry from "../Upsert/Entries/AddEntry";
import UpdateEntry from "../Upsert/Entries/UpdateEntry";
import DeleteEntry from "../Upsert/Entries/DeleteEntry";
import DeleteRefund from "../Upsert/Refunds/DeleteRefund";
import AddItem from "../Upsert/Items/AddItem";
import UpdateItem from "../Upsert/Items/UpdateItem";
import DeleteItem from "../Upsert/Items/DeleteItem";

export enum JournalMode {
  View,
  Reconcile,
}

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
} as const;

export type Entry =
  | JournalEntryFragment
  | (Omit<JournalEntryFragment, "__typename" | "refunds"> &
      JournalEntryRefundFragment & { refunds: string })
  | (Omit<JournalEntryFragment, "__typename" | "items"> &
      JournalEntryItemFragment & { items: string });

const entriesGen = function* (
  entry: JournalEntryFragment,
  mode: JournalMode
): IterableIterator<Entry> {
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
  if (mode === JournalMode.Reconcile) {
    return;
  }
  for (const item of entry.items) {
    yield {
      ...entry,
      ...item,
      category: item.category || entry.category,
      department: item.department || entry.department,
      description: item.description || entry.description,
      items: entry.id,
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

const Journal = (props: {
  journalTitle?: string;
  deptId?: string;
  mode: JournalMode;
}) => {
  const { deptId = null, journalTitle = null, mode } = props;

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

  // Add Item
  const [addItemOpen, setAddItemOpen] = useState<boolean>(false);
  const [addItemToEntry, setAddItemToEntry] = useState<string | null>(null);

  const addItemOnClose = useCallback(() => void setAddItemOpen(false), [
    setAddItemOpen,
  ]);
  const addItemOnExited = useCallback(() => void setAddItemToEntry(null), [
    setAddItemToEntry,
  ]);

  // Update Item
  const [updateItemOpen, setUpdateItemOpen] = useState<boolean>(false);
  const [updateItem, setUpdateItem] = useState<{
    entryId: string;
    itemId: string;
  } | null>(null);

  // Delete Item
  const [deleteItem, setDeleteItem] = useState<string | null>(null);
  const deleteItemOnClose = useCallback(() => void setDeleteItem(null), [
    setDeleteItem,
  ]);

  const updateItemOnClose = useCallback(() => void setUpdateItemOpen(false), [
    setUpdateItemOpen,
  ]);
  const updateItemOnExited = useCallback(() => void setUpdateItem(null), [
    setUpdateItem,
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

  const columns = useMemo<Column<Entry>[]>(() => {
    return [
      {
        field: "reconciled",
        title: "Reconciled",
        render: ({ reconciled }) => (reconciled ? <DoneIcon /> : null),
        sorting: true,
        searchable: true,
        customSort: (
          { reconciled: reconciledA },
          { reconciled: reconciledB }
        ) => {
          return +reconciledA - +reconciledB;
        },
        customFilterAndSearch: (filter, { reconciled }) => {
          if (reconciled) {
            return (
              ((filter as string) || "").trim().toLowerCase() === "reconciled"
            );
          }
          return (
            ((filter as string) || "").trim().toLowerCase() === "!reconciled"
          );
        },
        hidden: mode === JournalMode.Reconcile,
        filtering: false,
      },
      {
        field: "total",
        title: "Total",
        render: ({ total: { num, den } }) =>
          numeral(num / den).format("$0,0.00"),
        searchable: true,
        filtering: false,
        sorting: true,
        customSort: ({ total: totalA }, { total: totalB }) => {
          return totalA.num / totalA.den - totalB.num / totalB.den;
        },
        customFilterAndSearch: (filter, { total: { num, den } }) => {
          return (
            new Fuse(
              [
                {
                  total: [
                    numeral(num / den).format("$0,0.00"),
                    (num / den).toFixed(2),
                  ],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["total"],
              }
            ).search(filter).length > 0
          );
        },
      },
      {
        field: "date",
        title: "Date",
        render: ({ date }) => format(new Date(date), "MMM dd, yyyy"),
        searchable: true,
        filtering: false,
        sorting: true,
        defaultSort: "desc",
        customSort: ({ date: dateA }, { date: dateB }) => {
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        },
        customFilterAndSearch: (filter, { date: dateStr }) => {
          const date = new Date(dateStr);

          return (
            new Fuse(
              [
                {
                  date: [
                    dateStr,
                    format(date, "M/d/yy"),
                    format(date, "MM/d/yy"),
                    format(date, "M/d/yyyy"),
                    format(date, "MM/d/yyyy"),
                    format(date, "MMM dd, yyyy"),
                  ],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["date"],
              }
            ).search(filter).length > 0
          );
        },
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
        searchable: true,
        filtering: false,
        sorting: true,
        customSort: (dataA, dataB) => {
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
        },
        customFilterAndSearch: (filter, { category: { name } }) => {
          return (
            new Fuse(
              [
                {
                  category: [name],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["category"],
              }
            ).search(filter).length > 0
          );
        },
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
        searchable: true,
        filtering: false,
        sorting: true,
        customSort: ({ source: sourceA }, { source: sourceB }) => {
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
        },
        customFilterAndSearch: (filter, { source }) => {
          return (
            new Fuse(
              [
                {
                  source: [
                    (() => {
                      switch (source.__typename) {
                        case "Person":
                          return `${source.name.first} ${source.name.last}`;
                        case "Business":
                          return source.bizName;
                        case "Department":
                          return source.deptName;
                      }
                    })(),
                  ],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["source"],
              }
            ).search(filter).length > 0
          );
        },
      },
      {
        field: "paymentMethod",
        title: "Payment Method",
        render: ({ paymentMethod }) =>
          paymentMethod.parent?.id === CHECK_ID
            ? `CK-${paymentMethod.name}`
            : paymentMethod.name,
        searchable: true,
        filtering: false,
        sorting: true,
        customSort: (
          { paymentMethod: paymentMethodA },
          { paymentMethod: paymentMethodB }
        ) => {
          const nameA = (() => {
            return (paymentMethodA.parent?.id === CHECK_ID
              ? `CK-${paymentMethodA.name}`
              : paymentMethodA.name
            ).toUpperCase();
          })();

          const nameB = (() => {
            return (paymentMethodB.parent?.id === CHECK_ID
              ? `CK-${paymentMethodB.name}`
              : paymentMethodB.name
            ).toUpperCase();
          })();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        },
        customFilterAndSearch: (filter, { paymentMethod }) => {
          return (
            new Fuse(
              [
                {
                  paymentMethod: [
                    paymentMethod.parent?.id === CHECK_ID
                      ? `CK-${paymentMethod.name}`
                      : paymentMethod.name,
                  ],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["paymentMethod"],
              }
            ).search(filter).length > 0
          );
        },
      },
      {
        field: "description",
        title: "Description",
        render: ({ description }) => description,
        searchable: true,
        filtering: false,
        sorting: false,
        customFilterAndSearch: (filter, { description }) => {
          return (
            new Fuse(
              [
                {
                  description: [description?.trim() || ""],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["description"],
              }
            ).search(filter).length > 0
          );
        },
      },
      {
        field: "department",
        title: "Department",
        render: ({ department }) => capitalCase(department.name),
        searchable: true,
        filtering: false,
        sorting: true,
        customSort: (
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
        },
        customFilterAndSearch: (filter, { department }) => {
          return (
            new Fuse(
              [
                {
                  department: [department.name],
                },
              ],
              {
                threshold: 0.4,
                useExtendedSearch: true,
                keys: ["department"],
              }
            ).search(filter).length > 0
          );
        },
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

  const parentChildData = useCallback<
    NonNullable<MaterialTableProps<Entry>["parentChildData"]>
  >(
    (child, parents) =>
      child.__typename === "JournalEntryItem"
        ? parents.find((parent) => parent.id === child.items)
        : undefined,
    []
  );

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const onTreeExpandChange = useCallback<
    NonNullable<MaterialTableProps<Entry>["onTreeExpandChange"]>
  >(
    (entry: Entry, isExpanded) => {
      if (isExpanded) {
        expandedItems.add(entry.id);
      } else {
        expandedItems.delete(entry.id);
      }
      setExpandedItems(new Set(expandedItems));
    },
    [expandedItems, setExpandedItems]
  );

  const options = useMemo<Options>(
    () => ({
      rowStyle: (data: Entry) => {
        const style = {} as React.CSSProperties;

        style.color =
          data.type === JournalEntryType.Credit ? green[900] : red[900];

        if (
          data.__typename === "JournalEntry" &&
          data.items.filter((item) => !item.deleted).length > 0 &&
          expandedItems.has(data.id)
        ) {
          style.backgroundColor = cyan[100];
        }

        if (data.__typename === "JournalEntryItem") {
          style.backgroundColor = amber[100];
        }

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
    }),
    [expandedItems, journalTitle, mode]
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
            case "JournalEntryItem":
              return {
                tooltip: "Delete Item",
                onClick: (event, rowData) => setDeleteItem(rowData.id),
              };
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
            case "JournalEntryItem":
              return {
                tooltip: "Edit Item",
                onClick: (event, rowData) => {
                  setUpdateItemOpen(true);
                  setUpdateItem({
                    entryId: (rowData as Entry).items as string,
                    itemId: (rowData as Entry).id,
                  });
                },
              };
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
          icon: Edit as any,
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
      (rowData) => {
        if (rowData.__typename !== "JournalEntry") {
          return null;
        }

        return {
          icon: FileTreeIcon,
          tooltip: "Itemize",
          onClick: (event, rowData) => {
            setAddItemOpen(true);
            setAddItemToEntry((rowData as JournalEntryFragment).id);
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
      Row: (props) => {
        const entry = props?.data as Entry & {
          tableData?: { isTreeExpanded?: boolean };
        };
        if (
          entry &&
          entry.__typename === "JournalEntry" &&
          expandedItems.has(entry.id) &&
          entry.items.length > 0 &&
          entry?.tableData?.isTreeExpanded !== true
        ) {
          props = {
            ...props,
            data: {
              ...entry,
              tableData: {
                ...(entry.tableData || {}),
                isTreeExpanded: true,
              },
            },
          };
        }
        return <MTableBodyRow {...props} />;
      },
    }),
    [error, columns.length, actions, expandedItems]
  );

  const journalEntries = data?.journalEntries || [];
  const entries = useMemo(() => {
    const filters =
      mode === JournalMode.Reconcile
        ? [(entry: Entry) => !entry.reconciled && !entry.deleted]
        : [(entry: Entry) => !entry.deleted];

    return journalEntries
      .reduce((entries: Entry[], journalEntry) => {
        for (const entry of entriesGen(journalEntry, mode)) {
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
        isLoading={isLoading || reconcilingEntry || reconcilingRefund}
        columns={columns}
        data={entries}
        options={options}
        localization={localization}
        actions={actions}
        components={components}
        title={journalTitle ?? undefined}
        parentChildData={parentChildData}
        onTreeExpandChange={onTreeExpandChange}
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
      <AddItem
        entryId={addItemToEntry}
        open={addItemOpen}
        onClose={addItemOnClose}
        onExited={addItemOnExited}
      />
      <UpdateItem
        entryId={updateItem?.entryId ?? null}
        itemId={updateItem?.itemId ?? null}
        open={updateItemOpen}
        onClose={updateItemOnClose}
        onExited={updateItemOnExited}
      />
      <DeleteItem itemId={deleteItem} onClose={deleteItemOnClose} />
    </React.Fragment>
  );
};

export default Journal;
