import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-control-geocoder';
//import { MapControl } from 'react-leaflet';

const createControlLayer = (props) => {
  const { ...options } = props;

  const controlInstance = new L.Control.Geocoder(options).on('markgeocode', e =>
    options.handleGeocode(e.geocode.center)
  );

  return controlInstance;
};

// Pass the control instance to the React-Leaflet createControlComponent hook:
const Geocoder = createControlComponent(createControlLayer);

export default Geocoder;

// class Geocoder extends MapControl {
//   createLeafletElement(props) {
//     const { ...options } = props;

//     this.control = new L.Control.Geocoder(options).on('markgeocode', e =>
//       options.handleGeocode(e.geocode.center)
//     );
//     return this.control;
//   }
// }

// export default createControlComponent(Geocoder);
