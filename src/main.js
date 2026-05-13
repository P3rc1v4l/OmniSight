const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let streamWindows = {};

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      webSecurity: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

// IPC: Window Controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

// IPC: Theme speichern
ipcMain.handle('get-theme', () => store.get('theme', 'dark'));
ipcMain.on('set-theme', (_, theme) => store.set('theme', theme));

// IPC: Session-Cookies für Provider speichern/abrufen
ipcMain.handle('get-provider-session', (_, providerId) => {
  return store.get(`sessions.${providerId}`, null);
});

ipcMain.on('set-provider-session', (_, { providerId, data }) => {
  store.set(`sessions.${providerId}`, data);
});

ipcMain.on('clear-provider-session', (_, providerId) => {
  store.delete(`sessions.${providerId}`);
});

// IPC: Provider URL öffnen (in Webview)
ipcMain.on('open-provider', (_, { providerId, url }) => {
  mainWindow?.webContents.send('show-provider', { providerId, url });
});

// IPC: Externes Browser öffnen
ipcMain.on('open-external', (_, url) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
