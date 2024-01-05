import React from "react";
import { createRoot } from "react-dom/client"; // eslint-disable-line react/no-deprecated
import WebFont from "webfontloader";
import App from "./components/App";
//import { register } from "register-service-worker";
import "./css/main.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";

// annoying hack to deal with webpack and marker icon
// TODO: switch from using a default icon to always using a custom icon for markers
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

(async function () {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: await import("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: await import("leaflet/dist/images/marker-icon.png"),
    shadowUrl: await import("leaflet/dist/images/marker-shadow.png")
  });
})();

// load google fonts
WebFont.load({
  google: {
    families: ["Roboto", "Ubuntu"]
  }
});

// render(<App />, document.getElementById('root'));

const rootElement = document.getElementById("root");
createRoot(rootElement).render(<App />);

/* Use a service worker to cache /api/query, if the ServiceWorker API is available */
/* 
  Note that this service worker seems to work fine, but until more thoroughly tested,
  it is commented out.
*/
// if ("serviceWorker" in navigator) {
//   register(`/serviceWorker.js`);
// }
