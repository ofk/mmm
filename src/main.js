// eslint-disable-next-line import/no-extraneous-dependencies
import { app, ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';

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

const configPath = path.join(app.getAppPath(), 'config.json');

app.on('ready', () => {
  let config;

  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    config = {};
  }

  if (!config.panels) {
    config.panels = [];
  }

  if (!config.panels.length) {
    config.panels.push({});
  }

  config.panels.forEach(createWindow);
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('requestConfig', (event, { id }) => {
  event.sender.send('loadConfig', windowsInfo.get(id).config);
});

ipcMain.on('closeWindow', (event, { id }) => {
  windowsInfo.get(id).window.close();
});

ipcMain.on('newPanel', () => {
  createWindow({});
});
