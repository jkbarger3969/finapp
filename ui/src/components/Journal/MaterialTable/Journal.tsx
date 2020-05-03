import React, { useMemo, forwardRef, useState, useCallback } from "react";
import MaterialTable, {
  Column,
  Options,
  Localization,
  MaterialTableProps,
  Components,
  MTableBody,
} from "material-table";
import { useQuery } from "@apollo/react-hooks";
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

import {
  JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntryAdded_1Subscription as JournalEntryAdded,
  JournalEntryUpdated_1Subscription as JournalEntryUpdated,
  JournalEntry_1Fragment as JournalEntryFragment,
  JournalEntryRefund_1Fragment as JournalEntryRefundFragment,
  JournalEntryType,
  DeptForUpsertAddQuery as DeptForUpsertAdd,
  DeptForUpsertAddQueryVariables as DeptForUpsertAddVars,
} from "../../../apollo/graphTypes";
import {
  JOURNAL_ENTRIES,
  JOURNAL_ENTRY_ADDED_SUB,
  JOURNAL_ENTRY_UPDATED_SUB,
  JOURNAL_ENTRY_FRAGMENT,
} from "../Table/JournalEntries.gql";
import { JournalMode } from "../Table/Body";
import { CHECK_ID } from "../constants";
import UpsertEntry, { Values } from "../Upsert/UpsertEntry";
import { DEPT_FOR_UPSERT_ADD } from "../../Dashboard/Dashboard";
import AddRefund from "../Upsert/Refunds/AddRefund";
import UpdateRefund from "../Upsert/Refunds/UpdateRefund";

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

  const { loading, error, data } = useQuery<
    JournalEntriesQuery,
    JournalEntriesQueryVars
  >(JOURNAL_ENTRIES, {
    variables,
  });

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
          onClick(event, rowData) {
            if (Array.isArray(rowData)) {
              for (const { id } of rowData) {
                console.log(`Reconcile: ${id}`);
              }
            }
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
          onClick: (event, rowData) => {
            console.log("Delete: ", (rowData as JournalEntryFragment).id);
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
          setUpdateEntryId(undefined);
          setUpsertOpen(true);
        },
      },
    ];
  }, [
    setUpdateEntryId,
    setUpdateRefundOpen,
    setUpdateRefund,
    setAddRefundOpen,
    setUpsertOpen,
    mode,
  ]);

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
        isLoading={loading}
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
