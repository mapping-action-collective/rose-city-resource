import React from 'react';
import { render } from 'react-dom'; // eslint-disable-line react/no-deprecated
import WebFont from 'webfontloader';
import App from './components/App';
import './css/main.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// annoying hack to deal with webpack and marker icon
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// load google fonts
WebFont.load({
  google: {
    families: ['Roboto', 'Ubuntu']
  }
});

render(<App />, document.getElementById('app'));

// const container = document.createElement('app');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<App />);