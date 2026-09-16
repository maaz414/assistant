const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeToWidget: (args) => ipcRenderer.send('minimize-to-widget', args),
  expandFromWidget: () => ipcRenderer.send('expand-from-widget'),
  moveWindow: (dx, dy) => ipcRenderer.send('move-window', { dx, dy })
});
