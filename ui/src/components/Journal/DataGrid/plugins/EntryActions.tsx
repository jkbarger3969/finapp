/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";
import {
  Getter,
  IDependency,
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
  TemplateProps,
} from "@devexpress/dx-react-core";
import { EditingState } from "@devexpress/dx-react-grid";
import {
  Table,
  TableHeaderRow,
  TableEditColumn,
} from "@devexpress/dx-react-grid-material-ui";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  SvgIconProps,
} from "@material-ui/core";
import {
  MoreVert as MoreVertIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@material-ui/icons";

import { UpsertEntry, UpsertEntryProps } from "../forms/UpsertEntry";
import { UpsertRefund, UpsertRefundProps } from "../forms/UpsertRefund";
import { DeleteEntry, DeleteEntryProps } from "../forms/DeleteEntry";
import { GridEntry } from "../Grid";
import { EntryType } from "../../../../apollo/graphTypes";

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
  upsertEntryProps,
  upsertRefundProps,
  deleteEntryProps,
}: {
  upsertEntryProps: UpsertEntryProps;
  upsertRefundProps: UpsertRefundProps;
  deleteEntryProps: DeleteEntryProps;
}) => {
  return (
    <Plugin name="EntryActionState">
      <EditingState onCommitChanges={onCommitChanges} />;
      <Getter name="upsertEntryProps" value={upsertEntryProps} />
      <Getter name="upsertRefundProps" value={upsertRefundProps} />
      <Getter name="deleteEntryProps" value={deleteEntryProps} />
    </Plugin>
  );
};

const EditColumnCell = (
  props: TableEditColumn.CellProps & {
    addRow: () => void;
    addedRows: any[];
    startEditRows: (arg: { rowIds: string[] }) => void;
    changeAddedRow: (arg: { rowId: number; change: any }) => void;
    deleteRows: (arg: { rowIds: string[] }) => void;
  }
): JSX.Element => {
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
};

const EditColumnHeaderCell = (
  props: TableEditColumn.HeaderCellProps & {
    addRow: () => void;
  }
): JSX.Element => {
  const { addRow, ...rest } = props;

  const handelClick = useCallback(() => addRow(), [addRow]);

  return (
    <TableEditColumn.HeaderCell {...rest}>
      <IconButton onClick={handelClick} color="secondary" size="medium">
        <AddCircleIcon />
      </IconButton>
    </TableEditColumn.HeaderCell>
  );
};

const entryActionDeps: IDependency[] = [
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

export const EntryAction = () => (
  <Plugin name="EntryActionDialog" dependencies={entryActionDeps}>
    <TableEditColumn
      cellComponent={EditColumnCell as any}
      headerCellComponent={EditColumnHeaderCell as any}
      showEditCommand
      showAddCommand
      showDeleteCommand
    />
    <Template
      name="tableRow"
      predicate={isTableBodyRow as TemplateProps["predicate"]}
    >
      {useCallback(
        (params) => (
          <TemplateConnector>
            {(_, { startEditRows }) => {
              const row = (params as Table.RowProps).tableRow.row as GridEntry;
              return (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    onDoubleClick: () => {
                      startEditRows({ rowIds: [row.id] });
                    },
                  }}
                />
              );
            }}
          </TemplateConnector>
        ),
        []
      )}
    </Template>
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
            },
            {
              stopEditRows,
              cancelAddedRows,
              cancelChangedRows,
              cancelDeletedRows,
            }
          ) => {
            const isDelete = !!(deletedRowIds as string[]).length;

            const isNew = !isDelete && !!(addedRows as string[]).length;

            // NOTE: on new refunds, the id is the entry id.
            const id = isNew
              ? (addedRows as Partial<GridEntry>[])[0]?.id
              : isDelete
              ? (deletedRowIds as string[])[0]
              : (editingRowIds as string[])[0];

            const row = isNew
              ? (addedRows as Partial<GridEntry>[])[0]
              : (rows as GridEntry[]).find((entry) => entry.id === id);

            const isOpen = !!row;
            const isRefund = row?.__typename === "EntryRefund";

            const handleClose = () => {
              if (isNew) {
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
                    open: isOpen && !isRefund && !isDelete,
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
              </>
            );
          },
          []
        )}
      </TemplateConnector>
    </Template>
    <Template name="root">
      <TemplatePlaceholder />
      <TemplatePlaceholder name="entryActionDialog" />
    </Template>
  </Plugin>
);
