// eslint-disable-next-line import/no-extraneous-dependencies
import { app, ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';

let menuVisibility = false;
const windowsInfo = new Map();
const createWindow = (config) => {
  let window = new BrowserWindow(Object.assign({ width: 800, height: 600, frame: false }, config.bounds || {}));
  const id = window.id.toString();

  window.loadURL(url.format({
    hash: id,
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  window.on('closed', () => {
    windowsInfo.delete(id);
    window = null;
  });

  windowsInfo.set(id, { window, config });
};

const appConfigPath = path.join(app.getAppPath(), 'config.json');

app.on('ready', () => {
  let appConfig;

  try {
    appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf-8'));
  } catch (e) {
    appConfig = { menuVisibility: true };
  }

  menuVisibility = !!appConfig.menuVisibility;

  if (!appConfig.panels) {
    appConfig.panels = [];
  }

  if (!appConfig.panels.length) {
    appConfig.panels.push({});
  }

  appConfig.panels.forEach(createWindow);
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('updateConfig', (event, { id, config }) => {
  const info = windowsInfo.get(id);
  windowsInfo.set(id, Object.assign({}, info, { config }));
});

ipcMain.on('requestConfig', (event, { id }) => {
  event.sender.send('loadConfig', {
    config: windowsInfo.get(id).config,
    menuVisibility,
  });
});

ipcMain.on('toggleMenu', () => {
  const appConfig = {
    panels: [],
  };
  menuVisibility = !menuVisibility;
  windowsInfo.forEach(({ window, config }) => {
    appConfig.panels.push(Object.assign({}, config, { bounds: window.getBounds() }));
    window.webContents.send('toggleMenu', { menuVisibility });
  });
  if (!menuVisibility) {
    fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, '  '));
  }
});

ipcMain.on('closeWindow', (event, { id }) => {
  windowsInfo.get(id).window.close();
});

ipcMain.on('newPanel', () => {
  createWindow({});
});
