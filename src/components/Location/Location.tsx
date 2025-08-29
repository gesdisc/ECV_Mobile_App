import React, { useEffect, useRef } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { MapContainer, TileLayer, Rectangle } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { usePlotType, PLOT_TYPES } from "../../store/PlotTypeContext";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";

// Fix default marker icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Location: React.FC = () => {
  const mapRef = useRef(null);
  const { latitude, longitude, setLatitude, setLongitude } = useDataParams();
  const { plotType } = usePlotType();

  const handleLatChange = (e: CustomEvent) => {
    const newLat = parseFloat(e.detail.value); // get new latitude
    if (!isNaN(newLat)) {
      setLatitude(newLat); // update latitude
    }
  };

  const handleLngChange = (e: CustomEvent) => {
    const newLng = parseFloat(e.detail.value); // get new longitude
    if (!isNaN(newLng)) {
      setLongitude(newLng); // update longitude
    }
  };

  return (
    <IonPage>
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            center={[latitude, longitude]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            {plotType === PLOT_TYPES.POINT_BASED && <LocationMarker />}
            <MapResizer />
            {plotType === PLOT_TYPES.TIME_AVG && (
              <Rectangle
                bounds={[
                  [-13.47, -45],
                  [51.2, 126.4],
                ]}
              />
            )}
          </MapContainer>
        </div>
      </IonContent>
      <CoordinateInput
        latitude={latitude}
        longitude={longitude}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      />
    </IonPage>
  );
};

export default Location;
