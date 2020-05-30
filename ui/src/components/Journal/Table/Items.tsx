import React, { useMemo, useState, useCallback } from "react";
import MaterialTable, {
  Column,
  Options,
  MaterialTableProps,
} from "material-table";
import { capitalCase } from "change-case";
import numeral from "numeral";
import { Box, useTheme, Divider } from "@material-ui/core";

import {
  JournalEntry_1Fragment as JournalEntryFragment,
  JournalEntryItem_1Fragment as JournalEntryItemFragment,
} from "../../../apollo/graphTypes";
import tableIcons from "../../utils/materialTableIcons";
import AddItem from "../Upsert/Items/AddItem";
import UpdateItem from "../Upsert/Items/UpdateItem";
import DeleteItem from "../Upsert/Items/DeleteItem";
import {
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Edit as EditIcon,
} from "@material-ui/icons";
import { rationalToFraction } from "../../../utils/rational";

export interface ItemsProps {
  entry: JournalEntryFragment;
}

const Items = (props: ItemsProps) => {
  const { items, category, description, department, id: entryId } = props.entry;

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

  const actions = useMemo<
    MaterialTableProps<JournalEntryItemFragment>["actions"]
  >(() => {
    return [
      {
        icon: DeleteIcon as any,
        tooltip: "Delete Item",
        onClick: (event, rowData) =>
          setDeleteItem((rowData as JournalEntryItemFragment).id),
      },
      {
        icon: EditIcon as any,
        tooltip: "Edit Item",
        onClick: (event, rowData) => {
          setUpdateItemOpen(true);
          setUpdateItem({
            entryId,
            itemId: (rowData as JournalEntryItemFragment).id,
          });
        },
      },
      {
        icon: ((props) => <AddCircleIcon {...props} />) as any,
        iconProps: {
          color: "secondary",
          fontSize: "large",
        },
        tooltip: "Add Item",
        isFreeAction: true,
        onClick: () => {
          setAddItemOpen(true);
          setAddItemToEntry(entryId);
        },
      },
    ];
  }, [entryId]);

  const columns = useMemo<Column<JournalEntryItemFragment>[]>(() => {
    return [
      {
        field: "total",
        title: "Total",
        render: ({ total }) =>
          numeral(rationalToFraction(total).valueOf()).format("$0,0.00"),
      },
      {
        field: "units",
        title: "Units",
      },
      {
        field: "description",
        title: "Description",
        render: (data) => data.description?.trim() || description,
      },
      {
        field: "category",
        title: "Category",
        render: (data, type) => {
          const name = data.category?.name ?? category.name;
          return capitalCase(name);
        },
      },
      {
        field: "department",
        title: "Department",
        render: (data) => {
          const name = data.department?.name ?? department.name;
          return capitalCase(name);
        },
      },
    ];
  }, [category, description, department]);

  const options = useMemo<Options>(
    () => ({ search: false, emptyRowsWhenPaging: false /* paging: false */ }),
    []
  );

  const data = useMemo(() => items.filter((item) => !item.deleted), [items]);

  const theme = useTheme();

  const tableStyle = useMemo(() => ({ boxShadow: theme.shadows[0] }), [
    theme.shadows,
  ]);

  const dividerStyle = useMemo(
    () => ({ backgroundColor: theme.palette.primary.main }),
    [theme.palette.primary.main]
  );

  return (
    <Box>
      <MaterialTable
        title="Items"
        actions={actions}
        options={options}
        columns={columns}
        icons={tableIcons}
        data={data}
        style={tableStyle}
      />
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
      <Divider style={dividerStyle} />
    </Box>
  );
};

export default Items;
