import React, { useMemo, useState, useCallback } from "react";
import MaterialTable, {
  Column,
  Options,
  MaterialTableProps,
  Action,
} from "material-table";
import { capitalCase } from "change-case";
import numeral from "numeral";
import { Box, useTheme, Divider } from "@material-ui/core";

import {
  Entry_1Fragment as EntryFragment,
  EntryItem_1Fragment as EntryItemFragment,
} from "../../../apollo/graphTypes";
import { deserializeRational } from "../../../apollo/scalars";
import tableIcons from "../../utils/materialTableIcons";
import AddItem from "../Upsert/Items/AddItem";
import UpdateItem from "../Upsert/Items/UpdateItem";
import DeleteItem from "../Upsert/Items/DeleteItem";
import {
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  Edit as EditIcon,
} from "@material-ui/icons";

export interface ItemsProps {
  entry: EntryFragment;
}

const Items = (props: ItemsProps): JSX.Element => {
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
    MaterialTableProps<EntryItemFragment>["actions"]
  >(() => {
    return [
      {
        icon: DeleteIcon as Action<EntryItemFragment>["icon"],
        tooltip: "Delete Item",
        onClick: (event, rowData) =>
          setDeleteItem((rowData as EntryItemFragment).id),
      },
      {
        icon: EditIcon as Action<EntryItemFragment>["icon"],
        tooltip: "Edit Item",
        onClick: (event, rowData) => {
          setUpdateItemOpen(true);
          setUpdateItem({
            entryId,
            itemId: (rowData as EntryItemFragment).id,
          });
        },
      },
      {
        icon: ((props: Record<string, unknown>) => (
          <AddCircleIcon {...props} />
        )) as Action<EntryItemFragment>["icon"],
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

  const columns = useMemo<Column<EntryItemFragment>[]>(() => {
    return [
      {
        field: "total",
        title: "Total",
        render: ({ total }) =>
          numeral(deserializeRational(total).valueOf()).format("$0,0.00"),
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
        render: (data) => {
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
