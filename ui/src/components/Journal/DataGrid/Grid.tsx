import React, { useMemo, useState } from "react";
import { Box, Paper } from "@material-ui/core";
import {
  Column,
  DataTypeProviderProps,
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
  Toolbar,
  VirtualTable,
  SearchPanel,
  TableFilterRow,
} from "@devexpress/dx-react-grid-material-ui";
import { green, red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import { compareAsc } from "date-fns";
import Fraction from "fraction.js";
import md5 from "md5";
import { Plugin, Getter } from "@devexpress/dx-react-core";
import {
  EntriesWhere,
  GridEntryFragment,
  GridRefundFragment,
  GridEntriesQuery,
  GridEntriesQueryVariables,
  EntryType,
} from "../../../apollo/graphTypes";
import { deserializeDate, deserializeRational } from "../../../apollo/scalars";
import { GRID_ENTRIES } from "./Grid.gql";
import OverlayLoading from "../../utils/OverlayLoading";
import useLocalStorage from "../../utils/useLocalStorage";
import {
  FilterColumnsState,
  Filters,
  FilterCell,
  FilterCellProvider,
  FilterCellProviderProps,
  FilterCellComponent,
} from "./plugins";
import {
  DefaultEditor,
  DateFilter,
  CategoryFilter,
  DeptFilter,
  PayMethodFilter,
  ReconciledFilter,
  SourceFilter,
  TypeFilter,
  RationalFilter,
  DateFilterColumnExtension,
  CategoryFilterColumnExtension,
  DeptFilterColumnExtension,
  PayMethodFilterColumnExtension,
  RationalFilterColumnExtension,
  SrcFilterColumnExtension,
} from "./filters";
import { DeptInputOpt } from "../../Inputs/departmentInputUtils";
import { CategoryInputOpt } from "../../Inputs/categoryInputUtils";
import { PayMethodInputOpt } from "../../Inputs/paymentMethodInputUtils";
import { SrcTypedInputOpt } from "../../Inputs/sourceInputUtils";
import {
  BoolProvider,
  DateProvider,
  DateProviderProps,
  RationalProvider,
  RationalProviderProps,
  DeptProvider,
  DeptProviderProps,
  CategoryProvider,
  CategoryProviderProps,
  PayMethodProvider,
  PayMethodProviderProps,
  SourceProvider,
  SourceProviderProps,
} from "./dataTypeProviders";
import { payMethodToStr } from "./dataTypeProviders/PayMethodProvider";
import { sourceToStr } from "./dataTypeProviders/SourceProvider";

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

const currencyFormat: RationalProviderProps["format"] = {
  total: {
    locales: "en-US",
    options: { style: "currency", currency: "USD" },
  },
} as const;
const currencyColumns: RationalProviderProps["for"] = ["total"];

const dateDefaultFormat = ({
  locales: "en-US",
  options: { month: "short", day: "2-digit", year: "numeric" },
} as unknown) as Readonly<DateProviderProps["defaultFormat"]>;
const dateColumns: DataTypeProviderProps["for"] = ["date", "dateOfRecord"];

const boolColumns: DataTypeProviderProps["for"] = ["reconciled"];
const deptColumns: DeptProviderProps["for"] = ["department"];
const categoryColumns: CategoryProviderProps["for"] = ["category"];
const payMethodColumns: PayMethodProviderProps["for"] = ["paymentMethod"];
const sourceColumns: SourceProviderProps["for"] = ["source"];

const TableCell: React.FC<Table.DataCellProps> = (
  props: Table.DataCellProps
) => {
  const classes = useStyles();
  return (
    <Table.Cell
      {...props}
      className={
        (props.row as GridEntryFragment).type === EntryType.Credit
          ? classes.creditCell
          : classes.debitCell
      }
    />
  );
};

const columns: ReadonlyArray<Column> = [
  {
    name: "date",
    title: "Date",
    getCellValue: ({ date }: GridEntryFragment) => deserializeDate(date),
  },
  {
    name: "dateOfRecord",
    title: "Date of Record",
    getCellValue: (row: GridEntryFragment) =>
      deserializeDate(row.dateOfRecord?.date || row.date),
  },
  {
    name: "type",
    title: "Type",
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
    getCellValue: ({ total }: GridEntryFragment) => deserializeRational(total),
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
const columnWidthUpdater = (
  cachedValue: TableColumnWidthInfo[],
  defaultValue: TableColumnWidthInfo[]
): TableColumnWidthInfo[] => {
  const defaultColumns = defaultValue.reduce(
    (defaultColumns, defaultColumn) =>
      defaultColumns.set(defaultColumn.columnName, defaultColumn),
    new Map<string, TableColumnWidthInfo>()
  );

  const columnWidths = cachedValue.filter((column) => {
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
};

const defaultColumnOrder: NonNullable<
  TableColumnReorderingProps["defaultOrder"]
> = columns.map((column) => column.name);

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
  dateDefaultFormat?.options
);
const currencyToString = new Intl.NumberFormat(
  currencyFormat.total.locales,
  currencyFormat.total.options
);
const integratedFilteringColumnExtensions: IntegratedFiltering.ColumnExtension[] = [
  DateFilterColumnExtension("date", (date) => dateToString.format(date)),
  DateFilterColumnExtension("dateOfRecord", (date) =>
    dateToString.format(date)
  ),
  CategoryFilterColumnExtension("category", (value) => value.name),
  DeptFilterColumnExtension("department", (value) => value.name),
  PayMethodFilterColumnExtension("paymentMethod", payMethodToStr),
  RationalFilterColumnExtension(
    "total",
    (value) => `${value.toString()} ${currencyToString.format(value.valueOf())}`
  ),
  SrcFilterColumnExtension("source", sourceToStr),
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
};
const JournalGrid: React.FC<Props> = (props: Props) => {
  const variables = useMemo<GridEntriesQueryVariables>(
    () => ({
      where: props.where,
    }),
    [props.where]
  );

  const cachePrefix = useMemo<string>(
    () => props.layoutCacheKey ?? `${md5(JSON.stringify(props.where))}`,

    [props.where, props.layoutCacheKey]
  );
  const { loading, error, data } = useQuery<
    GridEntriesQuery,
    GridEntriesQueryVariables
  >(GRID_ENTRIES, {
    variables,
  });

  const rows = useMemo<GridEntriesQuery["entries"]>(() => {
    if (!data?.entries) {
      return [];
    }

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

    return rows;
  }, [data?.entries]);

  const filterCellProviderProps = useMemo<FilterCellProviderProps>(() => {
    const props: FilterCellProviderProps<
      | "category"
      | "date"
      | "dateOfRecord"
      | "department"
      | "paymentMethod"
      | "reconciled"
      | "source"
      | "total"
      | "type"
    > = {
      filterCell: {
        category: (CategoryFilter as unknown) as FilterCellComponent,
        date: DateFilter,
        dateOfRecord: DateFilter,
        department: (DeptFilter as unknown) as FilterCellComponent,
        paymentMethod: (PayMethodFilter as unknown) as FilterCellComponent,
        reconciled: ReconciledFilter,
        source: (SourceFilter as unknown) as FilterCellComponent,
        total: RationalFilter,
        type: TypeFilter,
      },
      filterCellProps: {},
    };

    const deptFilterOpts = new Map<string, DeptInputOpt>();
    const categoryFilterOpts = new Map<string, CategoryInputOpt>();
    const payMethodFilterOpts = new Map<string, PayMethodInputOpt>();
    const srcFilterOpts = new Map<string, SrcTypedInputOpt>();

    for (const row of rows) {
      const { department, category, paymentMethod, source } = row;

      if (!deptFilterOpts.has(department.id)) {
        deptFilterOpts.set(department.id, department as DeptInputOpt);
      }

      if (!categoryFilterOpts.has(category.id)) {
        categoryFilterOpts.set(category.id, category as CategoryInputOpt);
      }

      if (!payMethodFilterOpts.has(paymentMethod.id)) {
        payMethodFilterOpts.set(
          paymentMethod.id,
          paymentMethod as PayMethodInputOpt
        );
      }

      const srcKey = `${source.__typename}_${source.id}`;
      if (!srcFilterOpts.has(srcKey)) {
        srcFilterOpts.set(srcKey, source as SrcTypedInputOpt);
      }
    }

    (props.filterCellProps as NonNullable<
      FilterCellProviderProps["filterCellProps"]
    >).department = {
      deptFilterOpts: Array.from(deptFilterOpts.values()),
    };
    (props.filterCellProps as NonNullable<
      FilterCellProviderProps["filterCellProps"]
    >).category = {
      categoryFilterOpts: Array.from(categoryFilterOpts.values()),
    };
    (props.filterCellProps as NonNullable<
      FilterCellProviderProps["filterCellProps"]
    >).paymentMethod = {
      payMethodFilterOpts: Array.from(payMethodFilterOpts.values()),
    };
    (props.filterCellProps as NonNullable<
      FilterCellProviderProps["filterCellProps"]
    >).source = {
      srcFilterOpts: Array.from(srcFilterOpts.values()),
    };

    return props;
  }, [rows]);

  const [columnOrder, setColumnOrder] = useLocalStorage(
    defaultColumnOrder,
    `column_order_${cachePrefix}`
  );

  const [columnWidths, setColumnWidths] = useLocalStorage(
    defaultColumnWidths as TableColumnWidthInfo[],
    `column_widths_${cachePrefix}`,
    columnWidthUpdater
  );
  const [hiddenColumnNames, setHiddenColumnNames] = useLocalStorage(
    [] as NonNullable<TableColumnVisibilityProps["hiddenColumnNames"]>,
    `column_visibility_${cachePrefix}`
  );

  const [sorting, setSorting] = useLocalStorage(
    defaultSorting,
    `column_visibility_sorting${cachePrefix}`
  );

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
          <DateProvider defaultFormat={dateDefaultFormat} for={dateColumns} />
          <RationalProvider format={currencyFormat} for={currencyColumns} />
          <BoolProvider for={boolColumns} />
          <DeptProvider for={deptColumns} />
          <CategoryProvider for={categoryColumns} />
          <PayMethodProvider for={payMethodColumns} />
          <SourceProvider for={sourceColumns} />

          {/* State Plugins */}
          <SearchState />
          <DevExplorer getters={useMemo(() => ["filterExpression"], [])} />
          <FilterColumnsState filters={filters} onFiltersChange={setFilters} />
          {/* <DevExplorer getters={useMemo(() => ["filterExpression"], [])} /> */}
          <SortingState sorting={sorting} onSortingChange={setSorting} />
          <SummaryState totalItems={(totalItems as unknown) as SummaryItem[]} />
          {/* Data Processing Plugins */}
          <IntegratedFiltering
            columnExtensions={integratedFilteringColumnExtensions}
          />
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

          <TableFilterRow
            showFilterSelector
            cellComponent={FilterCell}
            editorComponent={DefaultEditor}
          />
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
          <FilterCellProvider {...filterCellProviderProps} />
        </Grid>
      </Box>
      {loading && <OverlayLoading zIndex="modal" />}
    </Paper>
  );
};

export default JournalGrid;
