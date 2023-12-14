import React from 'react';
import { createRoot } from 'react-dom/client'; // eslint-disable-line react/no-deprecated
import WebFont from 'webfontloader';
import App from './components/App';
import { register } from "register-service-worker";
import './css/main.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// annoying hack to deal with webpack and marker icon
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

(async function () {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: await import('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: await import('leaflet/dist/images/marker-icon.png'),
    shadowUrl: await import('leaflet/dist/images/marker-shadow.png')
  });
})();

// load google fonts
WebFont.load({
  google: {
    families: ['Roboto', 'Ubuntu']
  }
});

// render(<App />, document.getElementById('root'));

const rootElement = document.getElementById("root");
createRoot(rootElement).render(
  <App />
);

/* Use a service worker to cache /api/query, if the ServiceWorker API is available */
if ('serviceWorker' in navigator) {
  register(`/serviceWorker.js`)
}