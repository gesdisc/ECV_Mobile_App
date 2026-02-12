import React, { useRef, useState } from "react";
import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
} from "@ionic/react";
import { location, square, chevronDownCircle } from "ionicons/icons";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import { SpatialAreaType } from "../../types/time-series.types";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";
import BBoxHandler from "./BBoxHandler";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";

// Fix default marker icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// FIXME: map not dragging after switching mapOptions from COORD to BBOX
// TODO: Bring back inputs
// TODO: RESTRICT AREA COORDINATES???
const Location: React.FC = () => {
  const mapRef = useRef(null);
  const [mapOption, setMapOption] = useState<SpatialAreaType>(
    SpatialAreaType.COORDINATES,
  );

  const handleLatChange = (e: CustomEvent) => {
    const newLat = e.detail.value; // get new latitude
    // requestUpdateParams({ lat: convertToFixedFloat(newLat, 4) });
    // requestUpdateParams({
    //   spatialArea: {
    //     type: SpatialAreaType.COORDINATES,
    //     value: {
    //       lat: convertToFixedFloat(newLat, 4).toString(),
    //       lng: convertToFixedFloat(
    //         ctxParams.spatialArea.value.lng,
    //         4,
    //       ).toString(),
    //     },
    //   },
    // });
  };

  const handleLngChange = (e: CustomEvent) => {
    const newLng = e.detail.value; // get new longitude
    // requestUpdateParams({ lon: convertToFixedFloat(newLng, 4) });
  };

  const pointOptionHandler = () => {
    setMapOption(SpatialAreaType.COORDINATES);
  };

  const bboxOptionHandler = () => {
    setMapOption(SpatialAreaType.BOUNDING_BOX);
  };

  return (
    <IonPage>
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <IonFab slot="fixed" vertical="bottom" horizontal="start" edge={true}>
          <IonFabButton>
            <IonIcon icon={chevronDownCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton onClick={bboxOptionHandler}>
              <IonIcon icon={square}></IonIcon>
            </IonFabButton>
            <IonFabButton onClick={pointOptionHandler}>
              <IonIcon icon={location}></IonIcon>
            </IonFabButton>
          </IonFabList>
        </IonFab>

        <div className={styles["map-container"]}>
          <MapContainer
            // center={[ctxParams.lat, ctxParams.lon]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            {mapOption === SpatialAreaType.BOUNDING_BOX && <BBoxHandler />}
            {mapOption === SpatialAreaType.COORDINATES && <LocationMarker />}
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
      {/* <CoordinateInput
        latitude={staged.lat || ctxParams.lat}
        longitude={staged.lon || ctxParams.lon}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      /> */}
    </IonPage>
  );
};

export default Location;
