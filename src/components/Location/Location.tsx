import React, { useRef } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";

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
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  const handleLatChange = (e: CustomEvent) => {
    const newLat = parseFloat(e.detail.value); // get new latitude
    if (!isNaN(newLat)) {
      requestUpdateParams({ lat: newLat });
    }
  };

  const handleLngChange = (e: CustomEvent) => {
    const newLng = parseFloat(e.detail.value); // get new longitude
    if (!isNaN(newLng)) {
      requestUpdateParams({ lon: newLng });
    }
  };

  return (
    <IonPage>
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            center={[ctxParams.lat, ctxParams.lon]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            <LocationMarker />
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
      <CoordinateInput
        latitude={staged.lat || ctxParams.lat}
        longitude={staged.lon || ctxParams.lon}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      />
    </IonPage>
  );
};

export default Location;
