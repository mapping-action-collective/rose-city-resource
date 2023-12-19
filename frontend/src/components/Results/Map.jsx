import React, { useState, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMapEvents
} from "react-leaflet";
import Geocoder from "./Geocoder.jsx";
import { MarkerClusterGroup } from "./MarkerClusterGroup.jsx";
import MediaQuery from "react-responsive";
import { mapDataBuilder } from "../../utils/api.js";
import { greenLMarker, blueLMarker, redLMarker } from "../../icons/mapIcons.js";
import config from "../../config.json";

const LocationMarker = function LocationMarker() {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      const radius = e.accuracy;
      const circle = L.circle(e.latlng, radius);
      circle.addTo(map);
    }
  });

  useEffect(() => {
    if (map) {
      map.locate();
    }
  }, [map]);

  return position === null ? null : (
    <Marker
      position={position}
      key={"locationmarker"}
      id={"locationmarker"}
      icon={redLMarker}
    >
      <Popup>You are here</Popup>
      <MediaQuery query="(min-width: 993px)">
        <Tooltip>
          <div className="popup-tooltip">
            <div>You are here</div>
          </div>
        </Tooltip>
      </MediaQuery>
    </Marker>
  );
};

const SimpleMap = ({ updateListing, selectedListing, data }) => {
  const [isLargeScreenSize, setIsLargeScreenSize] = useState(
    window.matchMedia("(min-width: 993px)")?.matches ?? false
  );

  useEffect(() => {
    window
      .matchMedia("(min-width: 993px)")
      .addEventListener("change", (e) => setIsLargeScreenSize(e.matches));
  }, []);

  const [viewport, setViewport] = useState({
    zoom: 10,
    center: [45.52345, -122.6762]
  });
  const [mapData, setMapData] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [leafletMap, setLeafletMap] = useState(null);

  const handleGeocode = (e) => {
    const coords = [e.lat, e.lng];
    setViewport(setViewport({ zoom: viewport.zoom, center: coords }));
  };

  /* Update the map when map data changes */
  useEffect(() => {
    if (data) {
      const builtData = mapDataBuilder(data);
      const { mapData: newMapData, center } = builtData;
      let zoom = config.map.default.zoom;

      let boundList = [];
      if (newMapData) {
        boundList = newMapData.map((item) => item.coords);
      }

      setMapData(newMapData);

      /* Set bounds and center */
      if (boundList.length > 0) {
        if (selectedListing) {
          if (newMapData.length > 0) {
            if (leafletMap) leafletMap.fitBounds(boundList);
          }
        } else {
          if (leafletMap) leafletMap.fitBounds(boundList);
        }

        setBounds(boundList);

        if (leafletMap) zoom = leafletMap.getBoundsZoom(boundList) - 1;
      }

      setViewport({ zoom, center });
    }
  }, [data]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* React to items on the map being selected (or set programmatically elsewhere) */
  useEffect(() => {
    if (leafletMap) {
      const selectedItem = data.filter((item) => item.id === selectedListing);
      if (Array.isArray(selectedItem)) {
        const lat = selectedItem[0]?.lat ?? 0;
        const lon = selectedItem[0]?.lon ?? 0;
        if (lat && lon) {
          const selectedCoords = [Number(lat), Number(lon)];
          leafletMap.flyTo(selectedCoords, 17);
        }
      }
    }
  }, [selectedListing]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const locationMarker = <LocationMarker />;

  return (
    <MapContainer
      center={viewport?.center ?? config.map.default.center}
      zoom={viewport?.zoom ?? config.map.default.zoom}
      minZoom={7}
      maxZoom={18} //set to 18 since the mapdisappears beyond that.
      scrollWheelZoom={isLargeScreenSize}
      tap={isLargeScreenSize}
      dragging={isLargeScreenSize}
      touchZoom={true}
      bounds={bounds}
      boundsOptions={{
        padding: [isLargeScreenSize ? 50 : 20, isLargeScreenSize ? 50 : 20]
      }}
      ref={setLeafletMap}
      viewPort={viewport}
    >
      {locationMarker}
      <TileLayer
        attribution=""
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MarkerClusterGroup showCoverageOnHover={false}>
        {mapData?.map((item, index) => {
          return (
            <Marker
              key={`${item.popup.id}-${index}`}
              position={item.coords}
              id={item.popup.id}
              icon={
                selectedListing === item.popup.id ? greenLMarker : blueLMarker
              }
            >
              <Popup>
                <div className="popup-container">
                  <div>{item.popup.listing}</div>
                  <div>{`${item.popup.street} ${item.popup.street2}`}</div>
                  <div
                    className="popup-show-details"
                    onClick={() => {
                      updateListing?.(item.popup.id, "popup");
                    }}
                  >
                    Show Details
                  </div>
                </div>
              </Popup>
              {isLargeScreenSize ? (
                <Tooltip>
                  <div className="popup-tooltip">
                    <div>{item.popup.listing}</div>
                  </div>
                </Tooltip>
              ) : null}
            </Marker>
          );
        })}
      </MarkerClusterGroup>
      <Geocoder
        placeholder={"Search address..."}
        handleGeocode={handleGeocode}
      />
    </MapContainer>
  );
};

export default SimpleMap;
