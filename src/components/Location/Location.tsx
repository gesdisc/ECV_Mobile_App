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
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Rectangle,
  useMapEvents,
  Marker,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import { Coordinates, SpatialAreaType } from "../../types/time-series.types";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";
import BoundingBox from "./BoundingBox";
import DrawingFeatures from "./DrawingFeatures";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";
import "leaflet-draw/dist/leaflet.draw.css";
import MapInput from "./MapInput";

// Fix default marker icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// FIXME: dropping a pointer outside of the map bounding box drops is not wokring properly (no bug when removing coordinate input )
// FIXME: map not dragging after switching mapOptions from COORD to BBOX
// TODO: Bring back inputs
// TODO: RESTRICT AREA COORDINATES???
const Location: React.FC = () => {
  const mapRef = useRef(null);
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [mapOption, setMapOption] = useState<SpatialAreaType>(
    staged.spatialArea?.type || ctxParams.spatialArea.type
  );

  const handleInputChange = (value: number[]) => {
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
      return;
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

  // const pointOptionHandler = () => {
  //   setMapOption(SpatialAreaType.COORDINATES);
  // };

  // const bboxOptionHandler = () => {
  //   setMapOption(SpatialAreaType.BOUNDING_BOX);
  // };

  const mapOptionChangeHandler = (option: SpatialAreaType) => {
    setMapOption(option);
  };

  return (
    <IonPage>
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            zoomSnap={1}
            zoomDelta={1}
            worldCopyJump={false}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              noWrap={true}
              bounds={[
                [-90, -180],
                [90, 180],
              ]}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            {/* {mapOption === SpatialAreaType.BOUNDING_BOX && <BoundingBox />} */}
            {/* {mapOption === SpatialAreaType.COORDINATES && <LocationMarker />} */}

            <DrawingFeatures onMapOptionChange={mapOptionChangeHandler} />
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
      {/* <CoordinateInput
        value={staged.spatialArea || ctxParams.spatialArea}
        onInputChange={handleInputChange}
        mapOption={mapOption}
      /> */}
      <MapInput
        mapOption={mapOption}
        value={staged.spatialArea?.value || ctxParams.spatialArea.value}
        onChange={handleInputChange}
      />
    </IonPage>
  );
};

export default Location;
