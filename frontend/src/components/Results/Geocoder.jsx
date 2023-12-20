import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-control-geocoder";

const createControlLayer = (props) => {
  const { ...options } = props;

  const controlInstance = new L.Control.Geocoder(options).on(
    "markgeocode",
    (e) => options.handleGeocode(e.geocode.center)
  );

  return controlInstance;
};

// Pass the control instance to the React-Leaflet createControlComponent hook:
const Geocoder = createControlComponent(createControlLayer);

export default Geocoder;
