import React, { useState, useEffect } from "react";
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import Geocoder from "./Geocoder";
import { MarkerClusterGroup } from './MarkerClusterGroup.js';
import MediaQuery from "react-responsive";
import { mapDataBuilder } from "../../utils/api";
import { greenLMarker, blueLMarker } from "../../icons/mapIcons.js";

const Markers = (props) => {
  const markers = [];

  const bindMarker = (ref) => {
    if (ref) {
      const marker = ref.leafletElement;
      markers.push(marker);
    }
  };

  const { mapData, updateListing, selectedListing } = props;

  if (mapData === null) return null

  return (
    <React.Fragment>
      <MarkerClusterGroup showCoverageOnHover={false}>
        {mapData.map((item, index) => {
          return (
            <Marker
              key={`${item.popup.id}-${index}`}
              ref={bindMarker}
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
                      updateListing(item.popup.id, "popup");
                    }}
                  >
                    Show Details
                  </div>
                </div>
              </Popup>
              <MediaQuery query="(min-width: 993px)">
                <Tooltip>
                  <div className="popup-tooltip">
                    <div>{item.popup.listing}</div>
                  </div>
                </Tooltip>
              </MediaQuery>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </React.Fragment>
  );
}

function LocationMarker(props) {
  const { map } = props;
  const [position, setPosition] = useState(null);

  useEffect(() => {
    map?.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      const radius = e.accuracy;
      const circle = L.circle(e.latlng, radius);
      circle.addTo(map);
      // bounding box: e.bounds.toBBoxString().split(",")
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
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
}

const SimpleMap = (props) => {
  const { updateListing, selectedListing, data } = props;

  const [zoom, setZoom] = useState(10);
  const [mapData, setMapData] = useState(null);
  const [bounds, setBounds] = useState([]);
  const [center, setCenter] = useState([45.52345, -122.6762]);
  const [leafletMap, setLeafletMap] = useState(null);

  const handleMapData = (data) => {
    //create mapData and bounds
    const { mapData, center } = mapDataBuilder(data);
    setMapData(mapData);

    let bounds = [];
    if (mapData) {
      bounds = mapData.map((item) => item.coords);
    }

    //if there are bounds, set them and the center
    if (bounds.length > 0) {
      if (leafletMap?.leafletElement) {
        const zoom = leafletMap.leafletElement.getBoundsZoom(bounds) - 1;
        setZoom(zoom);
      }
      setBounds(bounds);
      setCenter(center);
    }
  };

  const handleViewportChanged = () => {
    if (leafletMap?.leafletElement) {
      const zoom = leafletMap.leafletElement.getZoom();
      setZoom(zoom);
    }
  };

  const handleGeocode = (e) => {
    const coords = [e.lat, e.lng]
    setCenter(coords);
  };

  useEffect(() => {
    if (data) handleMapData(data);

    if (leafletMap) {
      const selectedItem = data.filter(item => item.id === selectedListing);
      if (Array.isArray(selectedItem)) {
        const lat = selectedItem[0]?.lat ?? 0
        const lon = selectedItem[0]?.lon ?? 0
        if (lat && lon) {
          const selectedCoords = [
            Number(lat),
            Number(lon),
          ];
          leafletMap.flyTo(selectedCoords, 17);
        }
      }
    }

  }, [props.data, props.selectedListing])

  if (bounds.length > 0) {
    return (
      <React.Fragment>
        <MediaQuery query="(min-width: 993px)">
          <MapContainer
            center={center}
            zoom={zoom}
            minZoom={8}
            maxZoom={18} //set to 18 since the mapdisappears beyond that.
            scrollWheelZoom={true}
            tap={true}
            dragging={true}
            touchZoom={true}
            ref={setLeafletMap}
          >
            <TileLayer attribution = '' url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' />
            <Markers
              mapData={mapData}
              updateListing={updateListing}
              selectedListing={selectedListing}
            />
            <Geocoder
              collapsed={false}
              placeholder={"Search address..."}
              handleGeocode={handleGeocode}
            />
            <LocationMarker map={leafletMap}/>
          </MapContainer>
        </MediaQuery>

        <MediaQuery query="(max-width: 992px)">
          <MapContainer
            center={center}
            zoom={zoom}
            minZoom={8}
            maxZoom={18} //set to 18 since the mapdisappears beyond that.
            scrollWheelZoom={false}
            tap={false}
            dragging={false}
            touchZoom={true}
            ref={setLeafletMap}
          >
            <TileLayer attribution = '' url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' />
            <Markers
              mapData={mapData}
              updateListing={updateListing}
              selectedListing={selectedListing}
            />
            <Geocoder
              placeholder={"Search address..."}
              handleGeocode={handleGeocode}
            />
            <LocationMarker map={leafletMap}/>
          </MapContainer>
        </MediaQuery>
      </React.Fragment>
    );
  }
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={8}
      maxZoom={18} //set to 18 since the mapdisappears beyond that.
      scrollWheelZoom={false}
      tap={false}
      dragging={false}
      touchZoom={true}
      onViewportChanged={handleViewportChanged}
      ref={setLeafletMap}
    >
      <TileLayer attribution = '' url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' />
      <Geocoder handleGeocode={handleGeocode} />
      <LocationMarker map={leafletMap}/>
    </MapContainer>
  );
}

export default SimpleMap;
