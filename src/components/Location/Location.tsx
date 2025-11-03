import React, { useEffect, useRef } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import useDeviceLocation from "../../hooks/useDeviceLocation";

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
  const {
    params: ctxParams,
    requestUpdateParams,
    updateParams,
  } = useDataParams();
  const {
    latitude: deviceLat,
    longitude: deviceLon,
    permission,
    error,
    getLocation,
  } = useDeviceLocation();

  /**
   *
   * If user explicitly denied permission in the past (or blocked it
   * permanently), further requests will not trigger a prompt it’ll just fail with an error.
   *
   */
  useEffect(() => {
    const getDeviceLocation = async () => {
      try {
        await getLocation();
        console.log("ctxParams.lat", ctxParams.lat);
        console.log("deviceLat", deviceLat);
        console.log("permission", permission);
        if (deviceLat?.toFixed(5) !== ctxParams.lat.toFixed(5)) {
          console.log("deviceLat !== ctxParams.lat");
        }

        if (deviceLat?.toFixed(5) === ctxParams.lat.toFixed(5)) {
          console.log("deviceLat === ctxParams.lat");
        }

        if (error) {
          console.error(error);
          return;
        }

        // if (!deviceLat || !deviceLon) return;
        if (!deviceLat || !deviceLon) return;
        updateParams({
          lat: deviceLat,
          lon: deviceLon,
        });
      } catch (error) {
        console.error(error);
      }
    };
    getDeviceLocation();
  }, [deviceLat, deviceLon]);
  console.log("___permission", permission);
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
      {/* <p style={{ color: "white" }}>
        {deviceLat !== ctxParams.lat ? "different" : "same"}
      </p> */}
      <div>
        {
          /* prettier-ignore */
          (deviceLat?.toFixed(5) !== ctxParams.lat.toFixed(5)) &&
          permission === "granted" && (
            <p style={{ color: "white" }}>
              Using Default Coords. Do you want to use Your location?
            </p>
          )
        }
        {
          /* prettier-ignore */
          ( deviceLat?.toFixed(5) !== ctxParams.lat.toFixed(5)) &&
          permission === "granted" && (
            <button onClick={getLocation}>Use</button>
          )
        }
        {
          /* prettier-ignore */
          ( deviceLat?.toFixed(5) !== ctxParams.lat.toFixed(5)) &&
          permission === "denied" && (
            <p style={{ color: "white" }}>
              Using Default Coords. Go to your settings to allow the app to use
              your location.
            </p>
          )
        }
      </div>
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
        latitude={ctxParams.lat}
        longitude={ctxParams.lon}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      />
    </IonPage>
  );
};

export default Location;
