import React, { useMemo, useState, Dispatch, useCallback, useRef } from "react";
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
  // FilteringState,
  // IntegratedFiltering,
  // Filter,
  SearchState,
  TableFilterRow as TableFilterRowNS,
  GetCellValueFn,
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
  SearchPanel,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import { green, red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { Done as DoneIcon } from "@material-ui/icons";
import { useQuery } from "@apollo/client";
import { format, compareAsc } from "date-fns";
import Fraction from "fraction.js";
import md5 from "md5";
import { Plugin, Getter } from "@devexpress/dx-react-core";
import Fuse from "fuse.js";

import {
  EntriesWhere,
  GridEntryFragment,
  GridRefundFragment,
  GridEntriesQuery,
  GridEntriesQueryVariables,
  EntryType,
} from "../../../apollo/graphTypes";
import { deserializeRational } from "../../../apollo/scalars";
import { GRID_ENTRIES } from "./Grid.gql";
import OverlayLoading from "../../utils/OverlayLoading";
import { CHECK_ID } from "../constants";
import { FilterColumnsState, Filters } from "./plugins";
import {
  FilterCell,
  FilterColumnsStateProvider,
  FilterColumnsStateProviderProps,
  FilterColumns,
} from "./filters";
import { NodeType, Option } from "mui-tree-select";
import { DeptInputOpt } from "../../Inputs/DepartmentInput";
import { CategoryInputOpt } from "../../Inputs/CategoryInput";
import { PayMethodInputOpt } from "../../Inputs/PaymentMethodInput";

export type FilterOperations = keyof Omit<
  TableFilterRowNS.LocalizationMessages,
  "filterPlaceholder"
>;

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
      (props.row as GridEntryFragment).type === EntryType.Credit
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
    name: "id",
    title: "Id",
  },
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
    getCellValue: ({ total }: GridEntryFragment) => deserializeRational(total),
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
    return rows
      .reduce(
        (sum: Fraction, row: GridEntryFragment) =>
          row.type === EntryType.Credit
            ? sum.add(getValue(row))
            : sum.sub(getValue(row)),
        new Fraction(0)
      )
      .valueOf();
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
        const defaultColumns = defaultColumnWidths.reduce(
          (defaultColumns, defaultColumn) =>
            defaultColumns.set(defaultColumn.columnName, defaultColumn),
          new Map<string, TableColumnWidthInfo>()
        );

        const columnWidths = (JSON.parse(
          cachedColumnWidths
        ) as TableColumnWidthInfo[]).filter((column) => {
          if (defaultColumns.has(column.columnName)) {
            defaultColumns.delete(column.columnName);
            return true;
          } else {
            // Remove replaced columns
            return false;
          }
        });

        // Add NEW defaults
        columnWidths.push(...defaultColumns.values());

        return columnWidths;
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

// Dev Helper
const DevExplorer = (props: {
  getters?: string[];
  actions?: string[];
}): JSX.Element => {
  return (
    <Plugin name="DevExplorer">
      <Getter
        name="searchValue"
        computed={(getters, actions) => {
          if (props.getters) {
            for (const getter of props.getters) {
              console.log(`Getter: ${getter}:`, getters[getter]);
            }
          }
          if (props.actions) {
            for (const action of props.actions) {
              console.log(`Action: ${action}:`, actions[action]);
            }
          }
          return getters.searchValue as unknown;
        }}
      />
    </Plugin>
  );
};

