/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  FormEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Action,
  Getter,
  IDependency,
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
  TemplateProps,
} from "@devexpress/dx-react-core";
import {
  EditingState,
  IntegratedSelection,
  SelectionState,
  TableColumn,
  TableFilterRow,
} from "@devexpress/dx-react-grid";
import {
  Table,
  TableHeaderRow,
  TableEditColumn,
  TableSelection,
  TableFixedColumns,
} from "@devexpress/dx-react-grid-material-ui";
import {
  Tooltip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  SvgIconProps,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  TextFieldProps,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemSecondaryAction,
} from "@material-ui/core";
import {
  MoreVert as MoreVertIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  DoneAll as ReconcileIcon,
  Save as SaveIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
} from "@material-ui/icons";

import { UpsertEntry, UpsertEntryProps } from "../forms/UpsertEntry";
import { UpsertRefund, UpsertRefundProps } from "../forms/UpsertRefund";
import { DeleteEntry, DeleteEntryProps } from "../forms/DeleteEntry";
import { GridEntry } from "../Grid";
import { EntryType } from "../../../../apollo/graphTypes";
import {
  ReconcileEntries,
  ReconcileEntriesProps,
} from "../forms/ReconcileEntries";
import { DialogOnClose } from "../forms/shared";
import { ClearColumnFilters, LoadNamedFilter } from "./Filtering";
import {
  FiltersDef,
  AddNamedFilters,
  CancelAddedNamedFilters,
  CommitAddedNamedFilters,
  ChangeAddedNamedFilter,
  AddNamedFilterPayload,
  DeleteNamedFilters,
  CancelDeletedNamedFilters,
  CommitDeletedNamedFilters,
  ChangeNamedFilter,
  CancelChangedNamedFilters,
  CommitChangedNamedFilters,
  NamedFilters,
  NamedFiltersChanges,
} from ".";
import { TransitionProps } from "@material-ui/core/transitions";

const AddRefund = (props: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon {...props}>
      <path d="M2,15V12H5V10L9,13.5L5,17V15H2M22,8.7V10H10V8.7L16,5L22,8.7M10,17H22V19H10V17M15,11H17V16H15V11M11,11H13V16H11V11M19,11H21V16H19V11Z" />
    </SvgIcon>
  );
};
const GiveRefund = (props: SvgIconProps): JSX.Element => {
  return (
    <SvgIcon {...props}>
      <path d="M15,15V12H18V10L22,13.5L18,17V15H15M14,8.7V10H2V8.7L8,5L14,8.7M2,17H14V19H2V17M7,11H9V16H7V11M3,11H5V16H3V11M11,11H13V16H11V11Z" />
    </SvgIcon>
  );
};

const onCommitChanges = () => undefined;
export const EntryActionState = ({
  reconcileMode: reconcileModeProp,
  upsertEntryProps,
  upsertRefundProps,
  deleteEntryProps,
  reconcileEntriesProps,
}: {
  upsertEntryProps: UpsertEntryProps;
  upsertRefundProps: UpsertRefundProps;
  deleteEntryProps: DeleteEntryProps;
  reconcileEntriesProps: ReconcileEntriesProps;
  reconcileMode?: boolean;
}) => {
  const [reconcileMode, setReconcileMode] = useState(!!reconcileModeProp);
  const [confirmReconcile, setConfirmReconcile] = useState(false);

  return (
    <Plugin name="EntryActionState">
      <SelectionState />
      <Getter name="reconcileMode" value={reconcileMode} />
      <Getter name="confirmReconcile" value={confirmReconcile} />
      <Action
        name="toggleConfirmReconcile"
        action={useCallback(
          (showConfirmReconcile: boolean, { selection, reconcileMode }) => {
            if (reconcileMode && showConfirmReconcile && !selection.length) {
              return;
            }
            setConfirmReconcile(showConfirmReconcile);
          },
          []
        )}
      />
      <Getter
        name="selection"
        computed={useCallback(
          ({ selection, reconcileMode }) => (reconcileMode ? selection : []),
          []
        )}
      />
      <IntegratedSelection />
      <Action
        name="changeReconcileMode"
        action={useCallback(
          (reconcileMode, { selection }, { toggleSelectAll }) => {
            setReconcileMode(reconcileMode);
            if (selection.length) {
              toggleSelectAll(false);
            }
          },
          []
        )}
      />
      <Getter
        name="rows"
        computed={useCallback(
          ({ rows, reconcileMode }) =>
            reconcileMode
              ? (rows as GridEntry[]).filter(({ reconciled }) => !reconciled)
              : rows,
          []
        )}
      />
      <EditingState onCommitChanges={onCommitChanges} />
      <Getter name="upsertEntryProps" value={upsertEntryProps} />
      <Getter name="upsertRefundProps" value={upsertRefundProps} />
      <Getter name="deleteEntryProps" value={deleteEntryProps} />
      <Getter name="reconcileEntriesProps" value={reconcileEntriesProps} />
    </Plugin>
  );
};

