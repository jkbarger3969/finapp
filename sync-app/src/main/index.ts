import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import path from "path";

import { closeAllConnections, getUserDataPaths, registerIpcHandlers } from "./ipc";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    title: "FinApp Sync Assistant",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function buildMenu() {
  const { backupsDir } = getUserDataPaths(app.getPath("userData"));

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Connections",
      submenu: [
        {
          label: "Disconnect All",
          click: async () => {
            await closeAllConnections();
            mainWindow?.webContents.send("connections:disconnectedAll");
          },
        },
      ],
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "Open Backups Folder",
          click: () => shell.openPath(backupsDir),
        },
        {
          label: "Reload",
          click: () => mainWindow?.reload(),
        },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Sync Runbook (README)",
          click: () =>
            shell.openExternal(
              "https://github.com/jkbarger3969/finapp/blob/main/graphql/scripts/sync/README.md"
            ),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  registerIpcHandlers(ipcMain, app.getPath("userData"));
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  await closeAllConnections();
  app.exit(0);
});
