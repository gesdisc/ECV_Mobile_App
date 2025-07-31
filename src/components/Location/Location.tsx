import React, { useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonInput,
  IonItem,
  IonFooter,
} from "@ionic/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Header from "../Layout/Header";
import Banner from "../UI/Banner";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";

// Fix default marker icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Location: React.FC = () => {
  const { latitude, longitude, setLatitude, setLongitude } = useDataParams();

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

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat); // update latitude on map click
        setLongitude(e.latlng.lng); // update longitude on map click
      },
    });

    return <Marker position={[latitude, longitude]}></Marker>; // place marker at current location
  };

  // FIXME: gray areas after date state change
  const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        map.invalidateSize();
      }, 250);

      map.setView([latitude, longitude], map.getZoom(), {
        animate: true,
      });
      return () => clearTimeout(timeoutId);
    }, [map, latitude, longitude]);
    return null;
  };

  return (
    <IonPage>
      {/* <Header title="Region Selector" /> */}
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            center={[latitude, longitude]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
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
      <IonFooter>
        <IonToolbar>
          <div className={`${styles["input-container"]}`}>
            <IonItem>
              <IonLabel position="floating">Latitude:</IonLabel>
              <IonInput
                type="number"
                value={latitude.toString()}
                onIonChange={handleLatChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Longitude:</IonLabel>
              <IonInput
                type="number"
                value={longitude.toString()}
                onIonChange={handleLngChange}
              />
            </IonItem>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Location;