const SelectHeaderCell = React.memo(function SelectHeaderCell(
  props: TableSelection.HeaderCellProps & {
    toggleConfirmReconcile: (open: boolean) => void;
  }
): JSX.Element {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allSelected,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tableColumn,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tableRow,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disabled,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onToggle,
    someSelected,
    toggleConfirmReconcile,
    ...rest
  } = props;
  return (
    <TableCell {...rest} align="center" padding="checkbox" variant="head">
      <IconButton
        onClick={useCallback(
          () => toggleConfirmReconcile(true),
          [toggleConfirmReconcile]
        )}
        disabled={!someSelected}
        size="small"
        color="secondary"
      >
        <ReconcileIcon />
      </IconButton>
    </TableCell>
  );
});

const EditColumnCell = React.memo(function EditColumnCell(
  props: TableEditColumn.CellProps & {
    addRow: () => void;
    addedRows: any[];
    startEditRows: (arg: { rowIds: string[] }) => void;
    changeAddedRow: (arg: { rowId: number; change: any }) => void;
    deleteRows: (arg: { rowIds: string[] }) => void;
  }
): JSX.Element {
  const {
    addedRows,
    addRow,
    startEditRows,
    changeAddedRow,
    deleteRows,
    ...rest
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const row = props.row as GridEntry;

  const handelClickEdit = useCallback(() => {
    setAnchorEl(null);
    startEditRows({ rowIds: [row.id] });
  }, [row.id, startEditRows]);

  const handleClickRefund = useCallback(() => {
    setAnchorEl(null);
    addRow();
    changeAddedRow({
      rowId: addedRows.length,
      change: {
        __typename: "EntryRefund" as GridEntry["__typename"],
        // Make the id the entry id to associate with the refund.
        id: row.id,
      },
    });
  }, [addRow, addedRows.length, changeAddedRow, row.id]);

  const handleClickDelete = useCallback(() => {
    setAnchorEl(null);
    deleteRows({ rowIds: [row.id] });
  }, [deleteRows, row.id]);

  return (
    <TableEditColumn.Cell {...rest}>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={open} onClose={handleClose}>
        <MenuItem onClick={handelClickEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        {row.__typename === "Entry" &&
          (row.category.type === EntryType.Credit ? (
            <MenuItem onClick={handleClickRefund}>
              <ListItemIcon>
                <GiveRefund fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Give Refund" />
            </MenuItem>
          ) : (
            <MenuItem onClick={handleClickRefund}>
              <ListItemIcon>
                <AddRefund fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Add Refund" />
            </MenuItem>
          ))}
        <MenuItem onClick={handleClickDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </TableEditColumn.Cell>
  );
});

const EditColumnHeaderCell = React.memo(function EditColumnHeaderCell(
  props: TableEditColumn.HeaderCellProps & {
    addRow: () => void;
  }
): JSX.Element {
  const { addRow, ...rest } = props;

  const handelClick = useCallback(() => addRow(), [addRow]);

  return (
    <TableEditColumn.HeaderCell {...rest}>
      <IconButton onClick={handelClick} color="secondary" size="medium">
        <AddCircleIcon />
      </IconButton>
    </TableEditColumn.HeaderCell>
  );
});

const dialogPaperProps = {
  component: "form",
  onSubmit: (event: FormEvent) => void event.preventDefault(),
};

const EditColumnFilterHeaderCellInternal = (
  props: Table.CellProps & {
    filters: FiltersDef;
    hasNamedFilters: boolean;
    hasColumnFilters: boolean;
    namedFilters: NamedFilters | null;
    loadedNamedFilter: string | null;
    addedNamedFilters: AddNamedFilterPayload[];
    namedFilterChanges: NamedFiltersChanges | null;
    deletedNamedFilters: string[];
    clearColumnFilters: ClearColumnFilters;
    addNamedFilters: AddNamedFilters;
    cancelAddedNamedFilters: CancelAddedNamedFilters;
    commitAddedNamedFilters: CommitAddedNamedFilters;
    changeAddedNamedFilter: ChangeAddedNamedFilter;
    changeNamedFilter: ChangeNamedFilter;
    cancelChangedNamedFilters: CancelChangedNamedFilters;
    commitChangedNamedFilters: CommitChangedNamedFilters;
    deleteNamedFilters: DeleteNamedFilters;
    cancelDeletedNamedFilters: CancelDeletedNamedFilters;
    commitDeletedNamedFilters: CommitDeletedNamedFilters;
    loadNamedFilter: LoadNamedFilter;
  }
) => {
  const {
    filters,
    hasNamedFilters,
    hasColumnFilters,
    namedFilters,
    namedFilterChanges,
    loadedNamedFilter,
    addedNamedFilters,
    deletedNamedFilters,
    clearColumnFilters,
    addNamedFilters,
    cancelAddedNamedFilters,
    commitAddedNamedFilters,
    changeAddedNamedFilter,
    changeNamedFilter,
    cancelChangedNamedFilters,
    commitChangedNamedFilters,
    loadNamedFilter,
    deleteNamedFilters,
    cancelDeletedNamedFilters,
    commitDeletedNamedFilters,
    ...rest
  } = props;

  // Save named filter
  const [addedNamedFilter] = addedNamedFilters;

  const handleAddNamedFilter = useCallback(
    () =>
      void addNamedFilters([
        {
          name: "",
          filters,
        },
      ]),
    [addNamedFilters, filters]
  );

  const handleFilterNameChange = useCallback<
    NonNullable<TextFieldProps["onChange"]>
  >(
    (event) =>
      void changeAddedNamedFilter({
        name: addedNamedFilter.name,
        change: {
          name: event.target.value || "",
        },
      }),
    [addedNamedFilter?.name, changeAddedNamedFilter]
  );

  const handleCancelNamedFilters = useCallback(
    () =>
      void cancelAddedNamedFilters(addedNamedFilters.map(({ name }) => name)),
    [addedNamedFilters, cancelAddedNamedFilters]
  );

  // Modify named filters
  const [editingNamedFilterNames, setEditingNameFilterNames] = useState<
    Set<string>
  >(new Set());

  const handleChangeNamedFilter = useCallback(() => {
    changeNamedFilter();
    setOpen(false);
  }, [changeNamedFilter]);

  const handleCancelNamedFiltersChanges = useCallback(() => {
    cancelChangedNamedFilters();
    cancelDeletedNamedFilters();
  }, [cancelChangedNamedFilters, cancelDeletedNamedFilters]);

  const handleCommitNamedFiltersChanges = useCallback(() => {
    commitChangedNamedFilters();
    commitDeletedNamedFilters();
  }, [commitChangedNamedFilters, commitDeletedNamedFilters]);

  // Named filters
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => void setOpen(true), []);
  const handleClose = useCallback(() => void setOpen(false), []);
  const anchorElRef = useRef<HTMLButtonElement>(null);

  // Cleanup
  const transitionProps = useMemo<TransitionProps>(
    () => ({
      onExited: () => {
        setEditingNameFilterNames(new Set());
      },
    }),
    []
  );

  return (
    <TableEditColumn.HeaderCell {...rest}>
      {hasColumnFilters ? (
        <>
          <Tooltip title="Clear Filters">
            <IconButton size="medium" onClick={clearColumnFilters}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
          {!loadedNamedFilter && (
            <Tooltip title="Save Filter">
              <IconButton size="medium" onClick={handleAddNamedFilter}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          <Dialog
            open={!!addedNamedFilter}
            maxWidth="xs"
            fullWidth
            keepMounted={false}
            PaperProps={dialogPaperProps as any}
          >
            <DialogTitle>Save Filter</DialogTitle>
            <DialogContent>
              <TextField
                variant="filled"
                autoFocus
                margin="dense"
                id="name"
                label="Filter Name"
                type="text"
                fullWidth
                value={addedNamedFilter?.name || ""}
                onChange={handleFilterNameChange}
              />
            </DialogContent>
            <DialogActions>
              <Button
                type="submit"
                variant="contained"
                disabled={!addedNamedFilter?.name}
                onClick={() =>
                  void commitAddedNamedFilters({
                    load: addedNamedFilter.name,
                  })
                }
                color="primary"
              >
                Save
              </Button>
              <Button onClick={handleCancelNamedFilters}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : hasNamedFilters ? (
        <>
          <Tooltip title="Saved Filters">
            <IconButton ref={anchorElRef} size="medium" onClick={handleOpen}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElRef.current}
            keepMounted={false}
            open={open && Boolean(anchorElRef.current)}
            onClose={handleClose}
          >
            {(() => {
              const menuItems = Object.keys(namedFilters || {}).map(
                (namedFilter) => (
                  <MenuItem
                    key={namedFilter}
                    selected={namedFilter === loadedNamedFilter}
                    onClick={() => {
                      setOpen(false);
                      void loadNamedFilter(namedFilter);
                    }}
                  >
                    {namedFilter}
                  </MenuItem>
                )
              );

              menuItems.push(
                <Divider key="_divider" />,
                <MenuItem key="_edit" onClick={handleChangeNamedFilter}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Edit</Typography>
                </MenuItem>
              );

              return menuItems;
            })()}
          </Menu>
          <Dialog
            open={!!namedFilterChanges}
            maxWidth="xs"
            fullWidth
            keepMounted={false}
            TransitionProps={transitionProps}
            PaperProps={dialogPaperProps as any}
          >
            <DialogContent>
              <DialogTitle>Edit Filters</DialogTitle>
              <List>
                {(() => {
                  const namedFiltersSet = new Set([
                    ...Object.keys(namedFilters || {}),
                  ]);
                  Object.keys(namedFilterChanges || {}).forEach((namedFilter) =>
                    namedFiltersSet.add(namedFilter)
                  );

                  return [...namedFiltersSet].reduce((items, namedFilter) => {
                    if (deletedNamedFilters.includes(namedFilter)) {
                      return items;
                    }

                    const name =
                      (namedFilterChanges || {})[namedFilter]?.name ??
                      namedFilter;

                    items.push(
                      <ListItem
                        button
                        key={namedFilter}
                        onClick={() =>
                          setEditingNameFilterNames(
                            (state) => new Set([...state, namedFilter])
                          )
                        }
                      >
                        {editingNamedFilterNames.has(namedFilter) ? (
                          <TextField
                            variant="standard"
                            margin="none"
                            size="small"
                            fullWidth
                            autoFocus
                            value={name}
                            onBlur={() =>
                              setEditingNameFilterNames((state) => {
                                const newState = new Set([...state]);
                                newState.delete(namedFilter);
                                return newState;
                              })
                            }
                            onChange={(event) =>
                              changeNamedFilter({
                                name: namedFilter,
                                change: {
                                  name: event.target.value || "",
                                },
                              })
                            }
                          />
                        ) : (
                          <>
                            <ListItemText primary={name} />
                            <ListItemSecondaryAction
                              onClick={(event) => {
                                event.stopPropagation();
                                void deleteNamedFilters([namedFilter]);
                              }}
                            >
                              <IconButton edge="end">
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </>
                        )}
                      </ListItem>
                    );

                    return items;
                  }, [] as JSX.Element[]);
                })()}
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                type="submit"
                disabled={
                  !(
                    Object.keys(namedFilterChanges || {}).length ||
                    deletedNamedFilters.length
                  )
                }
                variant="contained"
                color="primary"
                onClick={handleCommitNamedFiltersChanges}
              >
                Save
              </Button>
              <Button onClick={handleCancelNamedFiltersChanges}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </TableEditColumn.HeaderCell>
  );
};

/**
 * Add to TableProps.stubHeaderCellComponent
 */
export const EditColumnFilterHeaderCell = React.memo(
  function EditColumnFilterCell(props: Table.CellProps) {
    if (isEditColumnFilterCell(props)) {
      return <EditColumnFilterHeaderCellInternal {...(props as any)} />;
    }
    return <Table.StubHeaderCell {...props} />;
  }
);

const deps: IDependency[] = [
  {
    name: "EntryActionState",
    optional: false,
  },
];

const isTableBodyRow = ({ tableRow }: Table.RowProps): boolean =>
  tableRow.type === Table.ROW_TYPE;

const isEditColumnBodyCell = ({
  tableRow,
  tableColumn,
}: Table.CellProps): boolean =>
  tableRow.type === Table.ROW_TYPE &&
  tableColumn.type === TableEditColumn.COLUMN_TYPE;

const isEditColumnHeaderCell = ({
  tableRow,
  tableColumn,
}: Table.CellProps): boolean =>
  tableRow.type === TableHeaderRow.ROW_TYPE &&
  tableColumn.type === TableEditColumn.COLUMN_TYPE;
const isEditColumnFilterCell = ({
  tableRow,
  tableColumn,
}: Table.CellProps): boolean =>
  tableRow.type === TableFilterRow.ROW_TYPE &&
  tableColumn.type === TableEditColumn.COLUMN_TYPE;
const isSelectColumnHeaderCell = ({
  tableRow,
  tableColumn,
}: Table.CellProps): boolean =>
  tableRow.type === TableHeaderRow.ROW_TYPE &&
  tableColumn.type === TableSelection.COLUMN_TYPE;

export const EntryAction = () => (
  <Plugin name="EntryActionDialog" dependencies={deps}>
    <TableSelection
      showSelectAll
      selectByRowClick
      highlightRow
      showSelectionColumn
      headerCellComponent={SelectHeaderCell as any}
    />
    <TableEditColumn
      cellComponent={EditColumnCell as any}
      headerCellComponent={EditColumnHeaderCell as any}
      showEditCommand
      showAddCommand
      showDeleteCommand
    />
    <TableFixedColumns
      leftColumns={useMemo(() => [TableEditColumn.COLUMN_TYPE], [])}
    />
    {/* Handle "reconciled", "TableSelection", and "TableEditColumn" based on
     "reconciledMode" */}
    <Getter
      name="tableColumns"
      computed={useCallback(({ tableColumns, reconcileMode }) => {
        return (tableColumns as TableColumn[]).reduce(
          (tableColumns, tableColumn) => {
            if (reconcileMode) {
              if (
                tableColumn.type !== TableEditColumn.COLUMN_TYPE &&
                tableColumn.column?.name !== "reconciled"
              ) {
                tableColumns.push(
                  tableColumn.type === TableSelection.COLUMN_TYPE
                    ? { ...tableColumn, fixed: "left" }
                    : tableColumn
                );
              }
            } else if (tableColumn.type !== TableSelection.COLUMN_TYPE) {
              tableColumns.push(
                tableColumn.type === TableEditColumn.COLUMN_TYPE
                  ? { ...tableColumn, fixed: "left" }
                  : tableColumn
              );
            }

            return tableColumns;
          },
          [] as TableColumn[]
        );
      }, [])}
    />
    <Getter
      name="hiddenColumnNames"
      computed={useCallback(
        ({ hiddenColumnNames, reconcileMode }) =>
          reconcileMode
            ? [...new Set([...hiddenColumnNames, "reconciled"])]
            : hiddenColumnNames,
        []
      )}
    />
    <Getter
      name="isColumnTogglingEnabled"
      computed={useCallback(
        ({ isColumnTogglingEnabled, reconcileMode }) =>
          reconcileMode
            ? (columnName: string) => {
                if (reconcileMode && columnName === "reconciled") {
                  return false;
                } else {
                  return isColumnTogglingEnabled(columnName);
                }
              }
            : isColumnTogglingEnabled,
        []
      )}
    />
    {/* Add doubleClick row to edit */}
    <Template
      name="tableRow"
      predicate={isTableBodyRow as TemplateProps["predicate"]}
    >
      {useCallback(
        (params) => (
          <TemplateConnector>
            {({ reconcileMode }, { startEditRows }) => {
              const row = (params as Table.RowProps).tableRow.row as GridEntry;
              return (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    ...(reconcileMode
                      ? {}
                      : {
                          onDoubleClick: () => {
                            startEditRows({ rowIds: [row.id] });
                          },
                        }),
                  }}
                />
              );
            }}
          </TemplateConnector>
        ),
        []
      )}
    </Template>
    {/* Inject additional state into "EditColumnCell" */}
    <Template
      name="tableCell"
      predicate={isEditColumnBodyCell as TemplateProps["predicate"]}
    >
      {useCallback(
        (params) => (
          <TemplateConnector>
            {(
              { addedRows },
              { addRow, startEditRows, changeAddedRow, deleteRows }
            ) => (
              <TemplatePlaceholder
                params={{
                  ...params,
                  addRow,
                  addedRows,
                  startEditRows,
                  changeAddedRow,
                  deleteRows,
                }}
              />
            )}
          </TemplateConnector>
        ),
        []
      )}
    </Template>
    {/* Inject additional state into "EditColumnHeaderCell" */}
    <Template
      name="tableCell"
      predicate={isEditColumnHeaderCell as TemplateProps["predicate"]}
    >
      {useCallback(
        (params) => (
          <TemplateConnector>
            {(_, { addRow }) => (
              <TemplatePlaceholder
                params={{
                  ...params,
                  addRow,
                }}
              />
            )}
          </TemplateConnector>
        ),
        []
      )}
    </Template>
    {/* Inject additional state into "EditColumnFilterCell" */}
    <Template
      name="tableCell"
      predicate={isEditColumnFilterCell as TemplateProps["predicate"]}
    >
      {useCallback(
        (params) => (
          <TemplateConnector>
            {(
              {
                filters,
                hasColumnFilters,
                hasNamedFilters,
                namedFilters,
                loadedNamedFilter,
                addedNamedFilters,
                namedFilterChanges,
                deletedNamedFilters,
              },
              {
                clearColumnFilters,
                addNamedFilters,
                cancelAddedNamedFilters,
                commitAddedNamedFilters,
                changeAddedNamedFilter,
                changeNamedFilter,
                cancelChangedNamedFilters,
                commitChangedNamedFilters,
                loadNamedFilter,
                deleteNamedFilters,
                cancelDeletedNamedFilters,
                commitDeletedNamedFilters,
              }
            ) => (
              <TemplatePlaceholder
                params={{
                  ...params,
                  filters,
                  hasNamedFilters,
                  hasColumnFilters,
                  namedFilters,
                  loadedNamedFilter,
                  addedNamedFilters,
                  namedFilterChanges,
                  deletedNamedFilters,
                  clearColumnFilters,
                  addNamedFilters,
                  cancelAddedNamedFilters,
                  commitAddedNamedFilters,
                  changeAddedNamedFilter,
                  changeNamedFilter,
                  cancelChangedNamedFilters,
                  commitChangedNamedFilters,
                  loadNamedFilter,
                  deleteNamedFilters,
                  cancelDeletedNamedFilters,
                  commitDeletedNamedFilters,
                }}
              />
            )}
          </TemplateConnector>
        ),
        []
      )}
    </Template>
    {/* Inject additional state into SelectHeaderCell */}
    <Template
      name="tableCell"
      predicate={isSelectColumnHeaderCell as TemplateProps["predicate"]}
    >
      {useCallback(
        (params) => (
          <TemplateConnector>
            {(_, { toggleConfirmReconcile }) => (
              <TemplatePlaceholder
                params={{
                  ...params,
                  toggleConfirmReconcile,
                }}
              />
            )}
          </TemplateConnector>
        ),
        []
      )}
    </Template>
    {/* Action Dialogs 
      TODO:  Logic here is convoluted.  NEEDS WORK
    */}
    <Template name="entryActionDialog">
      <TemplateConnector>
        {useCallback(
          (
            {
              rows,
              addedRows,
              editingRowIds,
              deletedRowIds,
              upsertEntryProps,
              upsertRefundProps,
              deleteEntryProps,
              reconcileEntriesProps,
              confirmReconcile,
              selection,
            },
            {
              stopEditRows,
              cancelAddedRows,
              cancelChangedRows,
              cancelDeletedRows,
              toggleConfirmReconcile,
              toggleSelectAll,
            }
          ) => {
            const isReconcile = confirmReconcile;

            const isDelete =
              !isReconcile && !!(deletedRowIds as string[]).length;

            const isNew =
              !isReconcile && !isDelete && !!(addedRows as string[]).length;

            // NOTE: on new refunds, the id is the entry id.
            const id = isNew
              ? (addedRows as Partial<GridEntry>[])[0]?.id
              : isDelete
              ? (deletedRowIds as string[])[0]
              : (editingRowIds as string[])[0];

            const row = isNew
              ? (addedRows as Partial<GridEntry>[])[0]
              : (rows as GridEntry[]).find((entry) => entry.id === id);

            const isOpen = !!row || isReconcile;
            const isRefund = row?.__typename === "EntryRefund";

            const handleClose: DialogOnClose = (_, reason) => {
              if (isReconcile) {
                toggleConfirmReconcile(false);
                if (reason === "success") {
                  toggleSelectAll(false);
                }
              } else if (isNew) {
                cancelAddedRows({
                  rowIds: (addedRows as unknown[]).map((_, i) => i),
                });
              } else if (isDelete) {
                cancelDeletedRows({ rowIds: deletedRowIds });
              } else {
                stopEditRows({ rowIds: editingRowIds });
                cancelChangedRows({ rowIds: editingRowIds });
              }
            };

            const selectionSet = new Set(selection as string[]);
            const reconcileEntries = (rows as GridEntry[]).reduce(
              (reconcileEntries, { id, __typename }) => {
                if (selectionSet.has(id)) {
                  if (__typename === "Entry") {
                    reconcileEntries[0].push(id);
                  } else {
                    reconcileEntries[1].push(id);
                  }
                }

                return reconcileEntries;
              },
              [[], []] as [string[], string[]]
            );

            return (
              <>
                <UpsertEntry
                  {...(upsertEntryProps as UpsertEntryProps)}
                  entryProps={{
                    ...(upsertEntryProps as UpsertEntryProps).entryProps,
                    updateEntryId: id,
                  }}
                  dialogProps={{
                    ...(upsertEntryProps as UpsertEntryProps).dialogProps,
                    onClose: handleClose,
                    open: isOpen && !isRefund && !isDelete && !isReconcile,
                  }}
                />
                <UpsertRefund
                  {...(upsertRefundProps as UpsertRefundProps)}
                  refundProps={{
                    ...(upsertRefundProps as UpsertRefundProps).refundProps,
                    ...(isNew
                      ? { entryId: id as string }
                      : { updateRefundId: id as string }),
                  }}
                  dialogProps={{
                    ...(upsertRefundProps as UpsertRefundProps).dialogProps,
                    onClose: handleClose,
                    open: isOpen && isRefund && !isDelete,
                  }}
                />
                <DeleteEntry
                  {...(deleteEntryProps as DeleteEntryProps)}
                  {...(isRefund
                    ? { deleteRefundId: id || "" }
                    : { deleteEntryId: id || "" })}
                  onClose={handleClose}
                  open={isOpen && isDelete}
                />
                <ReconcileEntries
                  {...(reconcileEntriesProps as ReconcileEntriesProps)}
                  entryIds={reconcileEntries[0]}
                  refundIds={reconcileEntries[1]}
                  dialogProps={{
                    ...(reconcileEntriesProps as ReconcileEntriesProps)
                      .dialogProps,
                    onClose: handleClose,
                    open: isOpen && isReconcile,
                  }}
                />
              </>
            );
          },
          []
        )}
      </TemplateConnector>
    </Template>
    {/* Append Action Dialogs to root */}
    <Template name="root">
      <TemplatePlaceholder />
      <TemplatePlaceholder name="entryActionDialog" />
    </Template>
  </Plugin>
);
