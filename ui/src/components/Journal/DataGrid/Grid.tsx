import React, { useMemo, useState, Dispatch, useCallback } from "react";
import { Box, Paper } from "@material-ui/core";
import {
  Column,
  DataTypeProvider,
  DataTypeProviderProps,
  SummaryState,
  SummaryItem,
  IntegratedSummary,
  IntegratedSummaryProps,
  TableColumnWidthInfo,
  SortingState,
  Sorting,
  IntegratedSorting,
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
  Toolbar,
  VirtualTable,
} from "@devexpress/dx-react-grid-material-ui";
import { green, red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { Done as DoneIcon } from "@material-ui/icons";
import { useQuery } from "@apollo/client";
import { format, compareAsc } from "date-fns";
import Fraction from "fraction.js";
import md5 from "md5";

import {
  JournalEntiresWhere,
  GridEntryFragment,
  GridRefundFragment,
  GridEntriesQuery,
  GridEntriesQueryVariables,
  JournalEntryType,
} from "../../../apollo/graphTypes";
import { GRID_ENTRIES } from "./Grid.gql";
import { rationalToFraction } from "../../../utils/rational";
import OverlayLoading from "../../utils/OverlayLoading";
import { CHECK_ID } from "../constants";

// Styles
const useStyles = makeStyles({
  creditCell: {
    color: green[900],
  },
  debitCell: {
    color: red[900],
  },
});

// DX React Grid
const getRowId: NonNullable<GridProps["getRowId"]> = (row: GridEntryFragment) =>
  row.id;

const CurrencyFormatter: NonNullable<
  DataTypeProviderProps["formatterComponent"]
> = ({ value }: DataTypeProvider.ValueFormatterProps) => (
  <span>
    {(value as Fraction)
      .valueOf()
      .toLocaleString("en-US", { style: "currency", currency: "USD" })}
  </span>
);
const CurrencyTypeProvider = (props: DataTypeProviderProps) => {
  return <DataTypeProvider {...props} formatterComponent={CurrencyFormatter} />;
};

const currencyColumns: DataTypeProviderProps["for"] = ["total"];

const DateFormatter: NonNullable<
  DataTypeProviderProps["formatterComponent"]
> = ({ value }: DataTypeProvider.ValueFormatterProps) => (
  <span>{format(value as Date, "MMM dd, yyyy")}</span>
);

const DateTypeProvider = (props: DataTypeProviderProps) => (
  <DataTypeProvider {...props} formatterComponent={DateFormatter} />
);
const dateColumns: DataTypeProviderProps["for"] = ["date", "dateOfRecord"];

const BoolFormatter: NonNullable<
  DataTypeProviderProps["formatterComponent"]
> = ({ value }: DataTypeProvider.ValueFormatterProps) =>
  (value as boolean) ? <DoneIcon /> : null;

const BoolProvider = (props: DataTypeProviderProps) => (
  <DataTypeProvider {...props} formatterComponent={BoolFormatter} />
);
const boolColumns: DataTypeProviderProps["for"] = ["reconciled"];

const TableCell: React.FC<Table.DataCellProps> = (
  props: Table.DataCellProps
) => {
  const classes = useStyles();
  const className = useMemo(
    () =>
      (props.row as GridEntryFragment).type === JournalEntryType.Credit
        ? classes.creditCell
        : classes.debitCell,
    [
      (props.row as GridEntryFragment).type,
      classes.creditCell,
      classes.debitCell,
    ]
  );
  return <Table.Cell {...props} className={className} />;
};

const columns: ReadonlyArray<Column> = [
  {
    name: "date",
    title: "Date",
    getCellValue: ({ date }: GridEntryFragment) => new Date(date),
  },
  {
    name: "dateOfRecord",
    title: "Date of Record",
    getCellValue: (row: GridEntryFragment) =>
      new Date(row.dateOfRecord?.date || row.date),
  },
  {
    name: "type",
    title: "Type",
  },
  {
    name: "department",
    title: "Department",
    getCellValue: ({ department }: GridEntryFragment) => department.name,
  },
  {
    name: "category",
    title: "Category",
    getCellValue: ({ category }: GridEntryFragment) => category.name,
  },
  {
    name: "paymentMethod",
    title: "Payment Method",
    getCellValue: ({ paymentMethod }: GridEntryFragment) =>
      paymentMethod.parent?.id === CHECK_ID
        ? `CK-${paymentMethod.name}`
        : paymentMethod.name,
  },
  {
    name: "description",
    title: "Description",
  },
  {
    name: "total",
    title: "Total",
    getCellValue: ({ total }: GridEntryFragment) => rationalToFraction(total),
  },
  {
    name: "source",
    title: "Source",
    getCellValue: ({ source }: GridEntryFragment) => {
      if (source.__typename === "Person") {
        return `${source.personName.first} ${source.personName.last}`;
      } else {
        return source.name;
      }
    },
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
    return rows.reduce(
      (sum: Fraction, row: GridEntryFragment) =>
        row.type === JournalEntryType.Credit
          ? sum.add(getValue(row))
          : sum.sub(getValue(row)),
      new Fraction(0)
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

type ColumnVisibility = NonNullable<
  TableColumnVisibilityProps["hiddenColumnNames"]
>;
const useColumnVisibility = (
  cachePrefix = ""
): [ColumnVisibility, Dispatch<ColumnVisibility>] => {
  const key = useMemo(() => `${md5(cachePrefix)}_COLUMN_VISIBILITY_KEY`, [
    cachePrefix,
  ]);

  const iniState: ColumnVisibility = useMemo(() => {
    if (window.localStorage) {
      const cachedColumnVisibility = window.localStorage.getItem(key);
      if (cachedColumnVisibility) {
        return JSON.parse(cachedColumnVisibility) as ColumnVisibility;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [key]);

  const [columnOrder, setColumnVisibilityNative] = useState<ColumnVisibility>(
    iniState
  );

  const setColumnVisibility = useCallback<Dispatch<ColumnVisibility>>(
    (value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setColumnVisibilityNative(value);
    },
    [setColumnVisibilityNative, key]
  );

  return [columnOrder, setColumnVisibility];
};

type ColumnOrder = NonNullable<TableColumnReorderingProps["defaultOrder"]>;
const defaultColumnOrder: ColumnOrder = columns.map((column) => column.name);
const useColumnOrder = (
  cachePrefix = ""
): [ColumnOrder, Dispatch<ColumnOrder>] => {
  const key = useMemo(() => `${md5(cachePrefix)}_COLUMN_ORDER_KEY`, [
    cachePrefix,
  ]);

  const iniState: ColumnOrder = useMemo(() => {
    if (window.localStorage) {
      const cachedColumnOrder = window.localStorage.getItem(key);
      if (cachedColumnOrder) {
        return JSON.parse(cachedColumnOrder) as ColumnOrder;
      } else {
        return defaultColumnOrder;
      }
    } else {
      return defaultColumnOrder;
    }
  }, [key]);

  const [columnOrder, setColumnOrderNative] = useState<ColumnOrder>(iniState);

  const setColumnOrder = useCallback<Dispatch<ColumnOrder>>(
    (value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setColumnOrderNative(value);
    },
    [setColumnOrderNative, key]
  );

  return [columnOrder, setColumnOrder];
};

const useColumnWidths = (
  cachePrefix = ""
): [TableColumnWidthInfo[], Dispatch<TableColumnWidthInfo[]>] => {
  const key = useMemo(() => `${md5(cachePrefix)}_COLUMN_WIDTHS_KEY`, [
    cachePrefix,
  ]);

  const iniState: TableColumnWidthInfo[] = useMemo(() => {
    if (window.localStorage) {
      const cachedColumnWidths = window.localStorage.getItem(key);
      if (cachedColumnWidths) {
        return JSON.parse(cachedColumnWidths) as TableColumnWidthInfo[];
      } else {
        return defaultColumnWidths as TableColumnWidthInfo[];
      }
    } else {
      return defaultColumnWidths as TableColumnWidthInfo[];
    }
  }, [key]);

  const [columnWidths, setColumnWidthsNative] = useState<
    TableColumnWidthInfo[]
  >(iniState);

  const setColumnWidths = useCallback<Dispatch<TableColumnWidthInfo[]>>(
    (value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setColumnWidthsNative(value);
    },
    [setColumnWidthsNative, key]
  );

  return [columnWidths, setColumnWidths];
};

const defaultSorting: Sorting[] = [
  { columnName: "dateOfRecord", direction: "asc" },
];
const useSorting = (cachePrefix = ""): [Sorting[], Dispatch<Sorting[]>] => {
  const key = useMemo(() => `${md5(cachePrefix)}_SORTING_KEY`, [cachePrefix]);

  const iniState: Sorting[] = useMemo(() => {
    if (window.localStorage) {
      const cachedSorting = window.localStorage.getItem(key);
      if (cachedSorting) {
        return JSON.parse(cachedSorting) as Sorting[];
      } else {
        return defaultSorting;
      }
    } else {
      return defaultSorting;
    }
  }, [key]);

  const [sorting, setSortingNative] = useState<Sorting[]>(iniState);

  const setSorting = useCallback<Dispatch<Sorting[]>>(
    (value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setSortingNative(value);
    },
    [setSortingNative, key]
  );

  return [sorting, setSorting];
};

const integratedSortingColumnExtensions: IntegratedSorting.ColumnExtension[] = [
  { columnName: "total", compare: (a: Fraction, b: Fraction) => a.compare(b) },
  { columnName: "date", compare: compareAsc },
  { columnName: "dateOfRecord", compare: compareAsc },
  { columnName: "dateOfRecord", compare: compareAsc },
];

export type Props = {
  where?: JournalEntiresWhere;
  layoutCacheKey?: string;
};
const JournalGrid: React.FC<Props> = (props: Props) => {
  const variables = useMemo<GridEntriesQueryVariables>(
    () => ({
      where: props.where,
    }),
    [props.where]
  );

  const cachePrefix = useMemo<string>(
    () => props.layoutCacheKey ?? JSON.stringify(props.where),

    [props.where, props.layoutCacheKey]
  );

  const { loading, error, data } = useQuery<
    GridEntriesQuery,
    GridEntriesQueryVariables
  >(GRID_ENTRIES, {
    variables,
  });

  const rows = useMemo<GridEntriesQuery["journalEntries"]>(() => {
    if (!data?.journalEntries) {
      return [];
    }
    return data.journalEntries.reduce(
      (entries: GridEntryFragment[], entry: GridEntryFragment) => {
        if (entry.deleted) {
          return entries;
        }

        entries.push(entry);

        if (entry.refunds.length > 0) {
          console.log(entry.refunds);
          const type =
            entry.type === JournalEntryType.Credit
              ? JournalEntryType.Debit
              : JournalEntryType.Credit;

          for (const refund of entry.refunds) {
            if (refund.deleted) {
              continue;
            }

            entries.push({
              ...entry,
              ...(refund as Omit<GridRefundFragment, "__typename">),
              type,
            });
          }
        }

        return entries;
      },
      [] as GridEntryFragment[]
    );
  }, [data?.journalEntries]);

  const [columnOrder, setColumnOrder] = useColumnOrder(cachePrefix);

  const [columnWidths, setColumnWidths] = useColumnWidths(cachePrefix);

  const [hiddenColumnNames, setHiddenColumnNames] = useColumnVisibility(
    cachePrefix
  );

  const [sorting, setSorting] = useSorting(cachePrefix);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Paper>
      <Box height="100vh" display="flex">
        <Grid columns={columns} rows={rows} getRowId={getRowId}>
          <DragDropProvider />
          <DateTypeProvider for={dateColumns} />
          <CurrencyTypeProvider for={currencyColumns} />
          <BoolProvider for={boolColumns} />
          <SummaryState totalItems={(totalItems as unknown) as SummaryItem[]} />
          <IntegratedSummary calculator={summaryCalculator} />
          <SortingState sorting={sorting} onSortingChange={setSorting} />
          <IntegratedSorting
            columnExtensions={integratedSortingColumnExtensions}
          />
          <VirtualTable cellComponent={TableCell} />

          <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange={setColumnWidths}
          />
          <TableColumnReordering
            order={columnOrder}
            onOrderChange={setColumnOrder}
          />
          <TableHeaderRow showSortingControls />
          <TableColumnVisibility
            hiddenColumnNames={hiddenColumnNames}
            onHiddenColumnNamesChange={setHiddenColumnNames}
          />
          <Toolbar />
          <ColumnChooser />
          <TableSummaryRow
            messages={(messages as unknown) as TableSummaryRowProps["messages"]}
          />
        </Grid>
      </Box>
      {loading && <OverlayLoading zIndex="modal" />}
    </Paper>
  );
};

export default JournalGrid;
