// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';

const windowConfigs = new Map();
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
    windowConfigs.delete(id);
    window = null;
  });

  windowConfigs.set(id, config);
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
