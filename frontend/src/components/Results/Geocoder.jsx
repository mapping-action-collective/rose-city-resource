import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { redLMarker } from "../../icons/mapIcons.js";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";

function LeafletControlGeocoder(props) {
  const { setViewport } = props;
  const map = useMap();

  useEffect(() => {
    var geocoder = L.Control.Geocoder.nominatim();
    if (L.Control.Geocoder["Nominatim"]) {
      geocoder = L.Control.Geocoder["Nominatim"]();
    }

    L.Control.geocoder({
      query: "",
      placeholder: "Search address...",
      defaultMarkGeocode: false,
      geocoder
    })
      .on("markgeocode", function (e) {
        L.marker(e.geocode.center, { icon: redLMarker })
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        map.fitBounds(e.geocode.bbox);
        setViewport({
          center: e.geocode.center,
          zoom: map.getBoundsZoom(e.geocode.bbox)
        });
      })
      .addTo(map);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default LeafletControlGeocoder;
