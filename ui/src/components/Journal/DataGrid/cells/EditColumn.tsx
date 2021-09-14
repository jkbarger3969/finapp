import React, { useMemo } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  SvgIcon,
  SvgIconProps,
} from "@material-ui/core";
import {
  MoreVert as MoreVertIcon,
  AddCircle as AddCircleIcon,
  // Cancel as CancelIcon,
  Delete as DeleteIcon,
  // Done as DoneIcon,
  Edit as EditIcon,
} from "@material-ui/icons";
import { TableEditColumn } from "@devexpress/dx-react-grid-material-ui";
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

export const EditColumnCell = (
  props: TableEditColumn.CellProps
): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const row = props.row as GridEntry;

  const menuItems = useMemo(() => {
    const menuItems: React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<unknown>
    >[] = [];

    if (row.__typename === "Entry") {
      menuItems.push(
        row.category.type === EntryType.Credit ? (
          <MenuItem key={menuItems.length}>
            <ListItemIcon>
              <GiveRefund fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Give Refund" />
          </MenuItem>
        ) : (
          <MenuItem key={menuItems.length}>
            <ListItemIcon>
              <AddRefund fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add Refund" />
          </MenuItem>
        )
      );
    }

    React.Children.forEach(props.children, (component) => {
      if (component && React.isValidElement(component)) {
        const onExecute =
          "onExecute" in component.props
            ? () => {
                handleClose();
                (component.props as TableEditColumn.CommandProps).onExecute();
              }
            : undefined;
        menuItems.push(
          React.cloneElement(
            component,
            {
              key: menuItems.length,
              onExecute,
            },
            component.props.children
          )
        );
      }
    });

    return menuItems;
  }, [props.children, row.__typename, row.category.type]);

  return (
    <TableEditColumn.Cell {...props}>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={open} onClose={handleClose}>
        {menuItems}
      </Menu>
    </TableEditColumn.Cell>
  );
};

export const EditColumnCommand = (
  props: TableEditColumn.CommandProps
): JSX.Element => {
  const { id, text, onExecute } = props;

  switch (id) {
    case "delete":
      return (
        <MenuItem onClick={onExecute}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={text} />
        </MenuItem>
      );
    case "edit":
      return (
        <MenuItem onClick={onExecute}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={text} />
        </MenuItem>
      );
    case "add":
      return (
        <Tooltip title={text}>
          <IconButton size="medium" color="secondary" onClick={onExecute}>
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      );
    default:
      return <TableEditColumn.Command {...props} />;
  }
};