export type Props = {
  where?: EntriesWhere;
  layoutCacheKey?: string;
  filterColumnsState?: FilterColumnsStateProviderProps;
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

  const { current: fuse } = useRef(
    (() => {
      const [keys, getFnMap] = columns.reduce(
        (returns, { name, getCellValue }) => {
          const [keys, getFnMap] = returns;
          switch (name) {
            // Do NOT Included
            case "id":
            case "type":
            case "reconciled":
              break;
            case "date":
            case "dateOfRecord":
              keys.push(name);
              getFnMap.set(name, (obj, path) => {
                const cellValue = (getCellValue as GetCellValueFn)(
                  obj,
                  path as string
                ) as Date;

                return [
                  (cellValue as Date).toISOString(),
                  format(cellValue as Date, "M/d/yy"),
                  format(cellValue as Date, "MM/d/yy"),
                  format(cellValue as Date, "M/d/yyyy"),
                  format(cellValue as Date, "MM/d/yyyy"),
                  format(cellValue as Date, "MMM dd, yyyy"),
                ];
              });
              break;

            case "total":
              keys.push(name);
              getFnMap.set(name, (obj, path) => {
                return ((getCellValue as GetCellValueFn)(
                  obj,
                  path as string
                ) as Fraction).toString();
              });
              break;
            default:
              keys.push(name);
              if (getCellValue) {
                getFnMap.set(
                  name,
                  (obj, path) => getCellValue(obj, path as string) as string
                );
              }
          }
          return returns;
        },
        [[], new Map()] as [
          string[],
          Map<string, Fuse.FuseGetFunction<GridEntryFragment>>
        ]
      );

      return new Fuse<GridEntryFragment>([], {
        keys,
        getFn: (obj, path) => {
          if (Array.isArray(path)) {
            return path.reduce((values, path) => {
              const results = getFnMap.has(path)
                ? (getFnMap.get(
                    path
                  ) as Fuse.FuseGetFunction<GridEntryFragment>)(obj, path)
                : ((Fuse as unknown) as {
                    config: Required<Fuse.IFuseOptions<GridEntryFragment>>;
                  }).config.getFn(obj, path);

              if (Array.isArray(results)) {
                values.push(...(results as string[]));
              } else {
                values.push(results as string);
              }

              return values;
            }, [] as string[]);
          } else {
            return getFnMap.has(path)
              ? (getFnMap.get(path) as Fuse.FuseGetFunction<GridEntryFragment>)(
                  obj,
                  path
                )
              : ((Fuse as unknown) as {
                  config: Required<Fuse.IFuseOptions<GridEntryFragment>>;
                }).config.getFn(obj, path);
          }
        },
      });
    })()
  );

  const { loading, error, data } = useQuery<
    GridEntriesQuery,
    GridEntriesQueryVariables
  >(GRID_ENTRIES, {
    variables,
  });

  const rows = useMemo<GridEntriesQuery["entries"]>(() => {
    if (!data?.entries) {
      fuse.remove(() => true);
      return [];
    }

    console.log("Journal Entries Updated");

    const rows = data.entries.reduce((entries, entry: GridEntryFragment) => {
      if (entry.deleted) {
        return entries;
      }

      entries.push(entry);

      if (entry.refunds.length > 0) {
        const type =
          entry.type === EntryType.Credit ? EntryType.Debit : EntryType.Credit;

        for (const refund of entry.refunds) {
          if (refund.deleted) {
            continue;
          }

          const refundEntry = {
            ...entry,
            ...(refund as Omit<GridRefundFragment, "__typename">),
            type,
          };

          entries.push(refundEntry);
        }
      }

      return entries;
    }, [] as GridEntryFragment[]);

    fuse.setCollection(rows);

    return rows;
  }, [data?.entries, fuse]);

  const filterColumnsStateProviderProps = useMemo<FilterColumnsStateProviderProps>(() => {
    const props: FilterColumnsStateProviderProps = {};

    const deptFilterOpts = new Map<string, Option<DeptInputOpt>>();
    const categoryFilterOpts = new Map<string, Option<CategoryInputOpt>>();
    const payMethodFilterOpts = new Map<string, Option<PayMethodInputOpt>>();

    for (const row of rows) {
      const { department, category, paymentMethod } = row;

      if (!deptFilterOpts.has(department.id)) {
        deptFilterOpts.set(department.id, {
          option: {
            ...(department as DeptInputOpt),
          },
          type: NodeType.Leaf,
        });
      }

      if (!categoryFilterOpts.has(category.id)) {
        categoryFilterOpts.set(category.id, {
          option: {
            ...(category as CategoryInputOpt),
          },
          type: NodeType.Leaf,
        });
      }

      if (!payMethodFilterOpts.has(paymentMethod.id)) {
        payMethodFilterOpts.set(paymentMethod.id, {
          option: {
            ...(paymentMethod as PayMethodInputOpt),
          },
          type: NodeType.Leaf,
        });
      }
    }

    props.deptFilterOpts = Array.from(deptFilterOpts.values());
    props.categoryFilterOpts = Array.from(categoryFilterOpts.values());
    props.payMethodFilterOpts = Array.from(payMethodFilterOpts.values());

    return props;
  }, [rows]);

  const [columnOrder, setColumnOrder] = useColumnOrder(cachePrefix);

  const [columnWidths, setColumnWidths] = useColumnWidths(cachePrefix);

  const [hiddenColumnNames, setHiddenColumnNames] = useColumnVisibility(
    cachePrefix
  );

  const [sorting, setSorting] = useSorting(cachePrefix);

  const [filters, setFilters] = useState<Filters>([]);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Paper>
      <Box height="100vh" display="flex">
        <Grid columns={columns} rows={rows} getRowId={getRowId}>
          {/* UI plugins */}
          <DragDropProvider />
          <DateTypeProvider for={dateColumns} />
          <CurrencyTypeProvider for={currencyColumns} />
          <BoolProvider for={boolColumns} />

          {/* State Plugins */}
          <FilterColumnsState filters={filters} onFiltersChange={setFilters} />

          {/* <DevExplorer
            getters={useMemo(
              () => ["filterExpression", "columnFilters", "filters"],
              []
            )}
          /> */}
          <SearchState />
          <SortingState sorting={sorting} onSortingChange={setSorting} />
          <SummaryState totalItems={(totalItems as unknown) as SummaryItem[]} />
          {/* Data Processing Plugins */}
          <FilterColumns />
          <IntegratedSummary calculator={summaryCalculator} />
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

          <TableFilterRow showFilterSelector cellComponent={FilterCell} />
          <FilterColumnsStateProvider {...filterColumnsStateProviderProps} />
          <TableColumnVisibility
            hiddenColumnNames={hiddenColumnNames}
            onHiddenColumnNamesChange={setHiddenColumnNames}
          />
          <Toolbar />
          <SearchPanel />
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
