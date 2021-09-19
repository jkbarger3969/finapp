import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plugin,
  Template,
  TemplatePlaceholder,
} from "@devexpress/dx-react-core";
import {
  IconButton,
  IconButtonProps,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  PopoverOrigin,
  Switch,
} from "@material-ui/core";
import MoreIcon from "@material-ui/icons/MoreVert";
import ReconcileIcon from "@material-ui/icons/DoneAll";

const anchorOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};
const transformOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};

export const GridMenu = ({
  reconcileMode,
  onReconcileMode,
}: {
  reconcileMode: boolean;
  onReconcileMode: (reconcileMode: boolean) => void;
}): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);

  return (
    <Plugin name="ReconcileMode">
      <Template name="toolbarContent">
        <TemplatePlaceholder />
        <IconButton
          ref={setAnchorEl}
          onClick={useCallback(() => {
            setOpen(true);
          }, [])}
          edge="end"
        >
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          onClose={useCallback(() => {
            setOpen(false);
          }, [])}
        >
          <MenuItem
            style={{
              minWidth: "300px",
            }}
            button={false}
          >
            <ListItemIcon>
              <ReconcileIcon />
            </ListItemIcon>
            <ListItemText primary="Reconcile Mode" />
            <ListItemSecondaryAction>
              <Switch
                checked={reconcileMode}
                edge="end"
                onChange={useCallback(
                  (_, checked) => {
                    onReconcileMode(checked);
                  },
                  [onReconcileMode]
                )}
              />
            </ListItemSecondaryAction>
          </MenuItem>
        </Menu>
      </Template>
    </Plugin>
  );
};
