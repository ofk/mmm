// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import Vue from 'vue/dist/vue.esm';
import 'photon/dist/css/photon.css';
import './renderer.css';

const id = window.location.hash.toString().replace(/^#/, '');
const viewNode = document.querySelector('#view');

const loadedView = () => {
  if (viewNode.getAttribute('data-loaded') !== 'true') return;
  if (viewNode.hasAttribute('data-zoom')) {
    viewNode.setZoomLevel(+viewNode.getAttribute('data-zoom'));
  }
};

viewNode.addEventListener('did-finish-load', () => {
  viewNode.setAttribute('data-loaded', 'true');
  loadedView();
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

const app = new Vue({
  el: '#ctrl',
  data: {
    views: null,
    viewIndex: 0,
    editingView: {},
    visibility: false,
  },
  watch: {
    view(newView) {
      loadView(newView.url || 'about:blank');
      setViewZoomLevel(newView.zoom || 0);
      this.editingView = Object.assign({}, newView);
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

ipcRenderer.on('loadConfig', (event, { config, visibility }) => {
  app.views = config.views || [];
  app.visibility = visibility;
});

ipcRenderer.send('requestConfig', { id });

ipcRenderer.on('toggleMenu', (event, { visibility }) => {
  app.visibility = visibility;
});

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.keyCode === 77) { // ctrl + m
    ipcRenderer.send('toggleMenu');
  }
});
