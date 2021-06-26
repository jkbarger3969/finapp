import React, { useCallback, useMemo, useState } from "react";
import { Box, Paper } from "@material-ui/core";
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
  EditingState,
  EditingStateProps,
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
  TableEditColumn,
  TableEditRow,
  // TableInlineCellEditing
} from "@devexpress/dx-react-grid-material-ui";
import { green, red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import { compareAsc } from "date-fns";
import Fraction from "fraction.js";
import { ValueNode } from "mui-tree-select";
import md5 from "md5";
import { Plugin, Getter } from "@devexpress/dx-react-core";
import {
  EntriesWhere,
  GridEntryFragment,
  GridRefundFragment,
  GridEntriesQuery,
  GridEntriesQueryVariables,
  EntryType,
  DepartmentsWhere,
  AccountsWhere,
} from "../../../apollo/graphTypes";
import { deserializeDate, deserializeRational } from "../../../apollo/scalars";
import { GRID_ENTRIES } from "./Grid.gql";
import OverlayLoading from "../../utils/OverlayLoading";
import useLocalStorage from "../../utils/useLocalStorage";
import {
  FilterColumnsState,
  Filters,
  DataCell,
  EditCell,
  FilterCell,
  DataCellProvider,
  EditCellProvider,
  FilterCellProvider,
  CellProviderProps,
  AddCellProvider,
} from "./plugins";
import {
  BoolCell,
  BoolFilter,
  BoolFilterProps,
  BoolEditor,
  CategoryCell,
  CategoryFilter,
  categoryFilterColumnExtension,
  CategoryFilterProps,
  CategoryEditor,
  DateCell,
  DateFilter,
  dateFilterColumnExtension,
  DateEditor,
  DeptCell,
  DeptFilter,
  deptFilterColumnExtension,
  DeptFilterProps,
  DeptEditor,
  PayMethodCell,
  PayMethodEditor,
  PayMethodEditorProps,
  RationalCell,
  RationalFilter,
  rationalFilterColumnExtension,
  RationalFilterProps,
  SourceCell,
  SourceFilter,
  sourceFilterColumnExtension,
  SourceFilterProps,
  SourceEditor,
  sourceToStr,
  TypeFilter,
  RationalEditor,
  RationalEditorProps,
} from "./cells";
import { DefaultEditor } from "./filters";
import { DepartmentInputOpt } from "../../Inputs/Department";
import {
  CategoryInputOpt,
  getOptionLabel as getCategoryOptionLabel,
} from "../../Inputs/Category";
import { EntityInputOpt } from "../../Inputs/Entity";
import { mergeTableCellProps } from "./plugins/TableCell";
import { AddEntry, AddEntryProps } from "./forms/AddEntry";

export type GridRefund = Omit<GridRefundFragment, "date" | "total"> & {
  date: Date;
  total: Fraction;
};

export type GridEntry = Omit<
  GridEntryFragment,
  "date" | "dateOfRecord" | "total" | "__typename"
> & {
  __typename:
    | GridEntryFragment["__typename"]
    | GridRefundFragment["__typename"];
  date: Date;
  dateOfRecord?: Omit<GridEntryFragment["dateOfRecord"], "date"> & {
    date: Date;
  };
  total: Fraction;
  refunds: GridRefund[];
};

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

const disableNonRefundFields = (
  props: TableEditRow.CellProps
): TableEditRow.CellProps & { disabled?: boolean } => {
  if ((props.row as GridEntry).__typename === "EntryRefund") {
    return {
      ...props,
      disabled: true,
    };
  }

  return props;
};

const defaultEditCellProviderProps = {
  reconciled: {
    cell: BoolEditor,
  },
  total: {
    cell: RationalEditor,
    props: {
      rationalInputProps: {
        InputProps: {
          startAdornment: "$",
        },
      },
    } as RationalEditorProps,
  },
  date: {
    cell: DateEditor,
  },
  department: {
    cell: DeptEditor,
    props: disableNonRefundFields,
  },
  dateOfRecord: {
    cell: DateEditor,
    props: disableNonRefundFields,
  },
  category: {
    cell: CategoryEditor,
    props: disableNonRefundFields,
  },
  paymentMethod: {
    cell: PayMethodEditor,
  },
  source: {
    cell: SourceEditor,
    props: (props) => disableNonRefundFields(props),
  },
} as CellProviderProps<ColumnsNames>;

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
    return rows
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dateDefaultFormat?.options as any
);
const currencyToString = new Intl.NumberFormat(
  currencyFormat.locales,
  currencyFormat.options
);
const integratedFilteringColumnExtensions: IntegratedFiltering.ColumnExtension[] = [
  dateFilterColumnExtension("date", (date) => dateToString.format(date)),
  dateFilterColumnExtension("dateOfRecord", (date) =>
    dateToString.format(date)
  ),
  categoryFilterColumnExtension("category", (value) =>
    getCategoryOptionLabel(new ValueNode(value))
  ),
  deptFilterColumnExtension("department", (value) => value.name),
  rationalFilterColumnExtension(
    "total",
    (value) => `${value.toString()} ${currencyToString.format(value.valueOf())}`
  ),
  sourceFilterColumnExtension("source", sourceToStr),
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
  selectableDepts: DepartmentsWhere;
  selectableAccounts: AccountsWhere;
  layoutCacheKey?: string;
};
const JournalGrid: React.FC<Props> = (props: Props) => {
  const classes = useStyles();

  type ChangeSet = {
    added?: Record<string, unknown>[];
    changed?: Record<string, unknown>[];
    deleted?: string[];
  };

  const [state, setState] = useState<
    Required<Pick<EditingStateProps, "editingRowIds">> & {
      changes: ChangeSet;
      openAddEntry: boolean;
    }
  >({
    editingRowIds: [],
    changes: {},
    openAddEntry: true,
  });

  const onCommitChanges = useCallback<(changes: ChangeSet) => void>(
    (changes) =>
      setState((state) => ({
        ...state,
        changes,
      })),
    []
  );

  const TableRow = useCallback((props: Table.DataRowProps) => {
    const { id } = props.row as GridEntryFragment;

    return (
      <Table.Row
        {...props}
        onDoubleClick={useCallback(
          () =>
            setState((state) => ({
              ...state,
              editingRowIds: state.editingRowIds.includes(id)
                ? state.editingRowIds.filter((curId) => curId === id)
                : [...state.editingRowIds, id],
            })),
          []
        )}
      />
    );
  }, []);

  const onEditingRowIdsChange = useCallback<
    NonNullable<EditingStateProps["onEditingRowIdsChange"]>
  >(
    (editingRowIds) =>
      setState((state) => ({
        ...state,
        editingRowIds,
      })),
    []
  );

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

  const rows = useMemo<GridEntry[]>(() => {
    if (!data?.entries) {
      return [];
    }

    const rows = data.entries.reduce((entries, entryRaw: GridEntryFragment) => {
      if (entryRaw.deleted) {
        return entries;
      }

      const entry = {
        ...entryRaw,
        date: deserializeDate(entryRaw.date),
        dateOfRecord: entryRaw.dateOfRecord
          ? {
              ...entryRaw.dateOfRecord,
              date: deserializeDate(entryRaw.dateOfRecord.date),
            }
          : undefined,
        total: deserializeRational(entryRaw.total),
        refunds: entryRaw.refunds.map((refund) => ({
          ...refund,
          date: deserializeDate(refund.date),
          total: deserializeRational(refund.total),
        })),
      };

      entries.push(entry as GridEntry);

      if (entry.refunds.length > 0) {
        for (const refund of entry.refunds) {
          if (refund.deleted) {
            continue;
          }

          const refundEntry = {
            ...entry,
            ...refund,
          };

          entries.push((refundEntry as unknown) as GridEntry);
        }
      }

      return entries;
    }, [] as GridEntry[]);

    return rows;
  }, [data?.entries]);

  const filterCellProviderProps = useMemo<
    CellProviderProps<ColumnsNames>
  >(() => {
    const deptFilterOpts = new Map<string, DepartmentInputOpt>();
    const categoryFilterOpts = new Map<string, CategoryInputOpt>();
    const srcFilterOpts = new Map<string, EntityInputOpt>();

    for (const row of rows) {
      const { department, category, source } = row;

      if (!deptFilterOpts.has(department.id)) {
        deptFilterOpts.set(department.id, department as DepartmentInputOpt);
      }

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
      type: {
        cell: TypeFilter,
      },
    };
  }, [rows]);

  const editCellProviderProps = useMemo<CellProviderProps<ColumnsNames>>(() => {
    return {
      ...defaultEditCellProviderProps,
      department: {
        ...(defaultEditCellProviderProps.department || {}),
        props: mergeTableCellProps(
          defaultEditCellProviderProps.department?.props || {},
          {
            root: props.selectableDepts,
          },
          disableNonRefundFields
        ),
      },
      paymentMethod: {
        ...(defaultEditCellProviderProps.paymentMethod || {}),
        props: mergeTableCellProps(
          defaultEditCellProviderProps.paymentMethod?.props || {},
          {
            accounts: props.selectableAccounts,
          } as PayMethodEditorProps
        ),
      },
    } as CellProviderProps<ColumnsNames>;
  }, [props.selectableDepts, props.selectableAccounts]);

  const addEntryProps = useMemo<
    Pick<AddEntryProps, "department" | "paymentMethod">
  >(
    () => ({
      paymentMethod: { accounts: props.selectableAccounts },
      department: {
        root: props.selectableDepts,
      },
    }),
    [props.selectableDepts, props.selectableAccounts]
  );

  const onCloseAddEntry = useCallback(
    () =>
      setState((state) => ({
        ...state,
        openAddEntry: false,
      })),
    []
  );

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

  const devExplorerGetters = useMemo(
    () => ["editingRowIds", "editingCells", "rowChanges"],
    []
  );

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

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Paper>
      <Box height="100vh" display="flex">
        <Grid columns={columns} rows={rows} getRowId={getRowId}>
          {/* UI plugins */}
          <DragDropProvider />

          {/* State Plugins */}
          <EditingState
            editingRowIds={state.editingRowIds}
            onEditingRowIdsChange={onEditingRowIdsChange}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onCommitChanges={onCommitChanges as any}
          />
          <SearchState />
          {/* <DevExplorer getters={devExplorerGetters} /> */}
          <FilterColumnsState filters={filters} onFiltersChange={setFilters} />

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

          <VirtualTable cellComponent={DataCell} rowComponent={TableRow} />
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
          <TableEditRow cellComponent={EditCell} rowHeight={53} />
          <DataCellProvider {...dataCellProviderProps} />
          <FilterCellProvider {...filterCellProviderProps} />
          <EditCellProvider {...editCellProviderProps} />
          <AddCellProvider {...editCellProviderProps} />
          <TableEditColumn showAddCommand showDeleteCommand />
        </Grid>
      </Box>
      {loading && <OverlayLoading zIndex="modal" />}
      <AddEntry
        {...addEntryProps}
        open={state.openAddEntry}
        onClose={onCloseAddEntry}
        maxWidth="xl"
        fullWidth
      />
    </Paper>
  );
};

export default JournalGrid;
