import React from 'react';
import { render } from 'react-dom'; // eslint-disable-line react/no-deprecated
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

render(<App />, document.getElementById('root'));

// const container = document.createElement('root');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<App />);


register(`/serviceWorker.js`)