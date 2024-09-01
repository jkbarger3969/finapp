/* eslint-disable react/prop-types */
import React, { useCallback, useMemo, useState } from "react";
import { Paper } from "@material-ui/core";
import {
  SummaryState,
  SummaryItem,
  IntegratedSummary,
  IntegratedSummaryProps,
  TableColumnWidthInfo,
  SortingState,
  Sorting,
  IntegratedSorting,
  SearchState,
  TableFilterRow as TableFilterRowNS,
  IntegratedFiltering,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  GridProps,
  Table,
  TableHeaderRow,
  TableSummaryRow,
  TableSummaryRowProps,
  TableColumnResizing,
  TableColumnReordering,
  TableColumnReorderingProps,
  DragDropProvider,
  TableColumnVisibility,
  TableColumnVisibilityProps,
  ColumnChooser,
  VirtualTable,
  SearchPanel,
  Toolbar,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import { green, red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import { compareAsc } from "date-fns";
import Fraction from "fraction.js";
import { ValueNode } from "mui-tree-select";
import md5 from "md5";

import {
  EntriesWhere,
  GridEntryFragment,
  GridRefundFragment,
  GridEntriesQuery,
  GridEntriesQueryVariables,
  EntryType,
  DepartmentsWhere,
  AccountsWhere,
  GridPaymentMethodFragment,
  EntryRefundsWhere,
  GridEntryRefundsQuery,
  GridEntryRefundsQueryVariables,
  GridEntryRefundFragment,
} from "../../../apollo/graphTypes";
import { deserializeDate, deserializeRational } from "../../../apollo/scalars";
import { GRID_ENTRIES, GRID_ENTRY_REFUNDS } from "./Grid.gql";
import OverlayLoading from "../../Utils/OverlayLoading";
import useLocalStorage, {
  UseLocalStorageArg,
} from "../../Utils/useLocalStorage";
import {
  FilteringState,
  FiltersDef,
  DataCell,
  FilterCell,
  DataCellProvider,
  FilterCellProvider,
  CellProviderProps,
  EntryActionState,
  EntryAction,
  EditColumnFilterHeaderCell,
  NamedFilters,
} from "./plugins";
import {
  BoolCell,
  BoolFilter,
  BoolFilterProps,
  CategoryCell,
  CategoryFilter,
  categoryFilterColumnExtension,
  CategoryFilterProps,
  DateCell,
  DateFilter,
  dateFilterColumnExtension,
  DeptCell,
  DeptFilter,
  deptFilterColumnExtension,
  DeptFilterProps,
  PayMethodCell,
  PayMethodFilter,
  PayMethodFilterProps,
  payMethodFilterColumnExtension,
  RationalCell,
  RationalFilter,
  rationalFilterColumnExtension,
  RationalFilterProps,
  SourceCell,
  SourceFilter,
  sourceFilterColumnExtension,
  SourceFilterProps,
  sourceToStr,
} from "./cells";
import { DefaultEditor } from "./filters";
import { DepartmentInputOpt } from "../../Inputs/Department";
import {
  CategoryInputOpt,
  getOptionLabel as getCategoryOptionLabel,
} from "../../Inputs/Category";
import { EntityInputOpt } from "../../Inputs/Entity";
import { UpsertEntryProps } from "./forms/UpsertEntry";
import { UpsertRefundProps } from "./forms/UpsertRefund";
import { DeleteEntryProps } from "./forms/DeleteEntry";
import { dialogProps } from "./forms/shared";
import { GridTitle } from "./plugins/GridTitle";
import { GridMenu } from "./plugins/GridMenu";
import { ReconcileEntriesProps } from "./forms/ReconcileEntries";

const GridRoot = (props: Grid.RootProps) => (
  <Grid.Root {...props} style={{ height: "100%" }} />
);

export type GridRefund = Omit<GridRefundFragment, "date" | "total"> & {
  date: Date;
  total: Fraction;
};

export type GridEntry = Omit<
  GridEntryFragment,
  "date" | "dateOfRecord" | "total" | "__typename"
> & {
  date: Date;
  dateOfRecord?: Omit<GridEntryFragment["dateOfRecord"], "date"> & {
    date: Date;
  };
  total: Fraction;
  refunds: GridRefund[];
} & (
    | {
        __typename: GridEntryFragment["__typename"];
      }
    | {
        __typename: GridRefundFragment["__typename"];
        entryId: string;
      }
  );

const deserializeGridRefund = (refund: GridRefundFragment): GridRefund => ({
  ...refund,
  date: deserializeDate(refund.date),
  dateOfRecord: (refund.dateOfRecord
    ? {
        ...refund.dateOfRecord,
        date: deserializeDate(refund.dateOfRecord.date),
      }
    : undefined) as GridRefund["dateOfRecord"],
  total: deserializeRational(refund.total),
});

const deserializeEntry = (
  entry: GridEntryFragment | GridEntryRefundFragment["entry"]
): GridEntry =>
  ({
    ...entry,
    date: deserializeDate(entry.date),
    dateOfRecord: entry.dateOfRecord
      ? {
          ...entry.dateOfRecord,
          date: deserializeDate(entry.dateOfRecord.date),
        }
      : undefined,
    total: deserializeRational(entry.total),
    refunds: ("refunds" in entry ? entry.refunds : []).map<GridRefund>(
      (refund) => deserializeGridRefund(refund)
    ),
  } as GridEntry);

type ColumnsNames =
  | "date"
  | "dateOfRecord"
  | "type"
  | "department"
  | "category"
  | "paymentMethod"
  | "description"
  | "total"
  | "source"
  | "reconciled";

export type FilterOperations = keyof Omit<
  TableFilterRowNS.LocalizationMessages,
  "filterPlaceholder"
>;

// DX React Grid
const getRowId: NonNullable<GridProps["getRowId"]> = (row: GridEntryFragment) =>
  row.id;

// Styles
const useStyles = makeStyles({
  creditCell: {
    color: green[900],
  },
  debitCell: {
    color: red[900],
  },
  paper: {
    height: "100vh",
  },
});

const dateDefaultFormat = {
  locales: "en-US",
  options: { month: "short", day: "2-digit", year: "numeric" },
};

const dateDefaultFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const currencyFormat = {
  locales: "en-US",
  options: { style: "currency", currency: "USD" },
};

const defaultCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const columns = [
  {
    name: "date",
    title: "Date",
    getCellValue: (row?: GridEntry) => row?.date || null,
  },
  {
    name: "dateOfRecord",
    title: "Date of Record",
    getCellValue: (row?: GridEntry) =>
      row?.dateOfRecord?.date || row?.date || null,
  },
  {
    name: "department",
    title: "Department",
  },
  {
    name: "category",
    title: "Category",
  },
  {
    name: "paymentMethod",
    title: "Payment Method",
  },
  {
    name: "description",
    title: "Description",
  },
  {
    name: "total",
    title: "Total",
    getCellValue: (row?: GridEntryFragment) => row?.total || null,
  },
  {
    name: "source",
    title: "Source",
  },
  {
    name: "reconciled",
    title: "Reconciled",
  },
] as const;

const summaryCalculator: NonNullable<IntegratedSummaryProps["calculator"]> = (
  type,
  rows,
  getValue
) => {
  if (type === "totalAggregate") {
    return defaultCurrencyFormatter.format(
      rows
        .reduce((sum: Fraction, row: GridEntry) => {
          if (row.__typename === "EntryRefund") {
            return row.category.type === EntryType.Credit
              ? sum.sub(getValue(row))
              : sum.add(getValue(row));
          } else {
            return row.category.type === EntryType.Credit
              ? sum.add(getValue(row))
              : sum.sub(getValue(row));
          }
        }, new Fraction(0))
        .valueOf()
    );
  } else {
    return IntegratedSummary.defaultCalculator(type, rows, getValue);
  }
};

const messages = {
  totalAggregate: "Balance",
  count: "Transactions",
} as const;

const totalItems: ReadonlyArray<SummaryItem> = [
  { columnName: "total", type: "count" },
  {
    columnName: "total",
    type: "totalAggregate",
  },
];

const defaultColumnWidths: ReadonlyArray<TableColumnWidthInfo> = [
  {
    columnName: "id",
    width: "50px",
  },
  {
    columnName: "date",
    width: "135px",
  },
  {
    columnName: "dateOfRecord",
    width: "135px",
  },
  {
    columnName: "type",
    width: "85px",
  },
  {
    columnName: "department",
    width: "180px",
  },
  {
    columnName: "category",
    width: "180px",
  },
  {
    columnName: "paymentMethod",
    width: "135px",
  },
  {
    columnName: "description",
    width: "300px",
  },
  {
    columnName: "total",
    width: "175px",
  },
  {
    columnName: "source",
    width: "180px",
  },
  {
    columnName: "reconciled",
    width: "135px",
  },
];

const defaultColumnOrder: NonNullable<
  TableColumnReorderingProps["defaultOrder"]
> = columns.map((column) => column.name);

const namedFilterSerialization: UseLocalStorageArg<NamedFilters>["serializer"] =
  {
    serialize: (namedFilters) =>
      JSON.stringify(namedFilters, function (key, value) {
        const rawValue = this[key];

        if (rawValue instanceof Date) {
          return { _TYPE_: "Date", value: this[key].toISOString() };
        } else if (rawValue instanceof Fraction) {
          return {
            _TYPE_: "Rational",
            value: {
              s: rawValue.s,
              n: rawValue.n,
              d: rawValue.d,
            },
          };
        }
        return value;
      }),
    deserialize: (namedFilters) =>
      JSON.parse(namedFilters, (_, value) => {
        if (
          value &&
          typeof value === "object" &&
          "_TYPE_" in value &&
          "value" in value
        ) {
          switch (value._TYPE_) {
            case "Date":
              return new Date(value.value);
            case "Rational":
              return new Fraction(value.value);
          }
        }

        return value;
      }),
  };

const defaultSorting: Sorting[] = [
  { columnName: "dateOfRecord", direction: "asc" },
];

const integratedSortingColumnExtensions: IntegratedSorting.ColumnExtension[] = [
  { columnName: "total", compare: (a: Fraction, b: Fraction) => a.compare(b) },
  { columnName: "date", compare: compareAsc },
  { columnName: "dateOfRecord", compare: compareAsc },
  { columnName: "dateOfRecord", compare: compareAsc },
];

const dateToString = new Intl.DateTimeFormat(
  dateDefaultFormat?.locales,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dateDefaultFormat?.options as any
);
const currencyToString = new Intl.NumberFormat(
  currencyFormat.locales,
  currencyFormat.options
);
const integratedFilteringColumnExtensions: IntegratedFiltering.ColumnExtension[] =
  [
    dateFilterColumnExtension("date", (date) => dateToString.format(date)),
    dateFilterColumnExtension("dateOfRecord", (date) =>
      dateToString.format(date)
    ),
    categoryFilterColumnExtension("category", (value) =>
      getCategoryOptionLabel(new ValueNode(value))
    ),
    deptFilterColumnExtension("department", (value) => value.name),
    payMethodFilterColumnExtension("paymentMethod"),
    rationalFilterColumnExtension(
      "total",
      (value) =>
        `${value.toString()} ${currencyToString.format(value.valueOf())}`
    ),
    sourceFilterColumnExtension("source", sourceToStr),
  ];

export type GridRefundsWhere = {
  where: EntryRefundsWhere;
  entriesWhere?: EntriesWhere;
};

export type Props = {
  fiscalYear?: string;
  title?: string;
  loading?: boolean;
  reconcileMode?: boolean;
  where?: EntriesWhere;
  refundsWhere?: GridRefundsWhere;
  selectableDepts: DepartmentsWhere;
  selectableAccounts: AccountsWhere;
  layoutCacheKey?: string;
};
const JournalGrid: React.FC<Props> = (props: Props) => {
  const classes = useStyles();

  const fiscalYear = props.fiscalYear;

  const entryVariables = useMemo<GridEntriesQueryVariables>(
    () => ({
      where: props.where,
      filterRefunds: true,
    }),
    [props.where]
  );

  const entryRefundVariables = props?.refundsWhere;

  const cachePrefix = useMemo<string>(
    () => props.layoutCacheKey ?? `${md5(JSON.stringify(props.where))}`,

    [props.where, props.layoutCacheKey]
  );
  const gridEntryResults = useQuery<
    GridEntriesQuery,
    GridEntriesQueryVariables
  >(GRID_ENTRIES, {
    variables: entryVariables,
    fetchPolicy: "cache-and-network",
  });

  const gridEntryRefundResults = useQuery<
    GridEntryRefundsQuery,
    GridEntryRefundsQueryVariables
  >(GRID_ENTRY_REFUNDS, {
    skip: !entryRefundVariables,
    variables: entryRefundVariables as GridRefundsWhere,
    fetchPolicy: "cache-and-network",
  });

  const loading = gridEntryResults.loading || gridEntryRefundResults.loading;
  const error = gridEntryResults.error || gridEntryRefundResults.error;

  const rows = useMemo<GridEntry[]>(() => {
    const refundsMap = (gridEntryRefundResults.data?.entryRefunds || []).reduce(
      (refundsMap, { entry, ...refundRaw }) => {
        if (!refundRaw.deleted) {
          const refund = deserializeGridRefund(refundRaw);

          refundsMap.set(refund.id, {
            ...deserializeEntry(entry),
            ...refund,
            refunds: [refund],
            entryId: entry.id,
          } as GridEntry);
        }

        return refundsMap;
      },
      new Map<string, GridEntry>()
    );

    const gridEntries = (gridEntryResults.data?.entries || []).reduce(
      (entries, entryRaw: GridEntryFragment) => {
        if (entryRaw.deleted) {
          return entries;
        }

        const entry = deserializeEntry(entryRaw);

        entries.push(entry as GridEntry);

        if (entry.refunds.length > 0) {
          for (const refund of entry.refunds) {
            if (!refund.deleted) {
              const refundEntry = (() => {
                if (refundsMap.has(refund.id)) {
                  const refundEntry = refundsMap.get(refund.id) as GridEntry;
                  refundsMap.delete(refund.id);
                  return refundEntry;
                }

                return {
                  ...entry,
                  ...refund,
                  entryId: entry.id,
                };
              })();

              entries.push(refundEntry as unknown as GridEntry);
            }
          }
        }

        return entries;
      },
      [] as GridEntry[]
    );

    gridEntries.push(...refundsMap.values());

    return gridEntries;
  }, [
    gridEntryRefundResults.data?.entryRefunds,
    gridEntryResults.data?.entries,
  ]);

  const filterCellProviderProps = useMemo<
    CellProviderProps<ColumnsNames>
  >(() => {
    const deptFilterOpts = new Map<string, DepartmentInputOpt>();
    const payMethodFilterOpts: GridPaymentMethodFragment[] = [];
    const categoryFilterOpts = new Map<string, CategoryInputOpt>();
    const srcFilterOpts = new Map<string, EntityInputOpt>();

    for (const row of rows) {
      const { department, category, source, paymentMethod } = row;

      if (
        !deptFilterOpts.has(department.id) &&
        department.disable.every(({ id }) => id !== fiscalYear)
      ) {
        deptFilterOpts.set(department.id, department as DepartmentInputOpt);
      }

      payMethodFilterOpts.push(paymentMethod);

      if (!categoryFilterOpts.has(category.id)) {
        categoryFilterOpts.set(category.id, category as CategoryInputOpt);
      }

      const srcKey = `${source.__typename}_${source.id}`;
      if (!srcFilterOpts.has(srcKey)) {
        srcFilterOpts.set(srcKey, source as EntityInputOpt);
      }
    }

    return {
      category: {
        cell: CategoryFilter,
        props: {
          categoryFilterOpts: [...categoryFilterOpts.values()],
        } as CategoryFilterProps,
      },
      date: {
        cell: DateFilter,
      },
      dateOfRecord: {
        cell: DateFilter,
      },
      department: {
        cell: DeptFilter,
        props: {
          deptFilterOpts: [...deptFilterOpts.values()],
        } as DeptFilterProps,
      },
      paymentMethod: {
        cell: PayMethodFilter,
        props: {
          payMethodFilterOpts,
        } as PayMethodFilterProps,
      },
      reconciled: {
        cell: BoolFilter,
        props: {
          boolLabels: {
            trueLabel: "Reconciled",
            falseLabel: "Unreconciled",
          },
        } as BoolFilterProps,
      },
      source: {
        cell: SourceFilter,
        props: {
          srcFilterOpts: [...srcFilterOpts.values()],
        } as SourceFilterProps,
      },
      total: {
        cell: RationalFilter,
        props: {
          rationalInputProps: {
            InputProps: {
              startAdornment: "$",
            },
          },
        } as RationalFilterProps,
      },
    };
  }, [rows, fiscalYear]);

  const [columnOrder, setColumnOrder] = useLocalStorage({
    defaultValue: defaultColumnOrder,
    cacheKey: `column_order_${cachePrefix}`,
  });

  const [columnWidths, setColumnWidths] = useLocalStorage({
    defaultValue: defaultColumnWidths as TableColumnWidthInfo[],
    cacheKey: `column_widths_${cachePrefix}`,
  });
  const [hiddenColumnNames, setHiddenColumnNames] = useLocalStorage({
    defaultValue: [] as NonNullable<
      TableColumnVisibilityProps["hiddenColumnNames"]
    >,
    cacheKey: `column_visibility_${cachePrefix}`,
  });

  const [sorting, setSorting] = useLocalStorage({
    defaultValue: defaultSorting,
    cacheKey: `column_visibility_sorting${cachePrefix}`,
  });

  const [filters, setFilters] = useState<FiltersDef>([]);

  const [namedFilters, setNamedFilters] = useLocalStorage<NamedFilters>({
    defaultValue: {},
    cacheKey: `named_filters_${cachePrefix}`,
    serializer: namedFilterSerialization,
  });

  const dataCellColor = useCallback(
    ({
      className = "",
      row,
      ...rest
    }: Table.DataCellProps & { className?: string }) => {
      const colorClass = (() => {
        if ((row as GridEntry).__typename === "EntryRefund") {
          return (row as GridEntry).category.type === EntryType.Credit
            ? classes.debitCell
            : classes.creditCell;
        } else {
          return (row as GridEntry).category.type === EntryType.Credit
            ? classes.creditCell
            : classes.debitCell;
        }
      })();

      return {
        className: `${className} ${colorClass}`.trim(),
        row,
        ...rest,
      };
    },
    [classes.creditCell, classes.debitCell]
  );

  const dataCellProviderProps = useMemo<CellProviderProps<ColumnsNames>>(() => {
    return {
      date: {
        cell: DateCell,
        props: (props) =>
          dataCellColor({
            ...props,
            formatter: dateDefaultFormatter,
          }),
      },
      dateOfRecord: {
        cell: DateCell,
        props: (props) =>
          dataCellColor({
            ...props,
            formatter: dateDefaultFormatter,
          }),
      },
      department: {
        cell: DeptCell,
        props: dataCellColor,
      },
      category: {
        cell: CategoryCell,
        props: dataCellColor,
      },
      paymentMethod: {
        cell: PayMethodCell,
        props: dataCellColor,
      },
      description: {
        props: dataCellColor,
      },
      total: {
        cell: RationalCell,
        props: (props) =>
          dataCellColor({
            ...props,
            formatter: defaultCurrencyFormatter,
          }),
      },
      source: {
        cell: SourceCell,
        props: dataCellColor,
      },
      reconciled: {
        cell: BoolCell,
        props: dataCellColor,
      },
    };
  }, [dataCellColor]);

  const [
    upsertEntryProps,
    upsertRefundProps,
    deleteEntryProps,
    reconcileEntriesProps,
  ] = useMemo<
    [
      UpsertEntryProps,
      UpsertRefundProps,
      DeleteEntryProps,
      ReconcileEntriesProps
    ]
  >(
    () => [
      {
        dialogProps,
        entryProps: {
          paymentMethod: { accounts: props.selectableAccounts },
          department: {
            root: props.selectableDepts,
            fyID: fiscalYear,
          },
        },
        refetchQueries: {
          onNewEntry: [
            {
              query: GRID_ENTRIES,
              variables: entryVariables,
            },
          ],
        },
      } as UpsertEntryProps,
      {
        dialogProps,
        refundProps: {
          paymentMethod: { accounts: props.selectableAccounts },
        },
        refetchQueries: entryRefundVariables
          ? {
              onNewEntryRefund: [
                {
                  query: GRID_ENTRY_REFUNDS,
                  variables: entryRefundVariables,
                },
              ],
              onUpdateEntryRefund: [
                {
                  query: GRID_ENTRY_REFUNDS,
                  variables: entryRefundVariables,
                },
                {
                  query: GRID_ENTRIES,
                  variables: entryVariables,
                },
              ],
            }
          : undefined,
      } as UpsertRefundProps,
      {
        keepMounted: false,
        maxWidth: "sm",
        fullWidth: true,
      } as DeleteEntryProps,
      {
        dialogProps: {
          keepMounted: false,
          maxWidth: "sm",
          fullWidth: true,
        },
      } as ReconcileEntriesProps,
    ],
    [
      props.selectableAccounts,
      props.selectableDepts,
      entryVariables,
      entryRefundVariables,
      fiscalYear,
    ]
  );

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Paper className={classes.paper}>
      <Grid
        columns={columns}
        rows={rows}
        getRowId={getRowId}
        rootComponent={GridRoot}
      >
        {/* UI plugins */}
        <DragDropProvider />

        {/* State Plugins */}
        <EntryActionState
          reconcileMode={props.reconcileMode}
          upsertEntryProps={upsertEntryProps}
          upsertRefundProps={upsertRefundProps}
          deleteEntryProps={deleteEntryProps}
          reconcileEntriesProps={reconcileEntriesProps}
        />
        <SearchState />
        <FilteringState
          filters={filters}
          onFiltersChange={setFilters}
          namedFilters={namedFilters}
          onNamedFiltersChange={setNamedFilters}
        />

        <SortingState sorting={sorting} onSortingChange={setSorting} />
        <SummaryState totalItems={totalItems as unknown as SummaryItem[]} />

        {/* Data Processing Plugins */}
        <IntegratedFiltering
          columnExtensions={integratedFilteringColumnExtensions}
        />
        <IntegratedSummary calculator={summaryCalculator} />
        <IntegratedSorting
          columnExtensions={integratedSortingColumnExtensions}
        />

        <VirtualTable
          height="auto"
          cellComponent={DataCell}
          // Allows for named filters
          stubHeaderCellComponent={EditColumnFilterHeaderCell}
        />
        <TableColumnResizing
          columnWidths={columnWidths}
          onColumnWidthsChange={setColumnWidths}
        />
        <TableColumnReordering
          order={columnOrder}
          onOrderChange={setColumnOrder}
        />
        <TableHeaderRow showSortingControls />
        <TableFilterRow
          showFilterSelector
          cellComponent={FilterCell}
          editorComponent={DefaultEditor}
        />
        <DataCellProvider {...dataCellProviderProps} />
        <FilterCellProvider {...filterCellProviderProps} />
        <TableColumnVisibility
          hiddenColumnNames={hiddenColumnNames}
          onHiddenColumnNamesChange={setHiddenColumnNames}
        />
        <Toolbar />
        <GridTitle title={props.title} />
        <SearchPanel />
        <ColumnChooser />
        <TableSummaryRow
          messages={messages as unknown as TableSummaryRowProps["messages"]}
        />
        <EntryAction />
        <GridMenu />
        {/*         <TableFixedColumns leftColumns={leftColumns} /> */}
      </Grid>
      {(loading || !!props.loading) && <OverlayLoading zIndex="modal" />}
    </Paper>
  );
};

export default JournalGrid;
