const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let win;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: width,
    height: height,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    alwaysOnTop: false,
    resizable: false, // Prevent OS resizing to keep widget/full transitions clean
    skipTaskbar: false,
  });

  const url = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'dist', 'index.html')}`;

  win.loadURL(url);

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC listeners for transitioning modes
ipcMain.on('minimize-to-widget', (event, args) => {
  if (!win) return;
  const { x, y } = args || {};
  // Widget size 180x180
  if (x !== undefined && y !== undefined) {
    win.setBounds({
      x: Math.round(x - 90),
      y: Math.round(y - 90),
      width: 180,
      height: 180
    });
  } else {
    win.setSize(180, 180);
  }
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setSkipTaskbar(true); // Don't show widget in taskbar
});

ipcMain.on('expand-from-widget', () => {
  if (!win) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  win.setBounds({
    x: 0,
    y: 0,
    width,
    height
  });
  win.setAlwaysOnTop(false);
  win.setSkipTaskbar(false);
});

ipcMain.on('move-window', (event, { dx, dy }) => {
  if (!win) return;
  const [x, y] = win.getPosition();
  win.setPosition(x + dx, y + dy);
});
