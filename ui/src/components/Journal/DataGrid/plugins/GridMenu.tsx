import React, { useCallback, useState } from "react";
import {
  IDependency,
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
} from "@devexpress/dx-react-core";
import {
  IconButton,
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

const deps: IDependency[] = [
  {
    name: "EntryActionState",
    optional: false,
  },
];

export const GridMenu = (): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);

  return (
    <Plugin name="GridMenu" dependencies={deps}>
      <Template name="toolbarContent">
        <TemplatePlaceholder />
        <TemplateConnector>
          {useCallback(
            ({ reconcileMode }, { changeReconcileMode }) => (
              <>
                <IconButton
                  ref={setAnchorEl}
                  onClick={() => {
                    setOpen(true);
                  }}
                  edge="end"
                >
                  <MoreIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  anchorOrigin={anchorOrigin}
                  transformOrigin={transformOrigin}
                  onClose={() => {
                    setOpen(false);
                  }}
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
                        onChange={(_, checked) => {
                          changeReconcileMode(checked);
                        }}
                      />
                    </ListItemSecondaryAction>
                  </MenuItem>
                </Menu>
              </>
            ),
            [anchorEl, open]
          )}
        </TemplateConnector>
      </Template>
    </Plugin>
  );
};
