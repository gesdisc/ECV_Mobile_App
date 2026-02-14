import React, { useRef, useState } from "react";
import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
} from "@ionic/react";
import { location, square, chevronUpCircle } from "ionicons/icons";
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
import BoundingBox from "./BoundingBox";

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
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  const [mapOption, setMapOption] = useState<SpatialAreaType>(
    SpatialAreaType.COORDINATES,
  );

  const handleInputChange = (value: any) => {
    if (mapOption === SpatialAreaType.COORDINATES) {
      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.COORDINATES,
          value: {
            lat: convertToFixedFloat(value[0], 4).toString(),
            lng: convertToFixedFloat(value[1], 4).toString(),
          },
        },
      });
    }

    if (mapOption === SpatialAreaType.BOUNDING_BOX) {
      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.BOUNDING_BOX,
          value: {
            west: convertToFixedFloat(value[0], 4).toString(),
            south: convertToFixedFloat(value[1], 4).toString(),
            east: convertToFixedFloat(value[2], 4).toString(),
            north: convertToFixedFloat(value[3], 4).toString(),
          },
        },
      });
    }
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
            <IonIcon icon={chevronUpCircle}></IonIcon>
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
            {mapOption === SpatialAreaType.BOUNDING_BOX && <BoundingBox />}
            {mapOption === SpatialAreaType.COORDINATES && <LocationMarker />}
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
      <CoordinateInput
        value={staged.spatialArea || ctxParams.spatialArea}
        onInputChange={handleInputChange}
        mapOption={mapOption}
      />
    </IonPage>
  );
};

export default Location;
