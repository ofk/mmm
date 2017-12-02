// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import Vue from 'vue/dist/vue.esm';
import 'photon/dist/css/photon.css';
import './renderer.css';

const id = window.location.hash.toString().replace(/^#/, '');
const viewNode = document.querySelector('#view');
let viewTimer;
let viewLoaded;

const loadedView = () => {
  if (viewNode.getAttribute('data-loaded') !== 'true') return;
  if (viewNode.hasAttribute('data-zoom')) {
    viewNode.setZoomLevel(+viewNode.getAttribute('data-zoom'));
  }
};

viewNode.addEventListener('did-finish-load', () => {
  viewNode.setAttribute('data-loaded', 'true');
  loadedView();
  if (viewLoaded) viewLoaded();
});

const loadView = (url) => {
  if (viewNode.getAttribute('data-url') === url) return;
  viewNode.setAttribute('data-url', url);
  viewNode.src = url;
};

const setViewZoomLevel = (zoom) => {
  viewNode.setAttribute('data-zoom', zoom);
  loadedView();
};

const setViewLoaded = (app, view, menuVisibility) => {
  if (menuVisibility) {
    viewLoaded = null;
    clearTimeout(viewTimer);
  } else {
    viewLoaded = () => {
      viewTimer = setTimeout(() => {
        app.jumpView(1);
      }, view.time * 1000);
    };
  }
};

const app = new Vue({
  el: '#ctrl',
  data: {
    views: null,
    viewIndex: 0,
    editingView: {},
    menuVisibility: false,
  },
  watch: {
    view(newView) {
      setViewLoaded(this, newView, this.menuVisibility);
      loadView(newView.url || 'about:blank');
      setViewZoomLevel(newView.zoom || 0);
      this.editingView = Object.assign({}, newView);
    },
    menuVisibility(newMenuVisibility) {
      setViewLoaded(this, this.view, newMenuVisibility);
      if (viewLoaded) viewLoaded();
    },
  },
  computed: {
    view() {
      const view = (this.views && this.views[this.viewIndex]) || {};
      return Object.assign({ zoom: 0, time: 1 }, view);
    },
  },
  methods: {
    setView(newViewDiff) {
      const newView = Object.assign({}, this.view, newViewDiff);
      this.views.splice(this.viewIndex, 1, newView);
      ipcRenderer.send('updateConfig', {
        id,
        config: {
          views: this.views,
        },
      });
    },
    jumpView(dir) {
      const oldViewIndex = this.viewIndex;
      this.viewIndex = (oldViewIndex + dir + this.views.length) % this.views.length;
      if (this.viewIndex === oldViewIndex) {
        viewNode.reload();
      }
    },
    newView() {
      if (this.view.url) {
        this.views.splice(this.viewIndex += 1, 0, {});
      }
    },
    killView() {
      this.views.splice(this.viewIndex, 1);
      this.viewIndex = Math.min(0, this.viewIndex - 1);
      if (!this.views.length) {
        ipcRenderer.send('closeWindow', { id });
      }
    },
    newPanel() {
      ipcRenderer.send('newPanel');
    },
  },
});

ipcRenderer.on('loadConfig', (event, { config, menuVisibility }) => {
  app.views = config.views || [];
  app.menuVisibility = menuVisibility;
});

ipcRenderer.send('requestConfig', { id });

ipcRenderer.on('toggleMenu', (event, { menuVisibility }) => {
  app.menuVisibility = menuVisibility;
});

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.keyCode === 77) { // ctrl + shift + m
    ipcRenderer.send('toggleMenu');
  }
});
